import Link from "next/link";
import Image from "next/image";

type Panel = {
  id: string;
  image: string;
  title: string;
  subtitle?: string;
  href: string;
};

type StackedPanelsProps = {
  panels: Panel[];
};

/** Full-bleed stacked campaign panels. */
export function StackedPanels({ panels }: StackedPanelsProps) {
  if (panels.length === 0) return null;

  return (
    <section aria-label="Collections">
      {panels.map((panel) => (
        <Link
          key={panel.id}
          href={panel.href}
          className="group relative flex min-h-[70vh] items-end overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-inset"
        >
          <Image
            src={panel.image}
            alt=""
            fill
            sizes="100vw"
            className="object-cover transition-transform duration-1000 motion-safe:group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-black/50" aria-hidden />
          <div className="relative z-10 w-full px-4 pb-14 pt-32 sm:px-8 lg:px-12">
            <h2 className="font-display text-4xl font-semibold tracking-tight text-white sm:text-6xl">
              {panel.title}
            </h2>
            {panel.subtitle ? (
              <p className="mt-3 max-w-md text-sm text-white/90 sm:text-base">
                {panel.subtitle}
              </p>
            ) : null}
            <p className="mt-6 text-sm font-medium text-white underline underline-offset-4">
              Explore {panel.title}
            </p>
          </div>
        </Link>
      ))}
    </section>
  );
}
