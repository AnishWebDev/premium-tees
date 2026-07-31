import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms of service for ${SITE_NAME}.`,
};

export default function TermsPage() {
  return (
    <section className="section-padding">
      <div className="container-tight">
        <article className="prose-neutral mx-auto max-w-3xl">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">Last updated: July 31, 2026</p>

          <div className="mt-10 space-y-8 text-sm leading-relaxed text-[var(--muted-foreground)]">
            <section>
              <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
                Agreement
              </h2>
              <p className="mt-3">
                By accessing or using the {SITE_NAME} website, you agree to be bound by these
                Terms of Service. If you do not agree, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
                Products & pricing
              </h2>
              <p className="mt-3">
                We strive to display accurate product descriptions, images, and pricing.
                We reserve the right to correct errors, modify prices, and limit quantities
                at any time. All prices are in INR (₹) unless otherwise stated.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
                Orders & payment
              </h2>
              <p className="mt-3">
                Placing an order constitutes an offer to purchase. We may accept or decline
                orders at our discretion. Payment is processed securely through Razorpay. You
                represent that you are authorized to use the payment method provided.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
                Shipping & delivery
              </h2>
              <p className="mt-3">
                Estimated delivery times are provided at checkout and are not guaranteed.
                Risk of loss passes to you upon delivery to the carrier. International
                orders may be subject to customs duties and taxes, which are the
                customer&apos;s responsibility.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
                Returns & refunds
              </h2>
              <p className="mt-3">
                Unworn items with tags attached may be returned within 30 days of delivery
                for a full refund or exchange. Sale items and final-sale products are
                excluded unless defective. Refunds are processed to the original payment
                method within 5–10 business days of receiving the return.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
                Intellectual property
              </h2>
              <p className="mt-3">
                All content on this website — including text, images, logos, and designs — is
                owned by {SITE_NAME} and protected by copyright and trademark laws. You may not
                reproduce, distribute, or create derivative works without our written consent.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
                Limitation of liability
              </h2>
              <p className="mt-3">
                To the fullest extent permitted by law, {SITE_NAME} shall not be liable for
                any indirect, incidental, or consequential damages arising from your use of
                our website or products. Our total liability shall not exceed the amount you
                paid for the relevant order.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
                Contact
              </h2>
              <p className="mt-3">
                Questions about these terms? Contact us at{" "}
                <a
                  href="mailto:legal@premiumtees.com"
                  className="theme-link"
                >
                  legal@premiumtees.com
                </a>
                .
              </p>
            </section>
          </div>
        </article>
      </div>
    </section>
  );
}
