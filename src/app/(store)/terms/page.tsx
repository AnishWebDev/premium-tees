import type { Metadata } from "next";
import { PageBannerSlot } from "@/components/cms/page-banner-slot";
import { getCmsBlock } from "@/lib/cms-content";
import { LegalDocument } from "@/components/shared/legal-document";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const legal = await getCmsBlock("legal");
  return {
    title: legal.terms.title,
    description: `${legal.terms.title} — last updated ${legal.terms.lastUpdated}.`,
  };
}

export default async function TermsPage() {
  const legal = await getCmsBlock("legal");

  return (
    <>
      <PageBannerSlot slug="terms" />
      <section className="section-padding">
      <div className="container-tight">
        <LegalDocument page={legal.terms} />
      </div>
    </section>
    </>
  );
}
