"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const body = await res.json();

    if (!res.ok) {
      setError("root", { message: body.error ?? "Something went wrong" });
      return;
    }

    setSent(true);
  };

  if (sent) {
    return (
      <>
        <div className="text-center">
          <h1 className="font-display text-2xl font-semibold text-neutral-950">
            Check your email
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            If an account exists for that address, we sent a password reset link.
            It expires in 1 hour.
          </p>
        </div>
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

  return (
    <>
      <div className="text-center">
        <h1 className="font-display text-2xl font-semibold text-neutral-950">
          Forgot password?
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            className="mt-2"
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        {errors.root && (
          <p className="text-sm text-red-600" role="alert">
            {errors.root.message}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Sending…" : "Send reset link"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-neutral-500">
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-medium text-neutral-950 underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
