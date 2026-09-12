import { google } from "googleapis";
import type { Order, OrderItem, User } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const SHEET_HEADERS = [
  "Order Number",
  "Status",
  "Created At",
  "Updated At",
  "Email",
  "Name",
  "Phone",
  "Address Line 1",
  "Address Line 2",
  "City",
  "State",
  "ZIP",
  "Country",
  "Items",
  "Subtotal",
  "Shipping",
  "Tax",
  "Discount",
  "Total",
  "Notes",
  "Payment ID",
] as const;

type OrderForSheet = Order & {
  items: OrderItem[];
  user?: Pick<User, "email" | "name"> | null;
};

function getSpreadsheetId(): string | null {
  return process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim() || null;
}

function getTabName(): string {
  return process.env.GOOGLE_SHEETS_TAB_NAME?.trim() || "Orders";
}

export function getGoogleSheetsUrl(): string | null {
  const id = getSpreadsheetId();
  if (!id) return null;
  return `https://docs.google.com/spreadsheets/d/${id}/edit`;
}

export function isGoogleSheetsConfigured(): boolean {
  return Boolean(
    getSpreadsheetId() &&
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim() &&
      process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.trim()
  );
}

function getPrivateKey(): string {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ?? "";
  return raw.replace(/\\n/g, "\n");
}

async function getSheetsClient() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: getPrivateKey(),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

/** Human-readable date/time for spreadsheet rows (India Standard Time). */
export function formatSheetDateTime(date: Date): string {
  const formatted = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);

  return `${formatted} IST`;
}

function formatItems(items: OrderItem[]): string {
  return items
    .map(
      (item) =>
        `${item.name} (${item.color}/${item.size}) ×${item.quantity} @ ${Number(item.price)}`
    )
    .join("; ");
}

function orderEmail(order: OrderForSheet): string {
  return order.user?.email ?? order.guestEmail ?? "";
}

function orderToRow(order: OrderForSheet): string[] {
  return [
    order.orderNumber,
    order.status,
    formatSheetDateTime(order.createdAt),
    formatSheetDateTime(order.updatedAt),
    orderEmail(order),
    order.shippingName,
    order.shippingPhone ?? "",
    order.shippingLine1,
    order.shippingLine2 ?? "",
    order.shippingCity,
    order.shippingState,
    order.shippingZip,
    order.shippingCountry,
    formatItems(order.items),
    String(Number(order.subtotal)),
    String(Number(order.shippingCost)),
    String(Number(order.tax)),
    String(Number(order.discount)),
    String(Number(order.total)),
    order.notes ?? "",
    order.razorpayPaymentId ?? "",
  ];
}

async function ensureHeaders(sheets: ReturnType<typeof google.sheets>) {
  const spreadsheetId = getSpreadsheetId()!;
  const tab = getTabName();
  const range = `${tab}!A1:U1`;

  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  const firstCell = existing.data.values?.[0]?.[0];
  if (firstCell === SHEET_HEADERS[0]) return;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: "RAW",
    requestBody: { values: [Array.from(SHEET_HEADERS)] },
  });
}

async function findRowIndex(
  sheets: ReturnType<typeof google.sheets>,
  orderNumber: string
): Promise<number | null> {
  const spreadsheetId = getSpreadsheetId()!;
  const tab = getTabName();
  const column = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${tab}!A:A`,
  });

  const rows = column.data.values ?? [];
  for (let i = 1; i < rows.length; i++) {
    if (rows[i]?.[0] === orderNumber) {
      return i + 1;
    }
  }
  return null;
}

export async function syncOrderToGoogleSheets(order: OrderForSheet): Promise<void> {
  if (!isGoogleSheetsConfigured()) return;

  const sheets = await getSheetsClient();
  const spreadsheetId = getSpreadsheetId()!;
  const tab = getTabName();

  await ensureHeaders(sheets);

  const row = orderToRow(order);
  const existingRow = await findRowIndex(sheets, order.orderNumber);

  if (existingRow) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${tab}!A${existingRow}:U${existingRow}`,
      valueInputOption: "RAW",
      requestBody: { values: [row] },
    });
    return;
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${tab}!A:U`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [row] },
  });
}

/** Load order with relations and sync to Google Sheets (non-blocking for callers). */
export async function syncOrderById(orderId: string): Promise<void> {
  if (!isGoogleSheetsConfigured()) return;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      user: { select: { email: true, name: true } },
    },
  });

  if (!order) return;

  await syncOrderToGoogleSheets(order);
}

export async function syncOrderByIdSafe(orderId: string): Promise<void> {
  try {
    await syncOrderById(orderId);
  } catch (error) {
    console.error(`[google-sheets] sync failed for order ${orderId}`, error);
  }
}
