import type { NewsletterData } from "@/lib/site-content";
import { NewsletterForm } from "@/components/home/newsletter-form";

type NewsletterSectionProps = {
  content: NewsletterData;
};

export function NewsletterSection({ content }: NewsletterSectionProps) {
  return (
    <section className="section-padding border-t border-[var(--border)] bg-[var(--foreground)] text-[var(--background)]">
      <div className="container-tight">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {content.title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--background)]/75 sm:text-base">
            {content.subtitle}
          </p>
          <div className="mt-8 flex justify-center">
            <NewsletterForm variant="dark" />
          </div>
        </div>
      </div>
    </section>
  );
}
