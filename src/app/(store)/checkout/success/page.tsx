import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Package } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { verifyOrderAccessToken } from "@/lib/order-access";
import { SITE_NAME } from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Order confirmed",
  description: `Your order has been placed at ${SITE_NAME}.`,
  robots: { index: false, follow: false },
};

type SuccessPageProps = {
  searchParams: Promise<{
    order?: string;
    key?: string;
  }>;
};

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const { order: orderNumber, key } = await searchParams;
  const session = await auth();

  const order = orderNumber
    ? await prisma.order.findFirst({
        where: { orderNumber },
        include: { items: true },
      })
    : null;

  const isOwner = Boolean(
    order &&
      ((session?.user?.id && order.userId === session.user.id) ||
        (session?.user?.email &&
          order.guestEmail &&
          order.guestEmail.toLowerCase() === session.user.email.toLowerCase()) ||
        verifyOrderAccessToken(order.orderNumber, key))
  );

  const canOpenAccountOrder = Boolean(
    isOwner && session?.user?.id && order?.userId === session.user.id
  );

  return (
    <section className="section-padding">
      <div className="container-tight">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--foreground)]">
            <CheckCircle2 className="h-8 w-8 text-white" />
          </div>

          <h1 className="mt-8 font-display text-3xl font-semibold tracking-tight text-[var(--foreground)]">
            Thank you for your order
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
            {order && isOwner
              ? "We've received your payment and will send a confirmation email shortly."
              : "Your payment was successful. Check your email for order details."}
          </p>

          {order && isOwner && (
            <div className="mt-10 rounded-2xl border border-[var(--border)] p-6 text-left">
              <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
                <Package className="h-5 w-5 text-[var(--muted-foreground)]" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
                    Order number
                  </p>
                  <p className="font-medium text-[var(--foreground)]">{order.orderNumber}</p>
                </div>
              </div>

              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[var(--muted-foreground)]">Date</dt>
                  <dd>{formatDate(order.createdAt)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--muted-foreground)]">Total</dt>
                  <dd className="font-medium">{formatPrice(Number(order.total))}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--muted-foreground)]">Status</dt>
                  <dd className="capitalize">{order.status.toLowerCase()}</dd>
                </div>
              </dl>

              <ul className="mt-6 space-y-3 border-t border-[var(--border)] pt-4">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-4 text-sm">
                    <span className="text-[var(--muted-foreground)]">
                      {item.name}{" "}
                      <span className="text-[var(--muted-foreground)]">
                        · {item.color} / {item.size} × {item.quantity}
                      </span>
                    </span>
                    <span className="shrink-0 font-medium">
                      {formatPrice(Number(item.price) * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {canOpenAccountOrder && order && (
              <Button asChild variant="outline">
                <Link href={`/orders/${order.id}`}>View order details</Link>
              </Button>
            )}
            <Button asChild>
              <Link href="/shop">Continue shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
