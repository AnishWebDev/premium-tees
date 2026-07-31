import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export type MosaicCell = {
  id: string;
  image: string;
  title: string;
  href: string;
  span?: "tall" | "wide" | "square";
};

type ImageMosaicProps = {
  cells: MosaicCell[];
  eyebrow?: string;
  title?: string;
};

/** Aritzia-style asymmetric image collage. */
export function ImageMosaic({ cells, eyebrow, title }: ImageMosaicProps) {
  if (cells.length === 0) return null;

  const headingId = title ? "mosaic-heading" : undefined;

  return (
    <section
      className="bg-[var(--background)] py-6 sm:py-10"
      aria-labelledby={headingId}
    >
      {(eyebrow || title) && (
        <div className="container-tight mb-6 sm:mb-8">
          {eyebrow ? (
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
              {eyebrow}
            </p>
          ) : null}
          {title ? (
            <h2
              id={headingId}
              className="font-display mt-2 text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl"
            >
              {title}
            </h2>
          ) : null}
        </div>
      )}
      <div className="container-tight grid auto-rows-[220px] grid-cols-2 gap-2 sm:auto-rows-[280px] sm:gap-3 lg:auto-rows-[320px] lg:grid-cols-4">
        {cells.map((cell, index) => {
          const span =
            cell.span ??
            (index === 0 ? "tall" : index === 1 ? "wide" : "square");
          const spanClass =
            span === "tall"
              ? "row-span-2 col-span-1"
              : span === "wide"
                ? "col-span-2 row-span-1"
                : "col-span-1 row-span-1";

          return (
            <Link
              key={cell.id}
              href={cell.href}
              aria-label={cell.title}
              className={cn(
                "group relative overflow-hidden bg-[var(--muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2",
                spanClass
              )}
            >
              <Image
                src={cell.image}
                alt=""
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-105"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-neutral-950/75 via-neutral-950/20 to-transparent"
                aria-hidden
              />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <p className="font-display text-lg font-semibold text-white sm:text-xl">
                  {cell.title}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
