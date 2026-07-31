import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { SITE_NAME } from "@/lib/constants";
import { canUseDemoCheckout, isRazorpayConfigured } from "@/lib/razorpay";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Checkout",
  description: `Complete your order at ${SITE_NAME}.`,
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const session = await auth();
  const razorpayOk = isRazorpayConfigured();
  const demoMode = canUseDemoCheckout(session?.user?.role);
  const checkoutAvailable = razorpayOk || demoMode;

  return (
    <section className="section-padding">
      <div className="container-tight">
        <div className="mb-10 max-w-xl">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--foreground)]">
            Checkout
          </h1>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            {!checkoutAvailable
              ? "Online payment isn’t set up yet — guest checkout will open once Razorpay is connected."
              : demoMode
                ? "Staff demo checkout — orders are marked paid without Razorpay (guests cannot use this)."
                : "Secure payment powered by Razorpay (UPI, cards & netbanking)."}
          </p>
        </div>

        {checkoutAvailable ? (
          <CheckoutForm demoMode={demoMode} />
        ) : (
          <div className="max-w-md rounded-2xl border border-[var(--border)] bg-[var(--muted)] p-6">
            <p className="text-sm text-[var(--foreground)]">
              Thanks for your interest. Checkout for customers will be available
              after payment setup. You can keep browsing the shop in the meantime.
            </p>
            <Button asChild className="mt-4">
              <Link href="/shop">Back to shop</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
