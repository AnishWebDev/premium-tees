import { adminFetch } from "@/lib/admin-api";
import { ReturnsTable } from "@/components/admin/returns-table";

type ReturnsResponse = {
  returns: Array<{
    id: string;
    status: "REQUESTED" | "APPROVED" | "REJECTED" | "REFUNDED";
    reason: string;
    notes: string | null;
    adminNote: string | null;
    createdAt: string;
    user: { name: string | null; email: string | null };
    order: {
      id: string;
      orderNumber: string;
      total: number;
      status: string;
    };
  }>;
};

export default async function AdminReturnsPage() {
  const { returns } = await adminFetch<ReturnsResponse>("/api/admin/returns");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Returns</h1>
        <p className="text-sm text-neutral-500">
          Review customer return and refund requests
        </p>
      </div>
      <ReturnsTable initialReturns={returns} />
    </div>
  );
}
