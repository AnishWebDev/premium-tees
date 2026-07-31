import type { Order, ReturnRequest, User } from "@prisma/client";
import {
  emailBrandName,
  escapeHtml,
  getOrderNotifyEmail,
  sendEmail,
} from "@/lib/email";

type ReturnWithOrder = ReturnRequest & {
  order: Order & { user?: Pick<User, "email" | "name"> | null };
  user: Pick<User, "email" | "name">;
};

export async function sendReturnRequestAdminEmail(request: ReturnWithOrder) {
  const notify = getOrderNotifyEmail();
  if (!notify) {
    console.warn("[email] ORDER_NOTIFY_EMAIL not set; skipped return admin notice");
    return { skipped: true as const };
  }

  const brand = emailBrandName();
  const customer =
    request.user.email ||
    request.order.guestEmail ||
    request.order.user?.email ||
    "unknown";

  const html = `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:24px;font-family:Georgia,'Times New Roman',serif;color:#171717;">
    <h1 style="font-size:22px;">New return request</h1>
    <p>Order <strong>${escapeHtml(request.order.orderNumber)}</strong></p>
    <p>Customer: ${escapeHtml(customer)}</p>
    <p>Reason: ${escapeHtml(request.reason)}</p>
    ${
      request.notes
        ? `<p>Notes: ${escapeHtml(request.notes)}</p>`
        : ""
    }
    <p>Review in admin → Returns.</p>
  </body>
</html>`;

  return sendEmail({
    to: notify,
    subject: `${brand} — return request ${request.order.orderNumber}`,
    html,
  });
}

export async function sendReturnStatusEmail(request: ReturnWithOrder) {
  const to =
    request.user.email ||
    request.order.guestEmail ||
    request.order.user?.email ||
    null;
  if (!to) return { skipped: true as const };

  const brand = emailBrandName();
  const statusLabel = request.status.toLowerCase();

  const html = `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:24px;font-family:Georgia,'Times New Roman',serif;color:#171717;">
    <h1 style="font-size:22px;">Return update</h1>
    <p>
      Your return request for order
      <strong>${escapeHtml(request.order.orderNumber)}</strong>
      is now <strong>${escapeHtml(statusLabel)}</strong>.
    </p>
    ${
      request.adminNote
        ? `<p>Note from us: ${escapeHtml(request.adminNote)}</p>`
        : ""
    }
  </body>
</html>`;

  return sendEmail({
    to,
    bcc: getOrderNotifyEmail(),
    subject: `${brand} — return ${statusLabel} (${request.order.orderNumber})`,
    html,
  });
}
