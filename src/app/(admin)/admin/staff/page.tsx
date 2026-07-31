import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/roles";
import { adminFetch } from "@/lib/admin-api";
import { StaffTable } from "@/components/admin/staff-table";

type StaffResponse = {
  staff: Array<{
    id: string;
    name: string | null;
    email: string;
    role: "USER" | "ADMIN" | "SUPERADMIN";
    createdAt: string;
    _count: { orders: number };
  }>;
  customers: Array<{
    id: string;
    name: string | null;
    email: string;
    role: "USER" | "ADMIN" | "SUPERADMIN";
    createdAt: string;
    _count: { orders: number };
  }>;
};

export default async function AdminStaffPage() {
  const session = await auth();
  if (!isSuperAdmin(session?.user?.role)) {
    redirect("/admin");
  }

  const { staff, customers } = await adminFetch<StaffResponse>("/api/admin/staff");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Staff</h1>
        <p className="text-sm text-neutral-500">
          SuperAdmin only — promote or demote admins. You cannot demote yourself
          or remove the last SuperAdmin.
        </p>
      </div>
      <StaffTable initialStaff={staff} initialCustomers={customers} />
    </div>
  );
}
