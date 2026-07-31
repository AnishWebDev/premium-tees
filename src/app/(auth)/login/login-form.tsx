"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/profile";
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setError("root", { message: "Invalid email or password" });
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl });
  };

  return (
    <>
      <div className="text-center">
        <h1 className="font-display text-2xl font-semibold text-neutral-950">Welcome back</h1>
        <p className="mt-2 text-sm text-neutral-500">Sign in to your account</p>
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

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            className="mt-2"
            {...register("password")}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>

        {errors.root && (
          <p className="text-sm text-red-600" role="alert">
            {errors.root.message}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="relative my-6">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-neutral-400">
          or
        </span>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogle}
        disabled={googleLoading}
      >
        {googleLoading ? "Redirecting…" : "Continue with Google"}
      </Button>

      <p className="mt-8 text-center text-sm text-neutral-500">
        Don&apos;t have an account?{" "}
        <Link
          href={`/register${callbackUrl !== "/profile" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
          className="font-medium text-neutral-950 underline-offset-4 hover:underline"
        >
          Create one
        </Link>
      </p>
    </>
  );
}
