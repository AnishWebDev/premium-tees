"use client";

import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";

const ADMIN_THEME_KEY = "premium-tees-admin-color-mode";

type AdminShellProps = {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
  children: React.ReactNode;
};

export function AdminShell({ user, children }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminDark, setAdminDark] = useState(false);

  useEffect(() => {
    try {
      setAdminDark(localStorage.getItem(ADMIN_THEME_KEY) === "dark");
    } catch {
      /* ignore */
    }
  }, []);

  const toggleAdminTheme = () => {
    setAdminDark((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(ADMIN_THEME_KEY, next ? "dark" : "light");
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  return (
    // Scoped tokens — storefront html.dark never leaks in; admin-dark is local only
    <div
      className={`admin-surface min-h-screen print:bg-white ${
        adminDark
          ? "admin-dark bg-[var(--background)] text-[var(--foreground)]"
          : "bg-neutral-50 text-neutral-950"
      }`}
    >
      <div className="print:hidden">
        <AdminSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          role={user.role}
        />
      </div>
      <div className="flex h-screen flex-col lg:pl-64 print:h-auto print:pl-0">
        <div className="print:hidden">
          <AdminTopbar
            user={user}
            onMenuClick={() => setSidebarOpen(true)}
            adminDark={adminDark}
            onToggleTheme={toggleAdminTheme}
          />
        </div>
        <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6 has-[[data-admin-flush]]:p-0 print:overflow-visible print:p-0">
          {children}
        </main>
      </div>
    </div>
  );
}
