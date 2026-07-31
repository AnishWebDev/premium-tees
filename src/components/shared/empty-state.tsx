import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-4 py-16 text-center",
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--muted)]">
        <Icon className="h-6 w-6 text-[var(--muted-foreground)]" aria-hidden />
      </div>
      <h3 className="mt-6 font-display text-xl font-semibold tracking-tight text-[var(--foreground)]">
        {title}
      </h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--muted-foreground)]">
          {description}
        </p>
      )}
      {actionLabel && actionHref && (
        <Button asChild className="mt-8">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}
