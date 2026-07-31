import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export type AccordionEntry = {
  question: string;
  answer: string;
};

type ContentAccordionProps = {
  title: string;
  subtitle?: string;
  items: AccordionEntry[];
  linkHref?: string;
  linkLabel?: string;
};

/** Accessible FAQ / details accordion for homepage templates. */
export function ContentAccordion({
  title,
  subtitle,
  items,
}: ContentAccordionProps) {
  if (items.length === 0) return null;

  return (
    <section
      className="border-b border-[var(--border)]"
      aria-labelledby="home-accordion-heading"
    >
      <div className="container-tight py-16 sm:py-20">
        <h2
          id="home-accordion-heading"
          className="font-display text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl"
        >
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted-foreground)]">
            {subtitle}
          </p>
        ) : null}
        <Accordion type="single" collapsible className="mt-8 w-full">
          {items.map((item, index) => (
            <AccordionItem
              key={`${item.question}-${index}`}
              value={`item-${index}`}
              className="border-[var(--border)]"
            >
              <AccordionTrigger className="text-[var(--foreground)] hover:no-underline hover:opacity-80">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-[var(--muted-foreground)]">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
