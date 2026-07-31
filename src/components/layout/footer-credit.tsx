import Link from "next/link";
import { Heart } from "lucide-react";
import type { FooterCreditData } from "@/lib/site-content";

type FooterCreditProps = {
  credit: FooterCreditData;
};

export function FooterCredit({ credit }: FooterCreditProps) {
  if (!credit.enabled) return null;

  const nameEl = credit.nameHref ? (
    <Link
      href={credit.nameHref}
      className="underline underline-offset-4 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      target={credit.nameHref.startsWith("http") ? "_blank" : undefined}
      rel={
        credit.nameHref.startsWith("http") ? "noopener noreferrer" : undefined
      }
    >
      {credit.name}
    </Link>
  ) : (
    <span>{credit.name}</span>
  );

  return (
    <p
      className="inline-flex flex-wrap items-center gap-1.5"
      style={{
        color: credit.textColor,
        fontSize: `${credit.fontSizePx}px`,
        fontFamily: credit.fontFamily,
        fontStyle: credit.italic ? "italic" : "normal",
      }}
    >
      <span>{credit.prefix}</span>
      <Heart
        className="inline-block shrink-0"
        style={{
          width: `${Math.round(credit.fontSizePx * 0.95)}px`,
          height: `${Math.round(credit.fontSizePx * 0.95)}px`,
          color: credit.heartColor,
          fill: credit.heartColor,
        }}
        aria-label="love"
      />
      <span>by {nameEl}</span>
    </p>
  );
}
