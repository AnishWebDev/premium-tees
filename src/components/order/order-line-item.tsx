import Link from "next/link";
import { RemoteImage } from "@/components/shared/remote-image";
import { cn, formatPrice } from "@/lib/utils";

type OrderLineItemProps = {
  name: string;
  color: string;
  size: string;
  quantity: number;
  price: number;
  image?: string | null;
  productSlug?: string | null;
  productActive?: boolean;
  className?: string;
  layout?: "row" | "compact";
};

export function OrderLineItem({
  name,
  color,
  size,
  quantity,
  price,
  image,
  productSlug,
  productActive = true,
  className,
  layout = "row",
}: OrderLineItemProps) {
  const href =
    productSlug && productActive !== false ? `/product/${productSlug}` : undefined;

  const nameEl = href ? (
    <Link
      href={href}
      className="rounded-sm font-medium text-[var(--foreground)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
    >
      {name}
    </Link>
  ) : (
    <span className="font-medium text-[var(--foreground)]">{name}</span>
  );

  if (layout === "compact") {
    return (
      <li className={cn("flex justify-between gap-4 text-sm", className)}>
        <span className="text-[var(--muted-foreground)]">
          {href ? (
            <Link href={href} className="text-[var(--foreground)] hover:underline">
              {name}
            </Link>
          ) : (
            name
          )}{" "}
          · {color} / {size} × {quantity}
        </span>
        <span className="shrink-0 font-medium">{formatPrice(price * quantity)}</span>
      </li>
    );
  }

  const imageBlock = (
    <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-[var(--muted)]">
      {image ? (
        <RemoteImage src={image} alt={name} fill sizes="64px" className="object-cover" />
      ) : null}
    </div>
  );

  return (
    <li className={cn("flex gap-4 p-4 sm:p-5", className)}>
      {href ? (
        <Link
          href={href}
          className="shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        >
          {imageBlock}
        </Link>
      ) : (
        imageBlock
      )}
      <div className="flex flex-1 items-start justify-between gap-4">
        <div className="text-sm">
          {nameEl}
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            {color} · {size} · Qty {quantity}
          </p>
        </div>
        <p className="text-sm font-medium text-[var(--foreground)]">
          {formatPrice(price * quantity)}
        </p>
      </div>
    </li>
  );
}
