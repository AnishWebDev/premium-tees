import { createHmac, timingSafeEqual } from "crypto";

function accessSecret() {
  return process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "";
}

/** Short HMAC token so guest success/email links aren't world-readable by order number alone. */
export function createOrderAccessToken(orderNumber: string) {
  const secret = accessSecret();
  if (!secret) {
    throw new Error("AUTH_SECRET is required to create order access tokens");
  }
  return createHmac("sha256", secret)
    .update(`order-access:${orderNumber}`)
    .digest("hex")
    .slice(0, 32);
}

export function verifyOrderAccessToken(
  orderNumber: string,
  token: string | null | undefined
) {
  if (!token || !accessSecret()) return false;
  const expected = createOrderAccessToken(orderNumber);
  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(token);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function orderSuccessPath(orderNumber: string) {
  const key = createOrderAccessToken(orderNumber);
  return `/checkout/success?order=${encodeURIComponent(orderNumber)}&key=${encodeURIComponent(key)}`;
}
