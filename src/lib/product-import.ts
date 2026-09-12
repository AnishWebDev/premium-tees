import { isAudienceId, type AudienceId } from "@/lib/audience";
import { rowsToObjects, parseCsv } from "@/lib/csv-parse";
import { slugify } from "@/lib/utils";
import { productSchema, type ProductInput } from "@/lib/validations/product";

export const PRODUCT_IMPORT_HEADERS = [
  "name",
  "slug",
  "category",
  "audience",
  "description",
  "short_desc",
  "price",
  "compare_at",
  "image_urls",
  "sizes",
  "colors",
  "stock",
  "featured",
  "best_seller",
  "new_arrival",
  "active",
  "material",
  "fit",
  "care",
  "origin",
  "tags",
] as const;

export const PRODUCT_IMPORT_TEMPLATE_ROW = {
  name: "Essential Crew Tee",
  slug: "essential-crew-tee",
  category: "essentials",
  audience: "men",
  description:
    "Our signature crew neck tee in 220gsm organic cotton. Pre-shrunk, garment-dyed, and finished with a soft hand feel.",
  short_desc: "Premium organic cotton crew neck",
  price: "799",
  compare_at: "999",
  image_urls: "https://images.pexels.com/photos/7671166/pexels-photo-7671166.jpeg",
  sizes: "S|M|L|XL|XXL",
  colors: "Black|White|Stone",
  stock: "25",
  featured: "true",
  best_seller: "true",
  new_arrival: "false",
  active: "true",
  material: "100% Organic Cotton",
  fit: "Regular",
  care: "Machine wash cold, tumble dry low",
  origin: "Portugal",
  tags: "essentials|organic|crew-neck",
};

export type ImportRowError = {
  row: number;
  name?: string;
  message: string;
};

export type ParsedImportRow = {
  row: number;
  input: ProductInput;
  slug: string;
};

type CategoryLookup = Map<string, string>;

export function buildImportTemplateCsv(): string {
  const header = PRODUCT_IMPORT_HEADERS.join(",");
  const example = PRODUCT_IMPORT_HEADERS.map((key) =>
    escapeCsvCell(PRODUCT_IMPORT_TEMPLATE_ROW[key])
  ).join(",");
  return `${header}\n${example}\n`;
}

export function parseProductImportCsv(
  csvText: string,
  categoryLookup: CategoryLookup
): { rows: ParsedImportRow[]; errors: ImportRowError[] } {
  const objects = rowsToObjects(parseCsv(csvText));
  const rows: ParsedImportRow[] = [];
  const errors: ImportRowError[] = [];

  objects.forEach((raw, index) => {
    const rowNumber = index + 2;
    const result = rowToProductInput(raw, categoryLookup);

    if ("error" in result) {
      errors.push({ row: rowNumber, name: raw.name, message: result.error });
      return;
    }

    const parsed = productSchema.safeParse(result.input);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const message = Object.entries(fieldErrors)
        .map(([field, msgs]) => `${field}: ${(msgs ?? []).join(", ")}`)
        .join("; ");
      errors.push({ row: rowNumber, name: raw.name, message: message || "Validation failed" });
      return;
    }

    rows.push({
      row: rowNumber,
      input: parsed.data,
      slug: parsed.data.slug ?? slugify(parsed.data.name),
    });
  });

  return { rows, errors };
}

