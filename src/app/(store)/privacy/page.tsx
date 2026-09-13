import type { Metadata } from "next";
import { PageBannerSlot } from "@/components/cms/page-banner-slot";
import { getCmsBlock } from "@/lib/cms-content";
import { LegalDocument } from "@/components/shared/legal-document";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const legal = await getCmsBlock("legal");
  return {
    title: legal.privacy.title,
    description: `${legal.privacy.title} — last updated ${legal.privacy.lastUpdated}.`,
  };
}

export default async function PrivacyPage() {
  const legal = await getCmsBlock("legal");

  return (
    <>
      <PageBannerSlot slug="privacy" />
      <section className="section-padding">
      <div className="container-tight">
        <LegalDocument page={legal.privacy} contactLabel="Contact us" />
      </div>
    </section>
    </>
  );
}
