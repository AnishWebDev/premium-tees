import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(140).optional(),
  description: z.string().min(20),
  shortDesc: z.string().max(200).optional(),
  price: z.coerce.number().positive(),
  compareAt: z.coerce.number().positive().optional().nullable(),
  featured: z.boolean().default(false),
  bestSeller: z.boolean().default(false),
  newArrival: z.boolean().default(false),
  active: z.boolean().default(true),
  material: z.string().optional(),
  fit: z.string().optional(),
  care: z.string().optional(),
  origin: z.string().optional(),
  tags: z.array(z.string()).default([]),
  metaTitle: z.string().max(70).optional(),
  metaDesc: z.string().max(160).optional(),
  categoryId: z.string().min(1, "Category is required"),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        alt: z.string().optional(),
        publicId: z.string().optional(),
        sortOrder: z.number().default(0),
      })
    )
    .min(1, "At least one image is required"),
  variants: z
    .array(
      z.object({
        size: z.string().min(1),
        color: z.string().min(1),
        colorHex: z.string().optional(),
        sku: z.string().optional(),
        price: z.coerce.number().positive().optional().nullable(),
        quantity: z.coerce.number().int().min(0).default(0),
      })
    )
    .min(1, "At least one variant is required"),
});

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  comment: z.string().min(10, "Review must be at least 10 characters").max(2000),
});

export const categorySchema = z.object({
  name: z.string().min(2).max(80),
  slug: z.string().min(2).max(100).optional(),
  description: z.string().optional(),
  image: z.string().url().optional().or(z.literal("")),
  featured: z.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
});

export const couponSchema = z.object({
  code: z.string().min(3).max(30).transform((v) => v.toUpperCase()),
  description: z.string().optional(),
  discountType: z.enum(["PERCENT", "FIXED"]),
  discountValue: z.coerce.number().positive(),
  minOrder: z.coerce.number().positive().optional().nullable(),
  maxUses: z.coerce.number().int().positive().optional().nullable(),
  active: z.boolean().default(true),
  startsAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional().nullable(),
});

export type ProductInput = z.infer<typeof productSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type CouponInput = z.infer<typeof couponSchema>;
