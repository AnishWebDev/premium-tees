import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Package } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { verifyOrderAccessToken } from "@/lib/order-access";
import { getCmsBlock } from "@/lib/cms-content";
import { getSiteIdentity } from "@/lib/site-identity";
import { OrderLineItem } from "@/components/order/order-line-item";
import { formatDate, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteIdentity();
  return {
    title: "Order confirmed",
    description: `Your order has been placed at ${site.name}.`,
    robots: { index: false, follow: false },
  };
}

type SuccessPageProps = {
  searchParams: Promise<{
    order?: string;
    key?: string;
  }>;
};

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const { order: orderNumber, key } = await searchParams;
  const [session, storeCopy] = await Promise.all([auth(), getCmsBlock("storeCopy")]);

  const order = orderNumber
    ? await prisma.order.findFirst({
        where: { orderNumber },
        include: {
          items: {
            include: {
              product: { select: { slug: true, active: true } },
            },
          },
        },
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
            {order?.status === "LEAD"
              ? "Thanks — we got your request"
              : "Thank you for your order"}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
            {order?.status === "LEAD"
              ? storeCopy.checkoutSuccessLead
              : order && isOwner
                ? storeCopy.checkoutSuccessPaid
                : storeCopy.checkoutSuccessPaid}
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
                  <OrderLineItem
                    key={item.id}
                    layout="compact"
                    name={item.name}
                    color={item.color}
                    size={item.size}
                    quantity={item.quantity}
                    price={Number(item.price)}
                    productSlug={item.product?.slug}
                    productActive={item.product?.active}
                  />
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
