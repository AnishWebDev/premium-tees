import type { Prisma } from "@prisma/client";

export const DEFAULT_SITE_ORDER_CODE = "PT";

const SIZE_CODES: Record<string, string> = {
  XS: "XS",
  S: "SM",
  M: "MD",
  L: "LG",
  XL: "XL",
  XXL: "2X",
};

const COLOR_CODES: Record<string, string> = {
  black: "BLK",
  white: "WHT",
  navy: "NVY",
  stone: "STN",
  red: "RED",
  blue: "BLU",
  green: "GRN",
  grey: "GRY",
  gray: "GRY",
};

export function siteOrderCodeFromName(siteName: string): string {
  const words = siteName
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (words.length >= 2) {
    return words
      .slice(0, 2)
      .map((w) => w[0]!)
      .join("")
      .toUpperCase();
  }
  const compact = siteName.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return (compact.slice(0, 2) || DEFAULT_SITE_ORDER_CODE).padEnd(2, "X");
}

export function productOrderCode(slug: string): string {
  const compact = slug.replace(/[^a-z0-9]/gi, "").toUpperCase();
  if (compact.length >= 4) return compact.slice(0, 4);
  return compact.padEnd(4, "X");
}

export function sizeOrderCode(size: string): string {
  const key = size.trim().toUpperCase();
  return SIZE_CODES[key] ?? key.slice(0, 3).padEnd(3, "X");
}

export function colorOrderCode(color: string): string {
  const key = color.trim().toLowerCase();
  if (COLOR_CODES[key]) return COLOR_CODES[key]!;
  const letters = color.replace(/[^a-z]/gi, "").toUpperCase();
  return (letters.slice(0, 3) || "CLR").padEnd(3, "X");
}

export function formatLineOrderNumber(parts: {
  siteCode: string;
  productSlug: string;
  size: string;
  color: string;
  sequence: number;
}): string {
  const seq = String(parts.sequence).padStart(5, "0");
  return `${parts.siteCode}-${productOrderCode(parts.productSlug)}-${sizeOrderCode(parts.size)}-${colorOrderCode(parts.color)}-${seq}`;
}

export function composeOrderNumber(lineOrderNumbers: string[]): string {
  if (lineOrderNumbers.length === 0) {
    throw new Error("Order must include at least one line");
  }
  if (lineOrderNumbers.length === 1) return lineOrderNumbers[0]!;
  return lineOrderNumbers.join(" · ");
}

type Tx = Prisma.TransactionClient;

export async function allocateLineOrderNumber(
  tx: Tx,
  input: {
    siteCode: string;
    productSlug: string;
    size: string;
    color: string;
    variantId: string;
  }
): Promise<string> {
  const counter = await tx.variantOrderCounter.upsert({
    where: { variantId: input.variantId },
    create: { variantId: input.variantId, lastSequence: 1 },
    update: { lastSequence: { increment: 1 } },
    select: { lastSequence: true },
  });

  return formatLineOrderNumber({
    siteCode: input.siteCode,
    productSlug: input.productSlug,
    size: input.size,
    color: input.color,
    sequence: counter.lastSequence,
  });
}
