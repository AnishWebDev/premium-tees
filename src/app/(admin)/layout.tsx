import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { isStaff } from "@/lib/roles";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!isStaff(session.user.role)) {
    redirect("/");
  }

  return <AdminShell user={session.user}>{children}</AdminShell>;
}
