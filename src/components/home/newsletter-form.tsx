"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { newsletterSchema, type NewsletterInput } from "@/lib/validations/checkout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function NewsletterForm({ variant = "light" }: { variant?: "light" | "dark" }) {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewsletterInput>({
    resolver: zodResolver(newsletterSchema),
  });

  const onSubmit = async (data: NewsletterInput) => {
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Something went wrong");
      }
      toast.success("You're on the list.");
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to subscribe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn(
        "flex w-full max-w-md flex-col gap-2",
        variant === "dark" && "newsletter-on-dark"
      )}
    >
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="Enter your email"
          aria-label="Email address"
          className={cn(
            variant === "dark" &&
              "border-white/20 bg-white/10 text-white placeholder:text-white/55 caret-white focus-visible:ring-white"
          )}
          {...register("email")}
        />
        <Button
          type="submit"
          disabled={loading}
          variant={variant === "dark" ? "inverse" : "default"}
        >
          {loading ? "..." : "Join"}
        </Button>
      </div>
      {errors.email && (
        <p className="text-xs text-red-400" role="alert">
          {errors.email.message}
        </p>
      )}
    </form>
  );
}
