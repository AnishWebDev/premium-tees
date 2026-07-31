/** Theme-friendly order status chip classes (readable in light + dark). */
export const ORDER_STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
  PAID: "bg-sky-500/15 text-sky-800 dark:text-sky-300",
  PROCESSING: "bg-indigo-500/15 text-indigo-800 dark:text-indigo-300",
  SHIPPED: "bg-violet-500/15 text-violet-800 dark:text-violet-300",
  DELIVERED: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300",
  CANCELLED: "bg-[var(--muted)] text-[var(--muted-foreground)]",
  REFUNDED: "bg-red-500/15 text-red-800 dark:text-red-300",
};
