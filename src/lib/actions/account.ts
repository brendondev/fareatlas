"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/dal";
import { prisma } from "@/lib/db";

/**
 * Account mutations. Every one re-verifies the session with requireUser rather
 * than trusting the proxy — a Server Action is a POST to whatever page invoked
 * it, and proxy matchers don't reliably cover that.
 */

export async function followProgram(formData: FormData): Promise<void> {
  const { user } = await requireUser("/account/programs");
  const programId = String(formData.get("programId") ?? "");
  if (!programId) return;

  try {
    // Unique on [userId, programId], so a double submit is a no-op.
    await prisma.userProgram.upsert({
      where: { userId_programId: { userId: user!.id, programId } },
      create: { userId: user!.id, programId },
      update: {},
    });
  } catch (error) {
    console.error("[account] followProgram", error);
  }

  revalidatePath("/account/programs");
}

export async function unfollowProgram(formData: FormData): Promise<void> {
  const { user } = await requireUser("/account/programs");
  const programId = String(formData.get("programId") ?? "");
  if (!programId) return;

  try {
    await prisma.userProgram.deleteMany({
      where: { userId: user!.id, programId },
    });
  } catch (error) {
    console.error("[account] unfollowProgram", error);
  }

  revalidatePath("/account/programs");
}

export async function deleteWatch(formData: FormData): Promise<void> {
  const { user } = await requireUser("/account/watches");
  const watchId = String(formData.get("watchId") ?? "");
  if (!watchId) return;

  try {
    // Scoped to userId so one user can't delete another's watch by id.
    await prisma.awardWatch.deleteMany({
      where: { id: watchId, userId: user!.id },
    });
  } catch (error) {
    console.error("[account] deleteWatch", error);
  }

  revalidatePath("/account/watches");
  revalidatePath("/account");
}
