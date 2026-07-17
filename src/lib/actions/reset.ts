"use server";

import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isAuthConfigured } from "@/lib/auth-config";
import { prisma } from "@/lib/db";
import { isEmailConfigured, sendEmail } from "@/lib/email";
import { clientIp, consume, retryAfterLabel } from "@/lib/rate-limit";
import { createSession } from "@/lib/session";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const BCRYPT_COST = 11;

function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "http://localhost:3000"
  );
}

export type ForgotState =
  | { ok: true; message: string }
  | { ok: false; message: string }
  | undefined;

const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .email("That doesn't look like an email address.")
  .transform((v) => v.toLowerCase());

/**
 * Always reports the same thing whether or not the address exists — otherwise
 * the response enumerates who has an account. The email only goes out to real
 * users.
 */
export async function requestReset(
  _state: ForgotState,
  formData: FormData,
): Promise<ForgotState> {
  if (!isAuthConfigured()) {
    return { ok: false, message: "Accounts aren't available on this deployment." };
  }

  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]!.message };
  }
  const email = parsed.data;

  const ip = await clientIp();
  const limit = await consume(`reset:ip:${ip}`, 5, 60 * 60 * 1000);
  if (!limit.ok) {
    return {
      ok: false,
      message: `Too many requests. Try again in ${retryAfterLabel(limit.retryAfterMs)}.`,
    };
  }

  // Honesty about the gap: with no email provider, a reset link can't be
  // delivered. Say so rather than claiming an email is on the way.
  if (!isEmailConfigured()) {
    return {
      ok: false,
      message:
        "Password reset by email isn't switched on yet. Contact us and we'll help.",
    };
  }

  const generic = {
    ok: true as const,
    message: "If that email has an account, a reset link is on its way.",
  };

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (user) {
      const raw = randomBytes(32).toString("base64url");
      await prisma.authToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(raw),
          purpose: "reset",
          expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
        },
      });

      const link = `${siteUrl()}/reset/${raw}`;
      await sendEmail({
        to: email,
        subject: "Reset your FareAtlas password",
        text: `Reset your password: ${link}\n\nThis link expires in one hour. If you didn't ask for this, ignore this email.`,
        html: `<p>Reset your FareAtlas password:</p><p><a href="${link}">${link}</a></p><p>This link expires in one hour. If you didn't ask for this, you can ignore this email.</p>`,
      });
    }
  } catch (error) {
    console.error("[reset] requestReset", error);
    // Still return the generic message — don't leak failure detail.
  }

  return generic;
}

export type ResetState =
  | { ok: false; errors?: Record<string, string[]>; message?: string }
  | undefined;

const passwordSchema = z
  .string()
  .min(10, "Use at least 10 characters.")
  .max(200, "That's too long.");

/**
 * Consumes a reset token and sets a new password. The token is single-use and
 * time-bound; only its sha256 is stored, so a database leak can't be replayed.
 */
export async function performReset(
  _state: ResetState,
  formData: FormData,
): Promise<ResetState> {
  if (!isAuthConfigured()) {
    return { ok: false, message: "Accounts aren't available on this deployment." };
  }

  const rawToken = String(formData.get("token") ?? "");
  const parsed = passwordSchema.safeParse(formData.get("password"));
  if (!parsed.success) {
    return { ok: false, errors: { password: [parsed.error.issues[0]!.message] } };
  }

  const invalid = {
    ok: false as const,
    message: "This reset link is invalid or has expired. Request a new one.",
  };

  let userId: string;

  try {
    const token = await prisma.authToken.findUnique({
      where: { tokenHash: hashToken(rawToken) },
    });

    if (
      !token ||
      token.purpose !== "reset" ||
      token.usedAt ||
      token.expiresAt < new Date()
    ) {
      return invalid;
    }

    const passwordHash = await bcrypt.hash(parsed.data, BCRYPT_COST);

    // Mark used and set the password together; also clear any lockout.
    await prisma.$transaction([
      prisma.authToken.update({
        where: { id: token.id },
        data: { usedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: token.userId },
        data: { passwordHash, failedLogins: 0, lockedUntil: null },
      }),
    ]);

    userId = token.userId;
  } catch (error) {
    console.error("[reset] performReset", error);
    return { ok: false, message: "Could not reset your password. Please try again." };
  }

  // Sign them straight in — they just proved control of the inbox.
  await createSession(userId);
  redirect("/account");
}
