import type { Metadata } from "next";
import { PageBannerSlot } from "@/components/cms/page-banner-slot";
import { getContentBlock } from "@/lib/site-content";
import { ContactForm } from "./contact-form";

export async function generateMetadata(): Promise<Metadata> {
  const contact = await getContentBlock("contact");
  return {
    title: contact.title || "Contact",
    description: contact.subtitle,
  };
}

export const revalidate = 60;

export default async function ContactPage() {
  const contact = await getContentBlock("contact");

  return (
    <>
      <PageBannerSlot slug="contact" />
      <section className="section-padding">
      <div className="container-tight">
        <ContactForm content={contact} />
      </div>
    </section>
    </>
  );
}
