"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/profile", label: "Profile", match: (path: string) => path === "/profile" },
  {
    href: "/orders",
    label: "Orders",
    match: (path: string) => path.startsWith("/orders"),
  },
  { href: "/wishlist", label: "Wishlist", match: (path: string) => path === "/wishlist" },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav
      className="mb-10 flex gap-1 overflow-x-auto border-b border-neutral-200"
      aria-label="Account"
    >
      {NAV_ITEMS.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative shrink-0 px-4 py-3 text-sm font-medium transition-colors",
              active
                ? "text-neutral-950 after:scale-x-100"
                : "text-neutral-500 hover:text-neutral-950",
              "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:bg-neutral-950 after:transition-transform",
              !active && "after:scale-x-0 hover:after:scale-x-100"
            )}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
