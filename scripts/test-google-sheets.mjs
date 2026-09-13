import { google } from "googleapis";

const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim();
const tab = process.env.GOOGLE_SHEETS_TAB_NAME?.trim() || "Orders";
const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
const key = (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ?? "").replace(
  /\\n/g,
  "\n"
);

if (!spreadsheetId || !email || !key) {
  console.error("Missing GOOGLE_SHEETS_* env vars");
  process.exit(1);
}

const auth = new google.auth.JWT({
  email,
  key,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

function formatSheetDateTime(date) {
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

const meta = await sheets.spreadsheets.get({ spreadsheetId });
const tabNames = meta.data.sheets?.map((s) => s.properties?.title) ?? [];
console.log("Spreadsheet tabs:", tabNames.join(", "));

const resolvedTab = tabNames.includes(tab)
  ? tab
  : tabNames[0] ?? tab;

if (resolvedTab !== tab) {
  console.warn(`Tab "${tab}" not found — using "${resolvedTab}"`);
}

await sheets.spreadsheets.values.update({
  spreadsheetId,
  range: `${resolvedTab}!A1:V1`,
  valueInputOption: "RAW",
  requestBody: {
    values: [
      [
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
      ],
    ],
  },
});

await sheets.spreadsheets.values.append({
  spreadsheetId,
  range: `${resolvedTab}!A:V`,
  valueInputOption: "RAW",
  insertDataOption: "INSERT_ROWS",
  requestBody: {
    values: [
      [
        "TEST-0001",
        "LEAD",
        formatSheetDateTime(new Date()),
        formatSheetDateTime(new Date()),
        "test@premiumtees.com",
        "Test",
        "Customer",
        "+91 99999 99999",
        "123 Test Street",
        "",
        "Mumbai",
        "Maharashtra",
        "400001",
        "IN",
        "Sample Tee (Black/M) ×1 @ 1299",
        "1299",
        "79",
        "0",
        "0",
        "1378",
        "Connection test row — safe to delete",
        "",
      ],
    ],
  },
});

console.log(`OK — headers + test row written to tab "${resolvedTab}"`);
