import Link from "next/link";
import { ChevronRight } from "lucide-react";

type AnnouncementBarProps = {
  enabled: boolean;
  message: string;
  linkHref?: string;
  linkLabel?: string;
};

export function AnnouncementBar({
  enabled,
  message,
  linkHref = "",
  linkLabel = "",
}: AnnouncementBarProps) {
  if (!enabled || !message.trim()) return null;

  const hasLink = linkHref.trim().length > 0;

  return (
    <div
      role="region"
      aria-label="Store announcement"
      className="border-b border-[var(--border)] bg-[var(--foreground)] text-[var(--background)]"
    >
      <div className="container-tight flex items-center justify-center gap-2 px-4 py-2.5 text-center text-sm">
        <p className="font-medium">{message}</p>
        {hasLink && (
          <Link
            href={linkHref}
            className="inline-flex items-center gap-0.5 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--background)]"
          >
            {linkLabel || "Learn more"}
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        )}
      </div>
    </div>
  );
}
