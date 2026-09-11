import Link from "next/link";

type TrustBarProps = {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
};

/** Centered promo / trust strip — shipping, reviews, club perks. */
export function TrustBar({ title, subtitle, href, linkLabel }: TrustBarProps) {
  return (
    <aside
      className="border-b border-[var(--border)] bg-[var(--muted)]"
      aria-label="Store highlights"
    >
      <div className="container-tight py-3 text-center text-sm">
        {subtitle ? (
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            {subtitle}
          </p>
        ) : null}
        <p className="font-medium text-[var(--foreground)]">{title}</p>
        {href && linkLabel ? (
          <Link
            href={href}
            className="theme-link mt-1 inline-block text-xs font-medium"
          >
            {linkLabel}
          </Link>
        ) : null}
      </div>
    </aside>
  );
}
