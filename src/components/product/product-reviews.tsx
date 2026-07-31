"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { reviewSchema, type ReviewInput } from "@/lib/validations/product";
import { formatDate } from "@/lib/utils";
import { StarRating } from "@/components/shared/star-rating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Review = {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  createdAt: Date | string;
  user: { id: string; name: string | null; image: string | null };
};

type ProductReviewsProps = {
  productId: string;
  reviews: Review[];
  onReviewAdded?: () => void;
};

export function ProductReviews({
  productId,
  reviews,
  onReviewAdded,
}: ProductReviewsProps) {
  const { data: session } = useSession();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { productId, rating: 5 },
  });

  const selectedRating = watch("rating");

  const onSubmit = async (data: ReviewInput) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Could not submit review");
      }
      toast.success("Thank you — your review has been submitted.");
      reset({ productId, rating: 5, title: "", comment: "" });
      onReviewAdded?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section aria-labelledby="reviews-heading" className="space-y-10">
      <h2
        id="reviews-heading"
        className="font-display text-2xl font-semibold tracking-tight text-[var(--foreground)]"
      >
        Reviews
        {reviews.length > 0 && (
          <span className="ml-2 text-lg font-normal text-[var(--muted-foreground)]">
            ({reviews.length})
          </span>
        )}
      </h2>

      {reviews.length > 0 ? (
        <ul className="divide-y divide-[var(--border)]">
          {reviews.map((review) => (
            <li key={review.id} className="py-8 first:pt-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {review.user.name ?? "Customer"}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                    {formatDate(review.createdAt)}
                  </p>
                </div>
                <StarRating rating={review.rating} />
              </div>
              {review.title && (
                <p className="mt-3 text-sm font-medium text-[var(--foreground)]">
                  {review.title}
                </p>
              )}
              {review.comment && (
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                  {review.comment}
                </p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-[var(--muted-foreground)]">
          No reviews yet — be the first to share your thoughts.
        </p>
      )}

      {session?.user ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 rounded-2xl border border-[var(--border)] p-6 sm:p-8"
        >
          <h3 className="font-display text-lg font-semibold text-[var(--foreground)]">
            Write a review
          </h3>

          <input type="hidden" {...register("productId")} />

          <div>
            <Label className="mb-2 block">Rating</Label>
            <div className="flex gap-1" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  role="radio"
                  aria-checked={selectedRating === star}
                  onClick={() => setValue("rating", star, { shouldValidate: true })}
                  className="rounded p-1 text-2xl leading-none transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                >
                  <span className={star <= selectedRating ? "text-[var(--foreground)]" : "text-[var(--border)]"}>
                    ★
                  </span>
                </button>
              ))}
            </div>
            {errors.rating && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {errors.rating.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="review-title">Title (optional)</Label>
            <Input
              id="review-title"
              className="mt-2"
              placeholder="Summarize your experience"
              {...register("title")}
            />
          </div>

          <div>
            <Label htmlFor="review-comment">Review</Label>
            <Textarea
              id="review-comment"
              className="mt-2"
              placeholder="Tell us about the fit, fabric, and feel…"
              {...register("comment")}
            />
            {errors.comment && (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {errors.comment.message}
              </p>
            )}
          </div>

          <Button type="submit" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit review"}
          </Button>
        </form>
      ) : (
        <p className="text-sm text-[var(--muted-foreground)]">
          <a href="/login" className="font-medium text-[var(--foreground)] underline-offset-4 hover:underline">
            Sign in
          </a>{" "}
          to leave a review.
        </p>
      )}
    </section>
  );
}
