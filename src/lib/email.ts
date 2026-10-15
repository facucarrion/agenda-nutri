import "server-only";

import { Resend } from "resend";

type Message = { to: string; subject: string; html: string; text: string };

// Returns true when Resend accepted the message. Never logs recipients or
// content (patient data, Ley 25.326).
export async function sendEmail(message: Message): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    console.error("email: RESEND_API_KEY or EMAIL_FROM is not set");
    return false;
  }

  try {
    const { error } = await new Resend(apiKey).emails.send({
      from,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });

    if (error) {
      console.error("email: send failed", error.name);
      return false;
    }
    return true;
  } catch {
    console.error("email: send threw");
    return false;
  }
}

// Absolute base URL for links in emails. Set NEXT_PUBLIC_SITE_URL in
// production; the request origin is only a development fallback.
export function siteUrl(requestOrigin: string) {
  return (process.env.NEXT_PUBLIC_SITE_URL || requestOrigin).replace(/\/$/, "");
}
