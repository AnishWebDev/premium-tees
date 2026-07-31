import { z } from "zod";

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

export const addressSchema = z.object({
  type: z.enum(["SHIPPING", "BILLING", "BOTH"]),
  isDefault: z.boolean().default(false),
  name: z.string().min(2, "Name is required"),
  line1: z.string().min(3, "Address is required"),
  line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zip: z.string().min(3, "ZIP / postal code is required"),
  country: z.string().min(2).default("US"),
  phone: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
