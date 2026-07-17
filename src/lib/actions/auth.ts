"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { isAuthConfigured } from "@/lib/auth-config";
import { prisma } from "@/lib/db";
import { clientIp, consume, retryAfterLabel } from "@/lib/rate-limit";
import { createSession, deleteSession } from "@/lib/session";
import {
  type AuthFormState,
  fieldErrors,
  loginSchema,
  registerSchema,
} from "@/lib/validation/auth";

/**
 * Measured on a dev machine with bcryptjs: cost 10 ~300ms, 11 ~570ms,
 * 12 ~1070ms. Login pays this even for addresses that don't exist (see the
 * dummy compare below), so cost 12 would put every sign-in over a second and
 * double the billed lambda time. 11 sits above the OWASP floor of 10.
 */
const BCRYPT_COST = 11;

/**
 * A real bcrypt hash of random bytes, compared against when no user matches so
 * that a missing account costs the same wall-clock time as a wrong password.
 * Without it, response latency enumerates the user base.
 */
const DUMMY_HASH =
  "$2b$12$n9klNESdy.wdq1/ZrPlEf.AP8KzVk823cSVOz7kTLKZe0/KyAPF5O";

const WINDOW_MS = 15 * 60 * 1000;
const LOGIN_ATTEMPTS = 5;
const REGISTER_ATTEMPTS = 3;
const REGISTER_WINDOW_MS = 60 * 60 * 1000;
const LOCKOUT_THRESHOLD = 10;
const LOCKOUT_MS = 15 * 60 * 1000;

const GENERIC_CREDENTIALS = "Invalid email or password.";
const UNAVAILABLE =
  "Accounts aren't available on this deployment. Check back soon.";

/**
 * Only same-origin absolute paths. Without this, `?next=https://evil.example`
 * turns the login form into an open redirect.
 */
function safeNext(value: FormDataEntryValue | null): string {
  const raw = typeof value === "string" ? value : "";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/account";
  return raw;
}

/**
 * Hand a signed-up user the watches they created anonymously with the same
 * address. Idempotent, and scoped to rows nobody owns yet.
 */
async function claimOrphanWatches(userId: string, email: string) {
  try {
    await prisma.awardWatch.updateMany({
      where: { email, userId: null },
      data: { userId },
    });
  } catch (error) {
    // Never block a sign-in over this.
    console.error("[auth] claiming watches failed", error);
  }
}

export async function register(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!isAuthConfigured()) return { message: UNAVAILABLE };

  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const { email, password, name } = parsed.data;
  const next = safeNext(formData.get("next"));

  const ip = await clientIp();
  const limit = await consume(
    `register:ip:${ip}`,
    REGISTER_ATTEMPTS,
    REGISTER_WINDOW_MS,
  );
  if (!limit.ok) {
    return {
      message: `Too many sign-ups from this network. Try again in ${retryAfterLabel(limit.retryAfterMs)}.`,
    };
  }

  let userId: string;

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      return { errors: { email: ["An account with this email already exists."] } };
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
    const user = await prisma.user.create({
      data: { email, passwordHash, name },
      select: { id: true },
    });

    userId = user.id;
    await claimOrphanWatches(userId, email);
    await createSession(userId);
  } catch (error) {
    console.error("[auth] register failed", error);
    return { message: "Could not create your account. Please try again." };
  }

  // Outside the try: redirect throws a control-flow signal that a catch would
  // swallow.
  redirect(next);
}

export async function login(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (!isAuthConfigured()) return { message: UNAVAILABLE };

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const { email, password } = parsed.data;
  const next = safeNext(formData.get("next"));

  // Both dimensions are needed: an IP-only limit is defeated by a botnet, and
  // an email-only limit is defeated by spraying one password across accounts.
  const ip = await clientIp();
  const ipLimit = await consume(`login:ip:${ip}`, LOGIN_ATTEMPTS, WINDOW_MS);
  if (!ipLimit.ok) {
    return {
      message: `Too many attempts from this network. Try again in ${retryAfterLabel(ipLimit.retryAfterMs)}.`,
    };
  }

  const emailLimit = await consume(
    `login:email:${email}`,
    LOGIN_ATTEMPTS,
    WINDOW_MS,
  );
  if (!emailLimit.ok) {
    return {
      message: `Too many attempts for this account. Try again in ${retryAfterLabel(emailLimit.retryAfterMs)}.`,
    };
  }

  let userId: string;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        passwordHash: true,
        failedLogins: true,
        lockedUntil: true,
      },
    });

    if (user?.lockedUntil && user.lockedUntil > new Date()) {
      return {
        message: `This account is temporarily locked. Try again in ${retryAfterLabel(user.lockedUntil.getTime() - Date.now())}.`,
      };
    }

    // Always compare, even with no user, so both paths cost the same.
    const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

    if (!user || !valid) {
      if (user) {
        const failed = user.failedLogins + 1;
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLogins: failed,
            lockedUntil:
              failed >= LOCKOUT_THRESHOLD
                ? new Date(Date.now() + LOCKOUT_MS)
                : null,
          },
        });
      }
      // Same message either way: never confirm whether an address is registered.
      return { message: GENERIC_CREDENTIALS };
    }

    if (user.failedLogins > 0 || user.lockedUntil) {
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLogins: 0, lockedUntil: null },
      });
    }

    userId = user.id;
    await claimOrphanWatches(userId, email);
    await createSession(userId);
  } catch (error) {
    console.error("[auth] login failed", error);
    return { message: "Could not sign you in. Please try again." };
  }

  redirect(next);
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/");
}
