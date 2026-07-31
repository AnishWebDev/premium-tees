import type { NewsletterData } from "@/lib/site-content";
import { NewsletterForm } from "@/components/home/newsletter-form";

type InlineNewsletterProps = {
  content: NewsletterData;
  variant?: "light" | "band";
};

/** Compact signup that doesn't dominate the page. */
export function InlineNewsletter({
  content,
  variant = "light",
}: InlineNewsletterProps) {
  if (variant === "band") {
    return (
      <section className="border-t border-[var(--border)] bg-[var(--muted)]">
        <div className="container-tight flex flex-col items-start justify-between gap-6 py-10 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--foreground)]">
              {content.title}
            </h2>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {content.subtitle}
            </p>
          </div>
          <NewsletterForm />
        </div>
      </section>
    );
  }

  return (
    <section className="border-t border-[var(--border)]">
      <div className="container-tight max-w-xl py-14">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--foreground)]">
          {content.title}
        </h2>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          {content.subtitle}
        </p>
        <div className="mt-6">
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}
