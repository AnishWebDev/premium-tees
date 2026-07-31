import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy policy for ${SITE_NAME}.`,
};

export default function PrivacyPage() {
  return (
    <section className="section-padding">
      <div className="container-tight">
        <article className="prose-neutral mx-auto max-w-3xl">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">Last updated: July 31, 2026</p>

          <div className="mt-10 space-y-8 text-sm leading-relaxed text-[var(--muted-foreground)]">
            <section>
              <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
                Overview
              </h2>
              <p className="mt-3">
                {SITE_NAME} (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) respects your
                privacy. This policy explains how we collect, use, and protect your personal
                information when you visit our website or make a purchase.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
                Information we collect
              </h2>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>
                  Account information: name, email address, and password when you register.
                </li>
                <li>
                  Order information: shipping and billing addresses, phone number, and
                  payment details processed securely through Razorpay.
                </li>
                <li>
                  Usage data: pages visited, products viewed, and device information collected
                  via cookies and analytics tools.
                </li>
                <li>
                  Communications: messages you send us through contact forms or customer support.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
                How we use your information
              </h2>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>Process and fulfill your orders, including shipping and returns.</li>
                <li>Provide customer support and respond to inquiries.</li>
                <li>Send order confirmations, shipping updates, and marketing emails (with your consent).</li>
                <li>Improve our website, products, and shopping experience.</li>
                <li>Prevent fraud and comply with legal obligations.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
                Sharing your information
              </h2>
              <p className="mt-3">
                We do not sell your personal information. We share data only with trusted
                service providers who help us operate our business — including payment
                processing (Razorpay), shipping carriers, and email delivery services —
                and only to the extent necessary to provide our services.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
                Cookies
              </h2>
              <p className="mt-3">
                We use essential cookies to maintain your cart and session, and analytics
                cookies to understand how visitors use our site. You can control cookie
                preferences through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
                Your rights
              </h2>
              <p className="mt-3">
                Depending on your location, you may have the right to access, correct, delete,
                or port your personal data. To exercise these rights, contact us at{" "}
                <a
                  href="mailto:privacy@premiumtees.com"
                  className="theme-link"
                >
                  privacy@premiumtees.com
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
                Contact
              </h2>
              <p className="mt-3">
                Questions about this policy? Email us at{" "}
                <a
                  href="mailto:privacy@premiumtees.com"
                  className="theme-link"
                >
                  privacy@premiumtees.com
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
