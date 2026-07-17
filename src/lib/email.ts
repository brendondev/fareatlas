import "server-only";

/**
 * Email sender. No-ops with a warning when RESEND_API_KEY or EMAIL_FROM are
 * unset, rather than pretending to send — the degrade-honestly rule. Callers
 * check the returned `sent` and tell the user the truth.
 *
 * `resend` is imported dynamically so the package isn't required to exist for
 * the app to build or run without email configured.
 */

export function isEmailConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() && process.env.EMAIL_FROM?.trim(),
  );
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ sent: boolean }> {
  if (!isEmailConfigured()) {
    console.warn(
      `[email] not configured — would have sent "${params.subject}" to ${params.to}`,
    );
    return { sent: false };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });
    return { sent: true };
  } catch (error) {
    console.error("[email] send failed", error);
    return { sent: false };
  }
}
