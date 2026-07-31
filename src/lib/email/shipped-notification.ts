import type { Order, OrderItem, User } from "@prisma/client";
import { orderSuccessPath } from "@/lib/order-access";
import { getSiteUrl } from "@/lib/site-url";
import {
  emailBrandName,
  escapeHtml,
  getOrderNotifyEmail,
  sendEmail,
} from "@/lib/email";

type OrderWithDetails = Order & {
  items?: OrderItem[];
  user?: Pick<User, "email" | "name"> | null;
};

function customerEmail(order: OrderWithDetails) {
  return order.guestEmail || order.user?.email || null;
}

export async function sendOrderShippedEmail(order: OrderWithDetails) {
  const to = customerEmail(order);
  if (!to) {
    console.warn(
      `[email] No customer email for order ${order.orderNumber}; skipped shipped notice`
    );
    return { skipped: true as const };
  }

  const brand = emailBrandName();
  const siteUrl = getSiteUrl();
  const orderUrl = order.userId
    ? `${siteUrl}/orders/${order.id}`
    : `${siteUrl}${orderSuccessPath(order.orderNumber)}`;
  const notify = getOrderNotifyEmail();

  const trackingLine =
    order.trackingNumber || order.carrier
      ? `<p style="margin:16px 0 0;font-size:14px;line-height:1.6;color:#171717;">
          ${order.carrier ? `<strong>${escapeHtml(order.carrier)}</strong><br />` : ""}
          ${
            order.trackingNumber
              ? `Tracking number: <strong>${escapeHtml(order.trackingNumber)}</strong>`
              : "Tracking details will follow shortly."
          }
        </p>`
      : `<p style="margin:16px 0 0;font-size:14px;color:#525252;">
          Your package is on its way. Tracking details will appear in your order page when available.
        </p>`;

  const html = `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#f5f5f5;font-family:Georgia,'Times New Roman',serif;">
    <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
      <div style="background:#ffffff;border:1px solid #e5e5e5;padding:32px 28px;">
        <p style="margin:0;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#737373;">
          ${escapeHtml(brand)}
        </p>
        <h1 style="margin:12px 0 0;font-size:28px;line-height:1.2;color:#171717;font-weight:600;">
          Your order has shipped
        </h1>
        <p style="margin:12px 0 0;font-size:14px;line-height:1.6;color:#525252;">
          Good news — order <strong style="color:#171717;">${escapeHtml(order.orderNumber)}</strong>
          is on its way to you.
        </p>
        ${trackingLine}
        <p style="margin:28px 0 0;font-size:13px;line-height:1.6;color:#525252;">
          View order:
          <a href="${escapeHtml(orderUrl)}" style="color:#171717;">${escapeHtml(orderUrl)}</a>
        </p>
      </div>
    </div>
  </body>
</html>`;

  return sendEmail({
    to,
    bcc: notify && notify.toLowerCase() !== to.toLowerCase() ? notify : null,
    subject: `${brand} — order ${order.orderNumber} shipped`,
    html,
  });
}