function rowToProductInput(
  raw: Record<string, string>,
  categoryLookup: CategoryLookup
): { input: ProductInput } | { error: string } {
  const name = raw.name?.trim();
  if (!name) {
    return { error: "name is required" };
  }

  const categoryKey = (raw.category ?? "").trim().toLowerCase();
  if (!categoryKey) {
    return { error: "category is required (use category slug or name)" };
  }

  const categoryId = categoryLookup.get(categoryKey);
  if (!categoryId) {
    return { error: `Unknown category "${raw.category}". Use an existing category slug or name.` };
  }

  const imageUrls = splitList(raw.image_urls ?? raw.images ?? raw.image_url, []);
  if (imageUrls.length === 0) {
    return { error: "image_urls is required (pipe-separated https URLs)" };
  }

  for (const url of imageUrls) {
    if (!/^https?:\/\/.+/i.test(url)) {
      return { error: `Invalid image URL: "${url}"` };
    }
  }

  const price = parseNumber(raw.price);
  if (price === null || price <= 0) {
    return { error: "price must be a positive number" };
  }

  const compareAt = raw.compare_at?.trim() ? parseNumber(raw.compare_at) : null;
  if (raw.compare_at?.trim() && (compareAt === null || compareAt <= 0)) {
    return { error: "compare_at must be a positive number when provided" };
  }

  const sizes = splitList(raw.sizes, ["S", "M", "L", "XL"]);
  const colors = splitList(raw.colors, ["Black", "White"]);
  if (colors.length === 0) {
    return { error: "colors must include at least one value" };
  }

  const stock = raw.stock?.trim() ? parseInt(raw.stock, 10) : 10;
  if (Number.isNaN(stock) || stock < 0) {
    return { error: "stock must be a non-negative integer" };
  }

  const description = ensureDescription(raw.description ?? "", raw.short_desc);
  const slug = raw.slug?.trim() || undefined;

  const audienceRaw = (raw.audience ?? "men").trim().toLowerCase();
  if (!isAudienceId(audienceRaw)) {
    return { error: `Invalid audience "${raw.audience}". Use men, women, girl, or boy.` };
  }
  const audience = audienceRaw as AudienceId;

  const variants = sizes.flatMap((size) =>
    colors.map((color) => ({
      size,
      color,
      quantity: stock,
    }))
  );

  return {
    input: {
      name,
      slug,
      description,
      shortDesc: raw.short_desc?.trim() || undefined,
      price,
      compareAt,
      featured: parseBoolean(raw.featured, false),
      bestSeller: parseBoolean(raw.best_seller, false),
      newArrival: parseBoolean(raw.new_arrival, false),
      active: parseBoolean(raw.active, true),
      audience,
      material: raw.material?.trim() || undefined,
      fit: raw.fit?.trim() || undefined,
      care: raw.care?.trim() || undefined,
      origin: raw.origin?.trim() || undefined,
      tags: splitList(raw.tags, []),
      categoryId,
      images: imageUrls.map((url, index) => ({
        url,
        alt: name,
        sortOrder: index,
      })),
      variants,
    },
  };
}

export function buildCategoryLookup(
  categories: Array<{ id: string; name: string; slug: string }>
): CategoryLookup {
  const lookup = new Map<string, string>();

  for (const category of categories) {
    lookup.set(category.slug.toLowerCase(), category.id);
    lookup.set(category.name.toLowerCase(), category.id);
    lookup.set(slugify(category.name), category.id);
  }

  return lookup;
}

function splitList(value: string | undefined, fallback: string[]): string[] {
  if (!value?.trim()) return [...fallback];
  return value
    .split(/[|,]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (!value?.trim()) return defaultValue;
  const normalized = value.trim().toLowerCase();
  if (["true", "yes", "1", "y"].includes(normalized)) return true;
  if (["false", "no", "0", "n"].includes(normalized)) return false;
  return defaultValue;
}

function parseNumber(value: string): number | null {
  const cleaned = value.replace(/[₹,\s]/g, "");
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

function ensureDescription(description: string, shortDesc?: string): string {
  const desc = description.trim();
  if (desc.length >= 20) return desc;

  const short = shortDesc?.trim() ?? "";
  if (short.length >= 20) return short;

  if (desc.length > 0) {
    return `${desc} Premium quality apparel crafted for everyday wear.`;
  }

  return "Premium quality apparel crafted for everyday comfort and style.";
}

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
