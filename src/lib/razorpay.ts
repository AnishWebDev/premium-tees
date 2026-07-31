import Razorpay from "razorpay";
import crypto from "crypto";

export function isRazorpayConfigured() {
  return Boolean(
    process.env.RAZORPAY_KEY_ID?.startsWith("rzp_") &&
      process.env.RAZORPAY_KEY_SECRET &&
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.startsWith("rzp_")
  );
}

/**
 * Legacy env flag. Prefer staff-only demo via {@link canUseDemoCheckout}.
 * Kept for system-status / older docs; no longer opens checkout to guests.
 */
export function isDemoCheckoutEnabled() {
  return process.env.DEMO_CHECKOUT === "true";
}

/** Staff can place dummy paid orders when Razorpay keys are missing. */
export function canUseDemoCheckout(role?: string | null) {
  return (
    !isRazorpayConfigured() &&
    (role === "ADMIN" || role === "SUPERADMIN")
  );
}

let client: Razorpay | null = null;

export function getRazorpay() {
  if (!isRazorpayConfigured()) {
    throw new Error("Razorpay is not configured");
  }
  if (!client) {
    client = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }
  return client;
}

/** Razorpay amounts are in paise (₹1 = 100). */
export function toPaise(amountInRupees: number) {
  return Math.round(amountInRupees * 100);
}

export async function createRazorpayOrder({
  amountInRupees,
  receipt,
  notes,
}: {
  amountInRupees: number;
  receipt: string;
  notes?: Record<string, string>;
}) {
  return getRazorpay().orders.create({
    amount: toPaise(amountInRupees),
    currency: "INR",
    receipt: receipt.slice(0, 40),
    notes,
  });
}

export function verifyPaymentSignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const body = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return expected === signature;
}

export function verifyWebhookSignature(rawBody: string, signature: string | null) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  return expected === signature;
}
