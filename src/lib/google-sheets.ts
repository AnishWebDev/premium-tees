import { google } from "googleapis";
import type { Order, OrderItem, User } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { splitFullName } from "@/lib/india-locations";

const SHEET_HEADERS = [
  "Order Number",
  "Status",
  "Created At",
  "Updated At",
  "Email",
  "First Name",
  "Last Name",
  "Phone",
  "Address Line 1",
  "Address Line 2",
  "City",
  "State / UT",
  "PIN Code",
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

const SHEET_LAST_COLUMN = "V";

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
  const { firstName, lastName } = splitFullName(order.shippingName);

  return [
    order.orderNumber,
    order.status,
    formatSheetDateTime(order.createdAt),
    formatSheetDateTime(order.updatedAt),
    orderEmail(order),
    firstName,
    lastName,
    order.shippingPhone ?? "",
    order.shippingLine1,
    order.shippingLine2 ?? "",
    order.shippingCity,
    order.shippingState,
    order.shippingZip,
    order.shippingCountry || "IN",
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

function headersMatch(existing: string[] | undefined): boolean {
  if (!existing || existing.length !== SHEET_HEADERS.length) return false;
  return SHEET_HEADERS.every((header, index) => existing[index] === header);
}

async function ensureHeaders(sheets: ReturnType<typeof google.sheets>) {
  const spreadsheetId = getSpreadsheetId()!;
  const tab = getTabName();
  const range = `${tab}!A1:${SHEET_LAST_COLUMN}1`;

  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  const existingRow = existing.data.values?.[0];
  if (headersMatch(existingRow)) return;

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
      range: `${tab}!A${existingRow}:${SHEET_LAST_COLUMN}${existingRow}`,
      valueInputOption: "RAW",
      requestBody: { values: [row] },
    });
    return;
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${tab}!A:${SHEET_LAST_COLUMN}`,
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

const CONTACT_HEADERS = [
  "Submitted At",
  "Name",
  "Email",
  "Subject",
  "Message",
] as const;

/** Older manual sheets often omit the timestamp column. */
const LEGACY_CONTACT_HEADERS = ["Name", "Email", "Subject", "Message"] as const;

const CONTACT_LAST_COLUMN = "E";
const LEGACY_CONTACT_LAST_COLUMN = "D";

function sheetRange(tabName: string, a1Range: string): string {
  const escaped = tabName.replace(/'/g, "''");
  return `'${escaped}'!${a1Range}`;
}

function getContactTabName(): string {
  return process.env.GOOGLE_SHEETS_CONTACT_TAB_NAME?.trim() || "Contact";
}

export type ContactSheetInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

function contactHeadersMatch(existing: string[] | undefined): boolean {
  if (!existing || existing.length !== CONTACT_HEADERS.length) return false;
  return CONTACT_HEADERS.every((header, index) => existing[index] === header);
}

function legacyContactHeadersMatch(existing: string[] | undefined): boolean {
  if (!existing || existing.length !== LEGACY_CONTACT_HEADERS.length) return false;
  return LEGACY_CONTACT_HEADERS.every((header, index) => existing[index] === header);
}

type ContactHeaderFormat = "standard" | "legacy";

async function nextContactRow(
  sheets: ReturnType<typeof google.sheets>,
  tab: string
): Promise<number> {
  const column = await sheets.spreadsheets.values.get({
    spreadsheetId: getSpreadsheetId()!,
    range: sheetRange(tab, "A:A"),
  });
  const rowCount = column.data.values?.length ?? 0;
  return Math.max(rowCount, 1) + 1;
}

async function ensureContactTabExists(sheets: ReturnType<typeof google.sheets>) {
  const spreadsheetId = getSpreadsheetId()!;
  const tab = getContactTabName();
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const exists = meta.data.sheets?.some((sheet) => sheet.properties?.title === tab);
  if (exists) return;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{ addSheet: { properties: { title: tab } } }],
    },
  });
}

async function ensureContactHeaders(
  sheets: ReturnType<typeof google.sheets>
): Promise<ContactHeaderFormat> {
  const spreadsheetId = getSpreadsheetId()!;
  const tab = getContactTabName();
  const range = sheetRange(tab, `A1:${CONTACT_LAST_COLUMN}1`);

  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  const existingRow = existing.data.values?.[0];
  if (contactHeadersMatch(existingRow)) return "standard";
  if (legacyContactHeadersMatch(existingRow)) return "legacy";

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: "RAW",
    requestBody: { values: [Array.from(CONTACT_HEADERS)] },
  });
  return "standard";
}

export async function appendContactToGoogleSheets(
  input: ContactSheetInput
): Promise<void> {
  if (!isGoogleSheetsConfigured()) {
    throw new Error("Google Sheets is not configured");
  }

  const sheets = await getSheetsClient();
  const spreadsheetId = getSpreadsheetId()!;
  const tab = getContactTabName();

  await ensureContactTabExists(sheets);
  const headerFormat = await ensureContactHeaders(sheets);
  const nextRow = await nextContactRow(sheets, tab);

  const trimmedMessage = input.message.trim();
  const standardRow = [
    formatSheetDateTime(new Date()),
    input.name.trim(),
    input.email.trim(),
    input.subject.trim(),
    trimmedMessage,
  ];
  const legacyRow = [
    input.name.trim(),
    input.email.trim(),
    input.subject.trim(),
    trimmedMessage,
  ];
  const row = headerFormat === "legacy" ? legacyRow : standardRow;
  const lastColumn =
    headerFormat === "legacy" ? LEGACY_CONTACT_LAST_COLUMN : CONTACT_LAST_COLUMN;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: sheetRange(tab, `A${nextRow}:${lastColumn}${nextRow}`),
    valueInputOption: "RAW",
    requestBody: { values: [row] },
  });
}

const NEWSLETTER_HEADERS = ["Email", "Subscribed At", "Updated At", "Active"] as const;
const NEWSLETTER_LAST_COLUMN = "D";

function getNewsletterTabName(): string {
  return process.env.GOOGLE_SHEETS_NEWSLETTER_TAB_NAME?.trim() || "Newsletter";
}

function newsletterHeadersMatch(existing: string[] | undefined): boolean {
  if (!existing || existing.length !== NEWSLETTER_HEADERS.length) return false;
  return NEWSLETTER_HEADERS.every((header, index) => existing[index] === header);
}

async function ensureNewsletterTabExists(sheets: ReturnType<typeof google.sheets>) {
  const spreadsheetId = getSpreadsheetId()!;
  const tab = getNewsletterTabName();
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const exists = meta.data.sheets?.some((sheet) => sheet.properties?.title === tab);
  if (exists) return;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{ addSheet: { properties: { title: tab } } }],
    },
  });
}

async function ensureNewsletterHeaders(sheets: ReturnType<typeof google.sheets>) {
  const spreadsheetId = getSpreadsheetId()!;
  const tab = getNewsletterTabName();
  const range = sheetRange(tab, `A1:${NEWSLETTER_LAST_COLUMN}1`);

  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  const existingRow = existing.data.values?.[0];
  if (newsletterHeadersMatch(existingRow)) return;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: "RAW",
    requestBody: { values: [Array.from(NEWSLETTER_HEADERS)] },
  });
}

async function findNewsletterRowByEmail(
  sheets: ReturnType<typeof google.sheets>,
  email: string
): Promise<number | null> {
  const spreadsheetId = getSpreadsheetId()!;
  const tab = getNewsletterTabName();
  const column = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: sheetRange(tab, "A:A"),
  });

  const normalized = email.trim().toLowerCase();
  const rows = column.data.values ?? [];
  for (let i = 1; i < rows.length; i++) {
    const cell = rows[i]?.[0]?.toString().trim().toLowerCase();
    if (cell === normalized) {
      return i + 1;
    }
  }
  return null;
}

export type NewsletterSheetInput = {
  email: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function newsletterToRow(input: NewsletterSheetInput): string[] {
  return [
    input.email.trim().toLowerCase(),
    formatSheetDateTime(input.createdAt),
    formatSheetDateTime(input.updatedAt),
    input.active ? "yes" : "no",
  ];
}

export async function syncNewsletterToGoogleSheets(
  input: NewsletterSheetInput
): Promise<void> {
  if (!isGoogleSheetsConfigured()) return;

  const sheets = await getSheetsClient();
  const spreadsheetId = getSpreadsheetId()!;
  const tab = getNewsletterTabName();

  await ensureNewsletterTabExists(sheets);
  await ensureNewsletterHeaders(sheets);

  const row = newsletterToRow(input);
  const existingRow = await findNewsletterRowByEmail(sheets, input.email);

  if (existingRow) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: sheetRange(tab, `A${existingRow}:${NEWSLETTER_LAST_COLUMN}${existingRow}`),
      valueInputOption: "RAW",
      requestBody: { values: [row] },
    });
    return;
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: sheetRange(tab, `A:${NEWSLETTER_LAST_COLUMN}`),
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [row] },
  });
}

export async function syncNewsletterToGoogleSheetsSafe(
  input: NewsletterSheetInput
): Promise<void> {
  try {
    await syncNewsletterToGoogleSheets(input);
  } catch (error) {
    console.error("[google-sheets] newsletter sync failed", error);
  }
}

async function getNewsletterSheetId(
  sheets: ReturnType<typeof google.sheets>
): Promise<number> {
  const spreadsheetId = getSpreadsheetId()!;
  const tab = getNewsletterTabName();
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = meta.data.sheets?.find((s) => s.properties?.title === tab);
  if (sheet?.properties?.sheetId == null) {
    throw new Error(`Newsletter tab "${tab}" not found`);
  }
  return sheet.properties.sheetId;
}

/** Remove a subscriber row from the Newsletter tab (no-op if missing). */
export async function removeNewsletterFromGoogleSheets(email: string): Promise<void> {
  if (!isGoogleSheetsConfigured()) return;

  const sheets = await getSheetsClient();
  const spreadsheetId = getSpreadsheetId()!;
  const tab = getNewsletterTabName();

  const rowIndex = await findNewsletterRowByEmail(sheets, email);
  if (!rowIndex) return;

  const sheetId = await getNewsletterSheetId(sheets);

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: rowIndex - 1,
              endIndex: rowIndex,
            },
          },
        },
      ],
    },
  });
}

export async function removeNewsletterFromGoogleSheetsSafe(email: string): Promise<void> {
  try {
    await removeNewsletterFromGoogleSheets(email);
  } catch (error) {
    console.error("[google-sheets] newsletter remove failed", error);
  }
}

async function listNewsletterSheetRows(
  sheets: ReturnType<typeof google.sheets>
): Promise<Array<{ email: string; rowIndex: number }>> {
  const spreadsheetId = getSpreadsheetId()!;
  const tab = getNewsletterTabName();
  const column = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: sheetRange(tab, "A:A"),
  });

  const rows = column.data.values ?? [];
  const result: Array<{ email: string; rowIndex: number }> = [];
  for (let i = 1; i < rows.length; i++) {
    const email = rows[i]?.[0]?.toString().trim().toLowerCase();
    if (email) {
      result.push({ email, rowIndex: i + 1 });
    }
  }
  return result;
}

/** Upsert every DB subscriber to Sheets and remove sheet rows with no DB record. */
export async function syncAllNewslettersFromDatabase(): Promise<{
  synced: number;
  removedFromSheet: number;
}> {
  if (!isGoogleSheetsConfigured()) {
    throw new Error("Google Sheets is not configured");
  }

  const subscribers = await prisma.newsletter.findMany({
    orderBy: { createdAt: "asc" },
  });

  const sheets = await getSheetsClient();
  await ensureNewsletterTabExists(sheets);
  await ensureNewsletterHeaders(sheets);

  const now = new Date();
  for (const sub of subscribers) {
    await syncNewsletterToGoogleSheets({
      email: sub.email,
      active: sub.active,
      createdAt: sub.createdAt,
      updatedAt: now,
    });
  }

  const dbEmails = new Set(subscribers.map((s) => s.email.trim().toLowerCase()));
  const sheetRows = await listNewsletterSheetRows(sheets);
  const orphanRows = sheetRows
    .filter((row) => !dbEmails.has(row.email))
    .sort((a, b) => b.rowIndex - a.rowIndex);

  const spreadsheetId = getSpreadsheetId()!;
  const sheetId = await getNewsletterSheetId(sheets);

  for (const orphan of orphanRows) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId,
                dimension: "ROWS",
                startIndex: orphan.rowIndex - 1,
                endIndex: orphan.rowIndex,
              },
            },
          },
        ],
      },
    });
  }

  return { synced: subscribers.length, removedFromSheet: orphanRows.length };
}
