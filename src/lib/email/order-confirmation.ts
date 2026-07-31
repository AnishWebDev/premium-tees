import type { Order, OrderItem, User } from "@prisma/client";
import { orderSuccessPath } from "@/lib/order-access";
import { getSiteUrl } from "@/lib/site-url";
import { formatDate, formatPrice } from "@/lib/utils";
import {
  emailBrandName,
  escapeHtml,
  getOrderNotifyEmail,
  sendEmail,
} from "@/lib/email";

type OrderWithDetails = Order & {
  items: OrderItem[];
  user?: Pick<User, "email" | "name"> | null;
};

function customerEmail(order: OrderWithDetails) {
  return order.guestEmail || order.user?.email || null;
}

function addressBlock(order: OrderWithDetails) {
  const lines = [
    order.shippingName,
    order.shippingLine1,
    order.shippingLine2,
    `${order.shippingCity}, ${order.shippingState} ${order.shippingZip}`,
    order.shippingCountry,
    order.shippingPhone ? `Phone: ${order.shippingPhone}` : null,
  ].filter(Boolean) as string[];

  return lines.map(escapeHtml).join("<br />");
}

function buildInvoiceHtml(order: OrderWithDetails) {
  const brand = escapeHtml(emailBrandName());
  const siteUrl = getSiteUrl();
  const orderUrl = order.userId
    ? `${siteUrl}/orders/${order.id}`
    : `${siteUrl}${orderSuccessPath(order.orderNumber)}`;
  const itemRows = order.items
    .map((item) => {
      const lineTotal = Number(item.price) * item.quantity;
      return `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #e5e5e5;font-size:14px;color:#171717;">
            <div style="font-weight:600;">${escapeHtml(item.name)}</div>
            <div style="color:#737373;font-size:12px;margin-top:4px;">
              ${escapeHtml(item.color)} / ${escapeHtml(item.size)} × ${item.quantity}
            </div>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #e5e5e5;font-size:14px;color:#171717;text-align:right;white-space:nowrap;">
            ${escapeHtml(formatPrice(lineTotal))}
          </td>
        </tr>`;
    })
    .join("");

  const discount = Number(order.discount);
  const totals = [
    ["Subtotal", formatPrice(Number(order.subtotal))],
    ...(discount > 0
      ? [["Discount", `−${formatPrice(discount)}`] as const]
      : []),
    ["Shipping", formatPrice(Number(order.shippingCost))],
    ["Tax", formatPrice(Number(order.tax))],
    ["Total", formatPrice(Number(order.total))],
  ];

  const totalsHtml = totals
    .map(([label, value], index) => {
      const last = index === totals.length - 1;
      return `
        <tr>
          <td style="padding:6px 0;font-size:${last ? "15px" : "13px"};color:${last ? "#171717" : "#737373"};font-weight:${last ? "700" : "400"};">
            ${escapeHtml(label)}
          </td>
          <td style="padding:6px 0;font-size:${last ? "15px" : "13px"};color:#171717;text-align:right;font-weight:${last ? "700" : "500"};">
            ${escapeHtml(value)}
          </td>
        </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#f5f5f5;font-family:Georgia,'Times New Roman',serif;">
    <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
      <div style="background:#ffffff;border:1px solid #e5e5e5;padding:32px 28px;">
        <p style="margin:0;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#737373;">
          ${brand}
        </p>
        <h1 style="margin:12px 0 0;font-size:28px;line-height:1.2;color:#171717;font-weight:600;">
          Order confirmed
        </h1>
        <p style="margin:12px 0 0;font-size:14px;line-height:1.6;color:#525252;">
          Thanks for your purchase. This email is your invoice for order
          <strong style="color:#171717;">${escapeHtml(order.orderNumber)}</strong>
          placed on ${escapeHtml(formatDate(order.createdAt))}.
        </p>

        <table role="presentation" width="100%" style="margin-top:28px;border-collapse:collapse;">
          ${itemRows}
        </table>

        <table role="presentation" width="100%" style="margin-top:20px;border-collapse:collapse;">
          ${totalsHtml}
        </table>

        <div style="margin-top:28px;padding-top:20px;border-top:1px solid #e5e5e5;">
          <p style="margin:0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#737373;">
            Ship to
          </p>
          <p style="margin:8px 0 0;font-size:14px;line-height:1.6;color:#171717;">
            ${addressBlock(order)}
          </p>
        </div>

        ${
          order.razorpayPaymentId
            ? `<p style="margin:20px 0 0;font-size:12px;color:#737373;">
                Payment ID: ${escapeHtml(order.razorpayPaymentId)}
              </p>`
            : ""
        }

        <p style="margin:28px 0 0;font-size:13px;line-height:1.6;color:#525252;">
          ${
            order.userId
              ? `View your order:`
              : `Save your order number. View confirmation:`
          }
          <a href="${escapeHtml(orderUrl)}" style="color:#171717;">${escapeHtml(orderUrl)}</a>
        </p>
      </div>
      <p style="margin:16px 8px 0;font-size:11px;color:#a3a3a3;text-align:center;">
        ${brand} · Invoice / order receipt
      </p>
    </div>
  </body>
</html>`;
}

/** Sends invoice-style confirmation to the customer and BCC to the store owner. */
export async function sendOrderConfirmationEmail(order: OrderWithDetails) {
  const to = customerEmail(order);
  if (!to) {
    console.warn(
      `[email] No customer email for order ${order.orderNumber}; skipped confirmation`
    );
    return { skipped: true as const };
  }

  const brand = emailBrandName();
  const notify = getOrderNotifyEmail();

  return sendEmail({
    to,
    bcc: notify && notify.toLowerCase() !== to.toLowerCase() ? notify : null,
    subject: `${brand} invoice — ${order.orderNumber}`,
    html: buildInvoiceHtml({
      ...order,
      razorpayPaymentId: order.razorpayPaymentId,
    }),
  });
}
