import type { Metadata } from "next";
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
    <section className="section-padding">
      <div className="container-tight">
        <ContactForm content={contact} />
      </div>
    </section>
  );
}
