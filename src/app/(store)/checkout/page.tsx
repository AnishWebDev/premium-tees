import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getSiteIdentity } from "@/lib/site-identity";
import { canUseDemoCheckout, isRazorpayConfigured } from "@/lib/razorpay";
import { getStoreSettings, isLeadCaptureMode } from "@/lib/store-settings";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { Button } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteIdentity();
  return {
    title: "Checkout",
    description: `Complete your order at ${site.name}.`,
    robots: { index: false, follow: false },
  };
}

export default async function CheckoutPage() {
  const session = await auth();
  const storeSettings = await getStoreSettings();
  const leadCapture = isLeadCaptureMode(storeSettings);
  const razorpayOk = isRazorpayConfigured();
  const demoMode = canUseDemoCheckout(session?.user?.role);
  const checkoutAvailable = leadCapture || razorpayOk || demoMode;

  return (
    <section className="section-padding">
      <div className="container-tight">
        <div className="mb-10 max-w-xl">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--foreground)]">
            {leadCapture ? "Submit your order" : "Checkout"}
          </h1>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            {!checkoutAvailable
              ? "Online payment isn’t set up yet — guest checkout will open once Razorpay is connected."
              : leadCapture
                ? "Tell us where to send your tees — no payment required yet. We’ll reach out to confirm your order."
                : demoMode
                  ? "Staff demo checkout — orders are marked paid without Razorpay (guests cannot use this)."
                  : "Secure payment powered by Razorpay (UPI, cards & netbanking)."}
          </p>
        </div>

        {checkoutAvailable ? (
          <CheckoutForm
            mode={leadCapture ? "lead" : demoMode ? "demo" : "payment"}
          />
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
