import type { TestimonialsData } from "@/lib/site-content";
import { StarRating } from "@/components/shared/star-rating";
import { SectionHeading } from "@/components/shared/section-heading";

type TestimonialsProps = {
  content: TestimonialsData;
};

export function Testimonials({ content }: TestimonialsProps) {
  return (
    <section className="section-padding border-t border-[var(--border)]">
      <div className="container-tight">
        <SectionHeading
          title={content.title}
          subtitle={content.subtitle}
          align="center"
          className="justify-center"
        />

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {content.items.map((testimonial) => (
            <blockquote key={testimonial.id} className="flex flex-col">
              <StarRating rating={testimonial.rating} size="md" />
              <p className="mt-4 flex-1 text-sm leading-relaxed text-[var(--muted-foreground)]">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <footer className="mt-6 border-t border-[var(--border)] pt-6">
                <cite className="not-italic">
                  <span className="block text-sm font-medium text-[var(--foreground)]">
                    {testimonial.name}
                  </span>
                  <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                    {testimonial.role}
                  </span>
                </cite>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
