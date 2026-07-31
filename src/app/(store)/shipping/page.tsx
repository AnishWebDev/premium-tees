import type { Metadata } from "next";
import Link from "next/link";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_METHODS, SITE_NAME } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Shipping",
  description: `Shipping rates and delivery times for ${SITE_NAME}.`,
};

export default function ShippingPage() {
  return (
    <div className="section-padding">
      <div className="container-tight max-w-3xl">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
          Shipping
        </h1>
        <p className="mt-4 text-[var(--muted-foreground)]">
          Fast, reliable delivery for every order. Free shipping on orders over{" "}
          {formatPrice(FREE_SHIPPING_THRESHOLD)}.
        </p>

        <div className="mt-12 space-y-6">
          {SHIPPING_METHODS.map((method) => (
            <div
              key={method.id}
              className="flex items-start justify-between gap-6 border-b border-[var(--border)] pb-6"
            >
              <div>
                <h2 className="text-lg font-medium text-[var(--foreground)]">{method.label}</h2>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">{method.days}</p>
              </div>
              <p className="text-sm font-medium text-[var(--foreground)]">
                {method.price === 0 ? "Free" : formatPrice(method.price)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 space-y-4 text-sm leading-relaxed text-[var(--muted-foreground)]">
          <p>
            Orders are processed within 1–2 business days. You will receive a tracking number by
            email once your order ships.
          </p>
          <p>
            International orders may be subject to duties and taxes, which are the responsibility
            of the recipient.
          </p>
          <p>
            Questions? Visit our{" "}
            <Link href="/faq" className="theme-link">
              FAQ
            </Link>{" "}
            or{" "}
            <Link href="/contact" className="theme-link">
              contact us
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
