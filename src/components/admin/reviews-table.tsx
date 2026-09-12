"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ReviewRow = {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  approved: boolean;
  createdAt: string;
  product: { id: string; name: string; slug: string };
  user: { id: string; name: string | null; email: string | null };
};

type ReviewsTableProps = {
  initialReviews: ReviewRow[];
};

export function ReviewsTable({ initialReviews }: ReviewsTableProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const updateReview = async (reviewId: string, approved: boolean) => {
    setUpdatingId(reviewId);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, approved }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to update review");
        return;
      }
      setReviews((prev) =>
        prev.map((item) => (item.id === reviewId ? { ...item, approved: data.approved } : item))
      );
      toast.success(approved ? "Review approved" : "Review rejected");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Card className="rounded-lg shadow-sm">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Review</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-neutral-500">
                  No reviews yet
                </TableCell>
              </TableRow>
            ) : (
              reviews.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="font-medium hover:underline"
                    >
                      {item.product.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{item.user.name ?? "Customer"}</p>
                    <p className="text-xs text-neutral-500">{item.user.email}</p>
                  </TableCell>
                  <TableCell>{item.rating}/5</TableCell>
                  <TableCell className="max-w-[280px]">
                    {item.title ? (
                      <p className="text-sm font-medium text-neutral-800">{item.title}</p>
                    ) : null}
                    {item.comment ? (
                      <p className="text-sm text-neutral-600">{item.comment}</p>
                    ) : (
                      <p className="text-sm text-neutral-400">No comment</p>
                    )}
                  </TableCell>
                  <TableCell className="text-neutral-500">
                    {formatDate(item.createdAt, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    {item.approved ? (
                      <Badge variant="success">Approved</Badge>
                    ) : (
                      <Badge variant="warning">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        disabled={updatingId === item.id || item.approved}
                        onClick={() => void updateReview(item.id, true)}
                      >
                        {updatingId === item.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        disabled={updatingId === item.id || !item.approved}
                        onClick={() => void updateReview(item.id, false)}
                      >
                        {updatingId === item.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <X className="h-3.5 w-3.5" />
                        )}
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
