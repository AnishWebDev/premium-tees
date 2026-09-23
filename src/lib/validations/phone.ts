import { z } from "zod";

export function normalizeIndianMobile(value: string): string {
  return value.replace(/\D/g, "").slice(0, 10);
}

export const indianMobileSchema = z
  .string()
  .min(1, "Phone number is required")
  .transform(normalizeIndianMobile)
  .refine((digits) => /^\d{10}$/.test(digits), {
    message: "Enter a valid 10-digit mobile number",
  });
