import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, Truck } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUS_STYLES } from "@/lib/order-status-styles";
import { formatDate, formatPrice, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ReturnRequestForm } from "@/components/account/return-request-form";

type OrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

const STATUS_STEPS = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

export async function generateMetadata({ params }: OrderDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    select: { orderNumber: true },
  });

  return {
    title: order ? `Order ${order.orderNumber}` : "Order",
    robots: { index: false, follow: false },
  };
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      returnRequests: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!order || order.userId !== session.user.id) notFound();

  const currentStep = STATUS_STEPS.indexOf(
    order.status as (typeof STATUS_STEPS)[number]
  );
  const latestReturn = order.returnRequests[0] ?? null;
  const canRequestReturn = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"].includes(
    order.status
  );

  return (
    <div>
      <Link
        href="/orders"
        className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to orders
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[var(--foreground)]">
            Order {order.orderNumber}
          </h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <Badge
          variant="secondary"
          className={cn(
            "text-xs uppercase tracking-wider",
            ORDER_STATUS_STYLES[order.status]
          )}
        >
          {order.status.toLowerCase()}
        </Badge>
      </div>

      {(order.status === "SHIPPED" ||
        order.status === "DELIVERED" ||
        order.trackingNumber) && (
        <div className="mt-8 rounded-2xl border border-[var(--border)] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--muted)]">
              <Truck className="h-4 w-4 text-[var(--muted-foreground)]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">
                Tracking
              </p>
              {order.trackingNumber ? (
                <p className="text-sm text-[var(--muted-foreground)]">
                  {order.carrier && `${order.carrier} · `}
                  {order.trackingNumber}
                </p>
              ) : (
                <p className="text-sm text-[var(--muted-foreground)]">
                  Tracking info will appear once your order ships.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-[var(--border)] p-5 sm:p-6">
        <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
          Order progress
        </p>
        <div className="mt-4 flex justify-between gap-2">
          {STATUS_STEPS.map((step, index) => {
            const completed = currentStep >= index;
            const active = currentStep === index;
            return (
              <div key={step} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium",
                    completed
                      ? "bg-[var(--foreground)] text-[var(--background)]"
                      : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                  )}
                >
                  {index + 1}
                </div>
                <span
                  className={cn(
                    "text-center text-[10px] uppercase tracking-wider sm:text-xs",
                    active || completed
                      ? "text-[var(--foreground)]"
                      : "text-[var(--muted-foreground)]"
                  )}
                >
                  {step.toLowerCase()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h3 className="text-sm font-medium text-[var(--foreground)]">Items</h3>
          <ul className="mt-4 divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)]">
            {order.items.map((item) => (
              <li key={item.id} className="flex gap-4 p-4 sm:p-5">
                <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-[var(--muted)]">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex flex-1 items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {item.name}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      {item.color} · {item.size} · Qty {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {formatPrice(Number(item.price) * item.quantity)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-[var(--border)] p-5">
            <h3 className="text-sm font-medium text-[var(--foreground)]">
              Shipping address
            </h3>
            <address className="mt-3 not-italic text-sm leading-relaxed text-[var(--muted-foreground)]">
              {order.shippingName}
              <br />
              {order.shippingLine1}
              {order.shippingLine2 && (
                <>
                  <br />
                  {order.shippingLine2}
                </>
              )}
              <br />
              {order.shippingCity}, {order.shippingState} {order.shippingZip}
              <br />
              {order.shippingCountry}
            </address>
          </div>

          <div className="rounded-2xl border border-[var(--border)] p-5">
            <h3 className="text-sm font-medium text-[var(--foreground)]">
              Summary
            </h3>
            <dl className="mt-4 space-y-2 text-sm text-[var(--foreground)]">
              <div className="flex justify-between">
                <dt className="text-[var(--muted-foreground)]">Subtotal</dt>
                <dd>{formatPrice(Number(order.subtotal))}</dd>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                  <dt>Discount</dt>
                  <dd>−{formatPrice(Number(order.discount))}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-[var(--muted-foreground)]">Shipping</dt>
                <dd>{formatPrice(Number(order.shippingCost))}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--muted-foreground)]">Tax</dt>
                <dd>{formatPrice(Number(order.tax))}</dd>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold">
                <dt>Total</dt>
                <dd>{formatPrice(Number(order.total))}</dd>
              </div>
            </dl>
          </div>

          {(canRequestReturn || latestReturn) && (
            <ReturnRequestForm
              orderId={order.id}
              existing={
                latestReturn
                  ? {
                      status: latestReturn.status,
                      reason: latestReturn.reason,
                      adminNote: latestReturn.adminNote,
                    }
                  : null
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
