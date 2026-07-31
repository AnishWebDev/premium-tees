import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SITE_NAME } from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/utils";
import { PrintButton } from "@/components/admin/print-button";
import { Button } from "@/components/ui/button";

type PrintPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderPackingSlipPage({ params }: PrintPageProps) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      user: { select: { name: true, email: true } },
    },
  });

  if (!order) notFound();

  const customerEmail = order.guestEmail || order.user?.email || "—";
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3 print:hidden">
        <Button asChild variant="outline">
          <Link href="/admin/orders">Back to orders</Link>
        </Button>
        <PrintButton />
      </div>

      <div className="mx-auto max-w-3xl space-y-8 bg-white p-6 text-neutral-950 sm:p-10 print:max-w-none print:p-0">
        {/* Shipping label — cut/tape on box */}
        <section className="rounded-none border-2 border-neutral-950 p-6 print:break-inside-avoid">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Ship to
          </p>
          <div className="mt-4 space-y-1 text-2xl font-semibold leading-snug tracking-tight">
            <p>{order.shippingName}</p>
            <p>{order.shippingLine1}</p>
            {order.shippingLine2 ? <p>{order.shippingLine2}</p> : null}
            <p>
              {order.shippingCity}, {order.shippingState} {order.shippingZip}
            </p>
            <p>{order.shippingCountry}</p>
            {order.shippingPhone ? (
              <p className="pt-2 text-lg font-normal text-neutral-700">
                Phone: {order.shippingPhone}
              </p>
            ) : null}
          </div>
          <div className="mt-8 flex flex-wrap justify-between gap-4 border-t border-neutral-300 pt-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wider text-neutral-500">
                From
              </p>
              <p className="mt-1 font-medium">{SITE_NAME}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-neutral-500">
                Order
              </p>
              <p className="mt-1 font-medium">{order.orderNumber}</p>
            </div>
          </div>
        </section>

        {/* Packing list */}
        <section className="print:break-inside-avoid">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-neutral-200 pb-4">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Packing slip</h1>
              <p className="mt-1 text-sm text-neutral-500">
                {formatDate(order.createdAt)} · {itemCount} item
                {itemCount === 1 ? "" : "s"}
              </p>
            </div>
            <div className="text-right text-sm text-neutral-600">
              <p>{customerEmail}</p>
              <p className="capitalize">{order.status.toLowerCase()}</p>
            </div>
          </div>

          <table className="mt-6 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-xs uppercase tracking-wider text-neutral-500">
                <th className="pb-2 font-medium">Item</th>
                <th className="pb-2 font-medium">Variant</th>
                <th className="pb-2 text-right font-medium">Qty</th>
                <th className="pb-2 text-right font-medium">Price</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-neutral-100">
                  <td className="py-3 font-medium">{item.name}</td>
                  <td className="py-3 text-neutral-600">
                    {item.color} / {item.size}
                  </td>
                  <td className="py-3 text-right tabular-nums">{item.quantity}</td>
                  <td className="py-3 text-right tabular-nums">
                    {formatPrice(Number(item.price) * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <dl className="mt-6 ml-auto w-full max-w-xs space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-neutral-500">Subtotal</dt>
              <dd>{formatPrice(Number(order.subtotal))}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">Shipping</dt>
              <dd>{formatPrice(Number(order.shippingCost))}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">Tax</dt>
              <dd>{formatPrice(Number(order.tax))}</dd>
            </div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between text-neutral-700">
                <dt>Discount</dt>
                <dd>−{formatPrice(Number(order.discount))}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-neutral-200 pt-2 font-semibold">
              <dt>Total</dt>
              <dd>{formatPrice(Number(order.total))}</dd>
            </div>
          </dl>

          {order.notes ? (
            <p className="mt-8 text-sm text-neutral-600">
              <span className="font-medium text-neutral-950">Order notes: </span>
              {order.notes}
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
