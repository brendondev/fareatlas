"use server";

import { prisma } from "@/lib/db";

export type UnsubState = { done: boolean; error?: string } | undefined;

/**
 * Sets a watch to unsubscribed by its opaque token. Idempotent. Runs as a POST
 * (from a confirm button), never on the GET that email link-scanners follow.
 */
export async function unsubscribeWatch(
  _state: UnsubState,
  formData: FormData,
): Promise<UnsubState> {
  const token = String(formData.get("token") ?? "").trim();
  if (!token) return { done: false, error: "Missing token." };

  try {
    const result = await prisma.awardWatch.updateMany({
      where: { unsubToken: token },
      data: { status: "unsubscribed" },
    });
    // updateMany count 0 means no such token — report done anyway so the page
    // doesn't reveal whether a token is valid.
    void result;
    return { done: true };
  } catch (error) {
    console.error("[unsubscribe]", error);
    return { done: false, error: "Could not unsubscribe. Please try again." };
  }
}
