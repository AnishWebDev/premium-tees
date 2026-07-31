"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/effects/reveal";

type StickySplitProps = {
  image: string;
  imageAlt?: string;
  eyebrow?: string;
  title: string;
  body: string;
  /** Put media on the right */
  reverse?: boolean;
  className?: string;
  children?: React.ReactNode;
};

/**
 * Sticky media + scrolling copy — common for lookbooks / about stories.
 * On mobile, stacks image then text.
 */
export function StickySplit({
  image,
  imageAlt = "",
  eyebrow,
  title,
  body,
  reverse = false,
  className,
  children,
}: StickySplitProps) {
  return (
    <section className={cn("section-padding", className)}>
      <div
        className={cn(
          "container-tight grid items-start gap-10 lg:grid-cols-2 lg:gap-16",
          reverse && "lg:[&>*:first-child]:order-2"
        )}
      >
        <div className="relative aspect-[4/5] overflow-hidden lg:sticky lg:top-28 lg:aspect-auto lg:h-[min(78vh,720px)]">
          <Image
            src={image}
            alt={imageAlt}
            fill
            sizes="(max-width:1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col justify-center py-4 lg:min-h-[min(78vh,720px)]">
          <Reveal>
            {eyebrow ? (
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                {eyebrow}
              </p>
            ) : null}
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
              {title}
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-[var(--muted-foreground)]">
              {body}
            </p>
            {children ? <div className="mt-8">{children}</div> : null}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
