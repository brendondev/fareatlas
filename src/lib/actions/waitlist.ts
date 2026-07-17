"use server";

import { z } from "zod";
import { getViewer } from "@/lib/dal";
import { isDatabaseConfigured, prisma } from "@/lib/db";
import { clientIp, consume } from "@/lib/rate-limit";
import { fieldErrors } from "@/lib/validation/auth";

export type WaitlistState =
  | { ok: true; message: string }
  | { ok: false; errors?: Record<string, string[] | undefined>; message?: string }
  | undefined;

const schema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("That doesn't look like an email address.")
    .transform((value) => value.toLowerCase()),
  reason: z.string().trim().max(300).optional(),
});

/**
 * Premium interest. Replaces the previous /pricing behaviour, which pushed
 * people through AwardWatchForm — so a "join the waitlist" click silently
 * created a route watch for a route they never asked about.
 */
export async function joinWaitlist(
  _state: WaitlistState,
  formData: FormData,
): Promise<WaitlistState> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error) };
  }

  const { email, reason } = parsed.data;

  if (!isDatabaseConfigured()) {
    // Say so rather than returning a cheerful lie. The old watch endpoint
    // answered `ok: true` while persisting nothing.
    return {
      ok: false,
      message: "The waitlist isn't available on this deployment yet.",
    };
  }

  const ip = await clientIp();
  const limit = await consume(`waitlist:ip:${ip}`, 5, 60 * 60 * 1000);
  if (!limit.ok) {
    return { ok: false, message: "Too many sign-ups from this network." };
  }

  try {
    const viewer = await getViewer();

    await prisma.premiumWaitlist.upsert({
      where: { email },
      create: { email, reason, userId: viewer.user?.id },
      update: { reason, userId: viewer.user?.id },
    });

    return {
      ok: true,
      message: "You're on the list. We'll email you when Premium opens.",
    };
  } catch (error) {
    console.error("[waitlist]", error);
    return { ok: false, message: "Could not save that. Please try again." };
  }
}
