import { Resend } from "resend";
import { SITE_NAME } from "@/lib/constants";

let client: Resend | null = null;

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  if (!client) {
    client = new Resend(process.env.RESEND_API_KEY);
  }
  return client;
}

export function getOrderNotifyEmail() {
  return process.env.ORDER_NOTIFY_EMAIL?.trim() || null;
}

export async function sendEmail({
  to,
  subject,
  html,
  bcc,
}: {
  to: string | string[];
  subject: string;
  html: string;
  bcc?: string | string[] | null;
}) {
  if (!isEmailConfigured()) {
    console.warn("[email] Skipped — set RESEND_API_KEY and EMAIL_FROM");
    return { skipped: true as const };
  }

  const from = process.env.EMAIL_FROM!;
  const bccList = [bcc]
    .flat()
    .filter((address): address is string => Boolean(address?.trim()));

  const { data, error } = await getResend().emails.send({
    from,
    to,
    subject,
    html,
    ...(bccList.length ? { bcc: bccList } : {}),
  });

  if (error) {
    throw new Error(error.message || "Failed to send email");
  }

  return { skipped: false as const, id: data?.id };
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function emailBrandName() {
  return SITE_NAME;
}
