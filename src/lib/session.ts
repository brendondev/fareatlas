import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { isAuthConfigured } from "./auth-config";

export const SESSION_COOKIE = "fa_session";

const SESSION_DAYS = 7;
const SESSION_MS = SESSION_DAYS * 24 * 60 * 60 * 1000;

/**
 * The token carries a user id and nothing else.
 *
 * Notably it does NOT carry `tier`. Premium is granted by hand in the Neon
 * console (there is no billing), so a tier baked into a 7-day token means
 * flipping the flag and the customer still being locked out. The DAL reads
 * tier from the database instead, memoised per render by React `cache()` —
 * one indexed primary-key lookup, on requests that are usually about to call
 * Seats.aero over the network anyway. Revocation comes free with it.
 */
export type SessionPayload = {
  userId: string;
  expiresAt: string;
};

function encodedKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET?.trim();

  // Fail loudly at the boundary rather than signing with a weak or empty key.
  // A silently-weak secret is how JWT sessions become forgeable.
  if (!secret) {
    throw new Error(
      "SESSION_SECRET is not set. Auth routes should be gated on isAuthConfigured().",
    );
  }
  if (secret.length < 32) {
    throw new Error(
      `SESSION_SECRET must be at least 32 characters (got ${secret.length}). Generate one with: openssl rand -base64 32`,
    );
  }

  return new TextEncoder().encode(secret);
}

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(encodedKey());
}

/** Returns null on any failure — tampered, expired, wrong key, unset secret. */
export async function decrypt(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token || !isAuthConfigured()) return null;

  try {
    const { payload } = await jwtVerify(token, encodedKey(), {
      algorithms: ["HS256"],
    });

    const userId = payload.userId;
    if (typeof userId !== "string" || !userId) return null;

    return {
      userId,
      expiresAt:
        typeof payload.expiresAt === "string" ? payload.expiresAt : "",
    };
  } catch {
    // Invalid tokens are routine (expired, cleared secret, someone poking).
    // Anonymous is the correct answer; don't leak detail to logs on every hit.
    return null;
  }
}

/**
 * Must be called from a Server Action or Route Handler. Next cannot set
 * cookies during a Server Component render — HTTP does not allow it once
 * streaming has begun.
 */
export async function createSession(userId: string): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_MS);
  const token = await encrypt({ userId, expiresAt: expiresAt.toISOString() });
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
