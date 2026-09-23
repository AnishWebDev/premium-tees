import { z } from "zod";
import {
  INDIA_STATE_OPTIONS,
  OTHER_CITY,
  OTHER_STATE,
  getCitiesForState,
  resolveCityValue,
  resolveStateValue,
} from "@/lib/india-locations";

export const pinCodeSchema = z
  .string()
  .regex(/^\d{6}$/, "Enter a valid 6-digit PIN code");

/** API / order payload — unchanged shape for DB and Razorpay. */
export const checkoutSchema = z
  .object({
    email: z.string().email("Enter a valid email"),
    shippingName: z.string().min(2, "Full name is required"),
    shippingLine1: z.string().min(3, "Address is required"),
    shippingLine2: z.string().optional(),
    shippingCity: z.string().min(2, "City is required"),
    shippingState: z.string().min(2, "State is required"),
    shippingZip: pinCodeSchema,
    shippingCountry: z.string().min(2).default("IN"),
    shippingPhone: z.string().optional(),
    shippingMethod: z.enum(["standard", "express", "overnight"]).default("standard"),
    couponCode: z.string().optional(),
    notes: z.string().max(500).optional(),
  });

function validateIndiaAddress(
  ctx: z.RefinementCtx,
  prefix: "shipping" | "billing",
  data: {
    state: string;
    stateOther?: string;
    city: string;
    cityOther?: string;
    zip: string;
  }
) {
  if (!data.state || !INDIA_STATE_OPTIONS.includes(data.state)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Select a state",
      path: [`${prefix}State`],
    });
    return;
  }

  if (data.state === OTHER_STATE) {
    const stateOther = data.stateOther?.trim() ?? "";
    if (stateOther.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter your state or UT name",
        path: [`${prefix}StateOther`],
      });
    }
    const cityOther = data.cityOther?.trim() ?? "";
    if (cityOther.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter your city name",
        path: [`${prefix}CityOther`],
      });
    }
  } else {
    if (!data.city) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select a city",
        path: [`${prefix}City`],
      });
    } else {
      const cities = getCitiesForState(data.state);
      if (!cities.includes(data.city)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Select a valid city",
          path: [`${prefix}City`],
        });
      }
      if (data.city === OTHER_CITY) {
        const other = data.cityOther?.trim() ?? "";
        if (other.length < 2) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Enter your city name",
            path: [`${prefix}CityOther`],
          });
        }
      }
    }
  }

  const pinResult = pinCodeSchema.safeParse(data.zip);
  if (!pinResult.success) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: pinResult.error.errors[0]?.message ?? "Invalid PIN code",
      path: [`${prefix}Zip`],
    });
  }
}

/** Checkout form fields (UI) — first/last name, state→city dropdowns. */
export const checkoutFormSchema = z
  .object({
    email: z.string().email("Enter a valid email"),
    shippingFirstName: z.string().min(1, "First name is required"),
    shippingLastName: z.string().min(1, "Last name is required"),
    shippingLine1: z.string().min(3, "Address is required"),
    shippingLine2: z.string().optional(),
    shippingState: z.string().min(1, "Select a state"),
    shippingStateOther: z.string().optional(),
    shippingCity: z.string().optional(),
    shippingCityOther: z.string().optional(),
    shippingZip: pinCodeSchema,
    shippingCountry: z.literal("IN").default("IN"),
    shippingPhone: z.string().optional(),
    shippingMethod: z.enum(["standard", "express", "overnight"]).default("standard"),
    couponCode: z.string().optional(),
    notes: z.string().max(500).optional(),
  })
  .superRefine((data, ctx) => {
    validateIndiaAddress(ctx, "shipping", {
      state: data.shippingState,
      stateOther: data.shippingStateOther,
      city: data.shippingCity ?? "",
      cityOther: data.shippingCityOther,
      zip: data.shippingZip,
    });
  });

export function toCheckoutPayload(data: CheckoutFormInput): CheckoutInput {
  const shippingState = resolveStateValue(data.shippingState, data.shippingStateOther);
  const shippingCity =
    data.shippingState === OTHER_STATE
      ? (data.shippingCityOther?.trim() ?? "")
      : resolveCityValue(data.shippingCity ?? "", data.shippingCityOther);
  const shippingName = `${data.shippingFirstName.trim()} ${data.shippingLastName.trim()}`.trim();

  return {
    email: data.email,
    shippingName,
    shippingLine1: data.shippingLine1,
    shippingLine2: data.shippingLine2,
    shippingCity,
    shippingState,
    shippingZip: data.shippingZip,
    shippingCountry: "IN",
    shippingPhone: data.shippingPhone,
    shippingMethod: data.shippingMethod,
    couponCode: data.couponCode,
    notes: data.notes,
  };
}

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
export type CheckoutFormInput = z.infer<typeof checkoutFormSchema>;
export type CartItemInput = z.infer<typeof cartItemSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
