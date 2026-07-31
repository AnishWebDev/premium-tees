import type { Metadata } from "next";
import Link from "next/link";
import { getContentBlock } from "@/lib/site-content";
import { Button } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const about = await getContentBlock("about");
  const site = await getContentBlock("site");
  return {
    title: "About",
    description: about.intro || `Learn about ${site.name}`,
  };
}

export const revalidate = 60;

export default async function AboutPage() {
  const about = await getContentBlock("about");

  return (
    <>
      <section className="section-padding">
        <div className="container-tight">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
              {about.eyebrow}
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
              {about.title}
            </h1>
            <p className="mt-6 text-base leading-relaxed text-[var(--muted-foreground)] sm:text-lg">
              {about.intro}
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--border)] bg-[var(--background)] section-padding">
        <div className="container-tight">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
            <div>
              <h2 className="font-display text-2xl font-semibold text-[var(--foreground)]">
                {about.storyTitle}
              </h2>
              {about.storyParagraphs.map((paragraph, i) => (
                <p
                  key={i}
                  className="mt-4 text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-base"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold text-[var(--foreground)]">
                {about.valuesTitle}
              </h2>
              <ul className="mt-6 space-y-6">
                {about.values.map((item) => (
                  <li key={item.title}>
                    <h3 className="text-sm font-medium text-[var(--foreground)]">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--muted-foreground)]">
                      {item.body}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--border)] section-padding">
        <div className="container-tight text-center">
          <h2 className="font-display text-2xl font-semibold text-[var(--foreground)]">
            {about.ctaTitle}
          </h2>
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">{about.ctaSubtitle}</p>
          <Button asChild className="mt-8">
            <Link href={about.ctaHref}>{about.ctaLabel}</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
