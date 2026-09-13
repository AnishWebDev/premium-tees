import { z } from "zod";
import {
  INDIA_STATE_OPTIONS,
  OTHER_CITY,
  OTHER_STATE,
  getCitiesForState,
  resolveCityValue,
  resolveStateValue,
} from "@/lib/india-locations";

const pinCodeSchema = z
  .string()
  .regex(/^\d{6}$/, "Enter a valid 6-digit PIN code");

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(80),
    email: z.string().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  phone: z.string().optional(),
  image: z.string().url().optional().or(z.literal("")),
});

/** Saved address payload (API / DB). */
export const addressSchema = z.object({
  type: z.enum(["SHIPPING", "BILLING", "BOTH"]),
  isDefault: z.boolean().default(false),
  name: z.string().min(2, "Name is required"),
  line1: z.string().min(3, "Address is required"),
  line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zip: pinCodeSchema,
  country: z.string().min(2).default("IN"),
  phone: z.string().optional(),
});

function validateProfileIndiaAddress(
  ctx: z.RefinementCtx,
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
      path: ["state"],
    });
    return;
  }

  if (data.state === OTHER_STATE) {
    if ((data.stateOther?.trim() ?? "").length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter your state or UT name",
        path: ["stateOther"],
      });
    }
    if ((data.cityOther?.trim() ?? "").length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter your city name",
        path: ["cityOther"],
      });
    }
  } else {
    if (!data.city) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select a city",
        path: ["city"],
      });
    } else {
      const cities = getCitiesForState(data.state);
      if (!cities.includes(data.city)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Select a valid city",
          path: ["city"],
        });
      }
      if (data.city === OTHER_CITY && (data.cityOther?.trim() ?? "").length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter your city name",
          path: ["cityOther"],
        });
      }
    }
  }

  const pinResult = pinCodeSchema.safeParse(data.zip);
  if (!pinResult.success) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: pinResult.error.errors[0]?.message ?? "Invalid PIN code",
      path: ["zip"],
    });
  }
}

/** Profile address form (UI). */
export const addressFormSchema = z
  .object({
    type: z.enum(["SHIPPING", "BILLING", "BOTH"]),
    isDefault: z.boolean().default(false),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    line1: z.string().min(3, "Address is required"),
    line2: z.string().optional(),
    state: z.string().min(1, "Select a state"),
    stateOther: z.string().optional(),
    city: z.string().optional(),
    cityOther: z.string().optional(),
    zip: z.string().min(1, "PIN code is required"),
    country: z.literal("IN").default("IN"),
    phone: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    validateProfileIndiaAddress(ctx, {
      state: data.state,
      stateOther: data.stateOther,
      city: data.city ?? "",
      cityOther: data.cityOther,
      zip: data.zip,
    });
  });

export function toAddressPayload(data: AddressFormInput): AddressInput {
  const state = resolveStateValue(data.state, data.stateOther);
  const city =
    data.state === OTHER_STATE
      ? (data.cityOther?.trim() ?? "")
      : resolveCityValue(data.city ?? "", data.cityOther);

  return {
    type: data.type,
    isDefault: data.isDefault,
    name: `${data.firstName.trim()} ${data.lastName.trim()}`.trim(),
    line1: data.line1,
    line2: data.line2,
    city,
    state,
    zip: data.zip,
    country: "IN",
    phone: data.phone,
  };
}

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    email: z.string().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type AddressFormInput = z.infer<typeof addressFormSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
