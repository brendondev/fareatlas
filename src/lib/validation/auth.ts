import { z } from "zod";

/**
 * Zod is scoped to auth and account forms only.
 *
 * The rest of the codebase hand-rolls regex validation (see
 * `api/awards/search/route.ts`) and stays that way — this is not a licence to
 * retrofit. The reason it earns its place here: `useActionState` needs errors
 * keyed by field name, and hand-rolling that across the auth forms is more
 * code than the dependency.
 */

const email = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .email("That doesn't look like an email address.")
  .transform((value) => value.toLowerCase());

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .max(80, "Keep it under 80 characters.")
    .optional()
    .transform((value) => (value ? value : undefined)),
  email,
  // Length is the control that matters. Composition rules push people toward
  // "Password1!" and are not worth the conversion cost.
  password: z
    .string()
    .min(10, "Use at least 10 characters.")
    .max(200, "That's too long."),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required."),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

/** Shape returned by every auth action, consumed by `useActionState`. */
export type AuthFormState = {
  errors?: Record<string, string[] | undefined>;
  message?: string;
} | undefined;

/** Flattens a ZodError into the field-keyed shape the forms render. */
export function fieldErrors(error: z.ZodError): Record<string, string[]> {
  const flat: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    (flat[key] ??= []).push(issue.message);
  }
  return flat;
}
