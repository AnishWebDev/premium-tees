"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, email },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const body = await res.json();

    if (!res.ok) {
      setError("root", { message: body.error ?? "Could not reset password" });
      return;
    }

    toast.success("Password updated — you can sign in now");
    router.push("/login");
  };

  if (!token || !email) {
    return (
      <>
        <div className="text-center">
          <h1 className="font-display text-2xl font-semibold text-neutral-950">
            Invalid reset link
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            This link is missing required information. Request a new reset link.
          </p>
        </div>
        <p className="mt-8 text-center text-sm text-neutral-500">
          <Link
            href="/forgot-password"
            className="font-medium text-neutral-950 underline-offset-4 hover:underline"
          >
            Request reset link
          </Link>
        </p>
      </>
    );
  }

  return (
    <>
      <div className="text-center">
        <h1 className="font-display text-2xl font-semibold text-neutral-950">
          Set a new password
        </h1>
        <p className="mt-2 text-sm text-neutral-500">Choose a strong password for your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <input type="hidden" {...register("token")} />
        <input type="hidden" {...register("email")} />

        <div>
          <Label htmlFor="password">New password</Label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            className="mt-2"
            {...register("password")}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            className="mt-2"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        {errors.root && (
          <p className="text-sm text-red-600" role="alert">
            {errors.root.message}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Updating…" : "Update password"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-neutral-500">
        <Link
          href="/login"
          className="font-medium text-neutral-950 underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </>
  );
}
