import { adminFetch } from "@/lib/admin-api";
import { CouponsManager } from "@/components/admin/coupons-manager";

type CouponsResponse = {
  coupons: Array<{
    id: string;
    code: string;
    description: string | null;
    discountType: "PERCENT" | "FIXED";
    discountValue: number;
    minOrder: number | null;
    maxUses: number | null;
    usedCount: number;
    active: boolean;
    startsAt: string;
    expiresAt: string | null;
  }>;
};

export default async function AdminCouponsPage() {
  const { coupons } = await adminFetch<CouponsResponse>("/api/admin/coupons");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Coupons</h1>
        <p className="text-sm text-neutral-500">Manage discount codes</p>
      </div>
      <CouponsManager initialCoupons={coupons} />
    </div>
  );
}
