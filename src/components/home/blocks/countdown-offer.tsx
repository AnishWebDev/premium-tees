"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import Link from "next/link";
import {
  galleryBandClass,
  galleryRoundedClass,
} from "@/components/home/blocks/image-gallery";
import {
  countdownParts,
  type CountdownParts,
} from "@/lib/promo-schedule";
import { cn } from "@/lib/utils";

type CountdownOfferProps = {
  title: string;
  subtitle?: string;
  scheduleStartAt?: string;
  countdownTargetAt?: string;
  expiredMessage?: string;
  ctaLabel?: string;
  ctaHref?: string;
  bgStyle?: string;
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: string;
};

function Unit({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex min-w-[4.5rem] flex-col items-center gap-1 px-2 py-3 sm:min-w-[5.5rem] sm:py-4">
      <span className="font-display text-2xl font-semibold tabular-nums sm:text-3xl">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)] sm:text-xs">
        {label}
      </span>
    </div>
  );
}

export function CountdownOffer({
  title,
  subtitle,
  scheduleStartAt,
  countdownTargetAt,
  expiredMessage = "This offer has ended.",
  ctaLabel,
  ctaHref,
  bgStyle = "muted",
  backgroundColor = "",
  textColor = "",
  borderRadius = "lg",
}: CountdownOfferProps) {
  const [parts, setParts] = useState<CountdownParts | null>(null);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    setParts(countdownParts(countdownTargetAt, scheduleStartAt));
    setReady(true);
  }, [countdownTargetAt, scheduleStartAt]);

  useEffect(() => {
    const tick = () =>
      setParts(countdownParts(countdownTargetAt, scheduleStartAt));
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [countdownTargetAt, scheduleStartAt]);

  if (!countdownTargetAt?.trim()) return null;

  const bandClass = galleryBandClass(bgStyle, backgroundColor);
  const roundedClass = galleryRoundedClass(borderRadius);
  const customBg = backgroundColor?.trim();
  const customColor = textColor?.trim();
  const expired = ready && (parts?.expired ?? false);
  const phaseLabel =
    parts?.phase === "before"
      ? "Offer starts in"
      : parts?.phase === "active"
        ? "Offer ends in"
        : null;

  return (
    <section
      className={cn("section-padding", bandClass)}
      style={customBg ? { backgroundColor: customBg } : undefined}
      aria-labelledby="countdown-offer-heading"
    >
      <div className="container-tight text-center">
        <h2
          id="countdown-offer-heading"
          className="font-display text-2xl font-semibold tracking-tight sm:text-3xl"
          style={customColor ? { color: customColor } : undefined}
        >
          {title}
        </h2>
        {subtitle?.trim() ? (
          <p className="mx-auto mt-2 max-w-xl text-sm text-[var(--muted-foreground)]">
            {subtitle}
          </p>
        ) : null}

        {!ready ? (
          <div className="mt-8 h-[5.5rem]" aria-hidden />
        ) : expired ? (
          <p className="mt-8 text-base font-medium">{expiredMessage}</p>
        ) : parts ? (
          <>
            {phaseLabel ? (
              <p className="mt-6 text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                {phaseLabel}
              </p>
            ) : null}
            <div
              className={cn(
                "mx-auto mt-4 inline-flex divide-x divide-[var(--border)] border border-[var(--border)] bg-[var(--background)]",
                roundedClass
              )}
              role="timer"
              aria-live="polite"
              aria-label={phaseLabel ?? "Offer countdown"}
            >
              <Unit label="Days" value={parts.days} />
              <Unit label="Hours" value={parts.hours} />
              <Unit label="Minutes" value={parts.minutes} />
              <Unit label="Seconds" value={parts.seconds} />
            </div>
          </>
        ) : null}

        {ctaLabel?.trim() && ctaHref?.trim() && ready && !expired ? (
          <div className="mt-8">
            <Link
              href={ctaHref}
              className="inline-flex items-center justify-center rounded-full bg-[var(--foreground)] px-6 py-2.5 text-sm font-medium text-[var(--background)] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              {ctaLabel}
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
