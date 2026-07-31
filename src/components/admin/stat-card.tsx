import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string;
  change?: number;
  icon: LucideIcon;
  className?: string;
};

export function StatCard({ title, value, change, icon: Icon, className }: StatCardProps) {
  const changeLabel =
    change !== undefined
      ? change >= 0
        ? `+${change}%`
        : `${change}%`
      : null;

  return (
    <div
      className={cn(
        "rounded-lg border border-neutral-200 bg-white p-4 shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-neutral-900">{value}</p>
          {changeLabel && (
            <p
              className={cn(
                "mt-1 text-xs font-medium",
                change! >= 0 ? "text-emerald-600" : "text-red-600"
              )}
            >
              {changeLabel} vs prior 30 days
            </p>
          )}
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-600">
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
