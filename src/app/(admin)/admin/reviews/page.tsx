import { adminFetch } from "@/lib/admin-api";
import { ReviewsTable } from "@/components/admin/reviews-table";

type ReviewsResponse = {
  reviews: Array<{
    id: string;
    rating: number;
    title: string | null;
    comment: string | null;
    approved: boolean;
    createdAt: string;
    product: { id: string; name: string; slug: string };
    user: { id: string; name: string | null; email: string | null };
  }>;
};

export default async function AdminReviewsPage() {
  const { reviews } = await adminFetch<ReviewsResponse>("/api/admin/reviews");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Reviews</h1>
        <p className="text-sm text-neutral-500">Moderate customer product reviews</p>
      </div>
      <ReviewsTable initialReviews={reviews} />
    </div>
  );
}
