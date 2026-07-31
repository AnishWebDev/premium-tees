import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { getSiteUrl } from "@/lib/site-url";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(
  amount: number | string,
  currency = "INR",
  locale = "en-IN"
): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
): string {
  return new Intl.DateTimeFormat("en-US", options).format(new Date(date));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PT-${timestamp}-${random}`;
}

/** Simplified GST estimate for India apparel (5%). */
export function calculateTax(subtotal: number, _state?: string): number {
  return Math.round(subtotal * 0.05);
}

export function calculateShipping(subtotal: number, method = "standard"): number {
  if (subtotal >= 1999) return 0;
  const rates: Record<string, number> = {
    standard: 79,
    express: 149,
    overnight: 249,
  };
  return rates[method] ?? 79;
}

export function getDiscountAmount(
  subtotal: number,
  discountType: string,
  discountValue: number
): number {
  if (discountType === "PERCENT") {
    return Math.round(subtotal * (discountValue / 100) * 100) / 100;
  }
  return Math.min(discountValue, subtotal);
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return `${str.slice(0, length).trim()}…`;
}

export function getInitials(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function stockStatus(quantity: number, reserved = 0, lowStock = 5) {
  const available = quantity - reserved;
  if (available <= 0) return { label: "Out of stock", available: 0, status: "out" as const };
  if (available <= lowStock)
    return { label: `Only ${available} left`, available, status: "low" as const };
  return { label: "In stock", available, status: "in" as const };
}
