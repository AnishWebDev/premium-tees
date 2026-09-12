import type { LegalPageData, LegalSection } from "@/lib/cms-content";

type LegalDocumentProps = {
  page: LegalPageData;
  contactLabel?: string;
};

function SectionBlock({ section }: { section: LegalSection }) {
  return (
    <section>
      <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
        {section.heading}
      </h2>
      <div className="mt-3 space-y-3">
        {section.paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}

export function LegalDocument({ page, contactLabel = "Questions?" }: LegalDocumentProps) {
  return (
    <article className="prose-neutral mx-auto max-w-3xl">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
        {page.title}
      </h1>
      <p className="mt-4 text-sm text-[var(--muted-foreground)]">
        Last updated: {page.lastUpdated}
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-[var(--muted-foreground)]">
        {page.sections.map((section) => (
          <SectionBlock key={section.heading} section={section} />
        ))}

        {page.contactEmail && (
          <section>
            <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
              {contactLabel}
            </h2>
            <p className="mt-3">
              Email us at{" "}
              <a href={`mailto:${page.contactEmail}`} className="theme-link">
                {page.contactEmail}
              </a>
              .
            </p>
          </section>
        )}
      </div>
    </article>
  );
}
