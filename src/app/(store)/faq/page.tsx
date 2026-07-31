import type { Metadata } from "next";
import { getContentBlock } from "@/lib/site-content";
import { SectionHeading } from "@/components/shared/section-heading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export async function generateMetadata(): Promise<Metadata> {
  const faq = await getContentBlock("faq");
  return {
    title: "FAQ",
    description: faq.subtitle,
  };
}

export const revalidate = 60;

export default async function FAQPage() {
  const faq = await getContentBlock("faq");

  return (
    <section className="section-padding">
      <div className="container-tight">
        <SectionHeading title={faq.title} subtitle={faq.subtitle} />

        <Accordion type="single" collapsible className="mx-auto mt-12 max-w-2xl">
          {faq.items.map((item, index) => (
            <AccordionItem key={`${item.question}-${index}`} value={`item-${index}`}>
              <AccordionTrigger className="font-display text-base">
                {item.question}
              </AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
