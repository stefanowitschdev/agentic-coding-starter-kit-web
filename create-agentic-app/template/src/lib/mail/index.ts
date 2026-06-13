import type { ReactElement } from "react";
import { Resend } from "resend";

/**
 * Provider-agnostic transactional mailer.
 *
 * Uses Resend when `RESEND_API_KEY` is configured. When it is not (e.g. local
 * development), it falls back to logging the rendered email to the console so
 * the auth flows keep working without an email account.
 *
 * To swap providers, replace the Resend implementation in `send()` — the
 * `sendMail()` interface stays the same for the rest of the app.
 */

const apiKey = process.env.RESEND_API_KEY;
const fromAddress = process.env.EMAIL_FROM || "onboarding@resend.dev";

const resend = apiKey ? new Resend(apiKey) : null;

export interface SendMailOptions {
  /** Recipient email address */
  to: string;
  /** Email subject line */
  subject: string;
  /** React Email element to render as the HTML body */
  react: ReactElement;
}

/**
 * Sends a transactional email.
 *
 * @throws if the configured provider returns an error.
 */
export async function sendMail({
  to,
  subject,
  react,
}: SendMailOptions): Promise<void> {
  if (!resend) {
    // No provider configured — log to the console (development fallback).
    const { render } = await import("@react-email/render");
    const text = await render(react, { plainText: true });
    // eslint-disable-next-line no-console
    console.log(
      `\n${"=".repeat(60)}\nEMAIL (no RESEND_API_KEY — console fallback)\nTo: ${to}\nSubject: ${subject}\n${"-".repeat(60)}\n${text}\n${"=".repeat(60)}\n`
    );
    return;
  }

  const { error } = await resend.emails.send({
    from: fromAddress,
    to,
    subject,
    react,
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
}
