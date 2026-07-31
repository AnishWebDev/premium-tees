import { adminFetch } from "@/lib/admin-api";
import { CustomersTable } from "@/components/admin/customers-table";

type CustomersResponse = {
  customers: Array<{
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    createdAt: string;
    orderCount: number;
    reviewCount: number;
    totalSpent: number;
  }>;
  total: number;
};

export default async function AdminCustomersPage() {
  const { customers, total } = await adminFetch<CustomersResponse>("/api/admin/customers");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Customers</h1>
        <p className="text-sm text-neutral-500">{total} customers total</p>
      </div>
      <CustomersTable customers={customers} />
    </div>
  );
}
