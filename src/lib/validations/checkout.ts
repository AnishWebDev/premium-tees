import { z } from "zod";

export const checkoutSchema = z
  .object({
    email: z.string().email("Enter a valid email"),
    shippingName: z.string().min(2, "Full name is required"),
    shippingLine1: z.string().min(3, "Address is required"),
    shippingLine2: z.string().optional(),
    shippingCity: z.string().min(2, "City is required"),
    shippingState: z.string().min(2, "State is required"),
    shippingZip: z.string().min(3, "ZIP is required"),
    shippingCountry: z.string().min(2).default("IN"),
    shippingPhone: z.string().optional(),
    sameAsBilling: z.boolean().default(true),
    billingName: z.string().optional(),
    billingLine1: z.string().optional(),
    billingLine2: z.string().optional(),
    billingCity: z.string().optional(),
    billingState: z.string().optional(),
    billingZip: z.string().optional(),
    billingCountry: z.string().optional(),
    shippingMethod: z.enum(["standard", "express", "overnight"]).default("standard"),
    couponCode: z.string().optional(),
    notes: z.string().max(500).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.sameAsBilling) {
      if (!data.billingName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Billing name is required",
          path: ["billingName"],
        });
      }
      if (!data.billingLine1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Billing address is required",
          path: ["billingLine1"],
        });
      }
      if (!data.billingCity) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Billing city is required",
          path: ["billingCity"],
        });
      }
      if (!data.billingState) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Billing state is required",
          path: ["billingState"],
        });
      }
      if (!data.billingZip) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Billing ZIP is required",
          path: ["billingZip"],
        });
      }
    }
  });

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(20),
});

export const newsletterSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CartItemInput = z.infer<typeof cartItemSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
