import { isEmailConfigured } from "@/lib/email";
import { isRazorpayConfigured } from "@/lib/razorpay";

export function getSystemStatus() {
  const razorpayConfigured = isRazorpayConfigured();
  return {
    /** Staff (Admin / SuperAdmin) can place dummy paid orders until Razorpay is live */
    demoCheckout: !razorpayConfigured,
    razorpayConfigured,
    emailConfigured: isEmailConfigured(),
    orderNotifyEmail: Boolean(process.env.ORDER_NOTIFY_EMAIL?.trim()),
    appUrl: process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL || null,
  };
}
