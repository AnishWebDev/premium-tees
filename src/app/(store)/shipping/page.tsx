import type { Metadata } from "next";
import Link from "next/link";
import { PageBannerSlot } from "@/components/cms/page-banner-slot";
import { getCommerceConfig } from "@/lib/commerce";
import { getCmsBlock } from "@/lib/cms-content";
import { getSiteIdentity } from "@/lib/site-identity";
import { formatPrice } from "@/lib/utils";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteIdentity();
  return {
    title: "Shipping",
    description: `Shipping rates and delivery times for ${site.name}.`,
  };
}

export default async function ShippingPage() {
  const [commerce, legal] = await Promise.all([getCommerceConfig(), getCmsBlock("legal")]);

  return (
    <>
      <PageBannerSlot slug="shipping" />
      <div className="section-padding">
      <div className="container-tight max-w-3xl">
        <p className="text-[var(--muted-foreground)]">
          {legal.shippingIntro.replace(
            "{threshold}",
            formatPrice(commerce.freeShippingThreshold)
          )}
        </p>

        <div className="mt-8 space-y-6">
          {commerce.shippingMethods.map((method) => (
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

        <div className="mt-12 space-y-6 text-sm leading-relaxed text-[var(--muted-foreground)]">
          {legal.shippingSections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
                {section.heading}
              </h2>
              {section.paragraphs.map((paragraph, index) => (
                <p key={index} className="mt-3">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
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
    </>
  );
}
