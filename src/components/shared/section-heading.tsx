import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  title: string;
  subtitle?: string;
  linkLabel?: string;
  linkHref?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  title,
  subtitle,
  linkLabel,
  linkHref,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "items-center text-center sm:items-center sm:justify-center",
        className
      )}
    >
      <div className={cn(align === "center" && "max-w-2xl")}>
        <h2 className="font-display text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-base">
            {subtitle}
          </p>
        )}
      </div>
      {linkLabel && linkHref && (
        <Link
          href={linkHref}
          className="group inline-flex items-center gap-1.5 text-sm font-medium text-[var(--foreground)] transition-opacity hover:opacity-70"
        >
          {linkLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
