"use client";

import { Menu } from "lucide-react";
import { signOut } from "next-auth/react";
import { AdminColorModeToggle } from "@/components/admin/admin-color-mode-toggle";
import { Button } from "@/components/ui/button";
import { resetCartForUser } from "@/lib/stores/cart-store";
import { getInitials } from "@/lib/utils";

type AdminTopbarProps = {
  user: {
    name?: string | null;
    email?: string | null;
  };
  onMenuClick: () => void;
  adminDark: boolean;
  onToggleTheme: () => void;
};

export function AdminTopbar({
  user,
  onMenuClick,
  adminDark,
  onToggleTheme,
}: AdminTopbarProps) {
  return (
    <header className="z-30 flex h-14 shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-4 md:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 lg:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <p className="hidden text-sm text-neutral-500 sm:block">Administration</p>
      </div>

      <div className="flex items-center gap-3">
        <AdminColorModeToggle dark={adminDark} onToggle={onToggleTheme} />
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-neutral-900">
            {user.name ?? "Admin"}
          </p>
          <p className="text-xs text-neutral-500">{user.email}</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-xs font-medium text-white">
          {getInitials(user.name ?? user.email)}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-md"
          onClick={() => {
            resetCartForUser(null);
            void signOut({ callbackUrl: "/" });
          }}
        >
          Sign out
        </Button>
      </div>
    </header>
  );
}
