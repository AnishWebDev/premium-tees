"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Heart,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { RemoteImage } from "@/components/shared/remote-image";
import type { NavLinkItem } from "@/lib/site-content";
import { resetCartForUser } from "@/lib/stores/cart-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type MobileNavDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  links: NavLinkItem[];
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  logoImageUrl?: string;
  logoImageAlt?: string;
  siteName?: string;
};

export function MobileNavDrawer({
  open,
  onOpenChange,
  links,
  cartCount,
  wishlistCount,
  onOpenCart,
  logoImageUrl = "",
  logoImageAlt = "",
  siteName = "",
}: MobileNavDrawerProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const hasLogoImage = logoImageUrl.trim().length > 0;

  const close = () => onOpenChange(false);

  const utilityLinkClass =
    "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-base font-medium text-[var(--foreground)] hover:bg-[var(--muted)]";

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={close}
        />
      )}

      <aside
        aria-label="Site menu"
        aria-hidden={!open}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(100vw-3rem,20rem)] flex-col border-r border-[var(--border)] bg-[var(--background)] shadow-xl transition-transform duration-200 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full pointer-events-none"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-[var(--border)] px-4">
          <Link
            href="/"
            title={siteName}
            aria-label={`${siteName} home`}
            className="flex min-w-0 items-center gap-2"
            onClick={close}
          >
            {hasLogoImage ? (
              <span className="relative block h-8 w-8 shrink-0">
                <RemoteImage
                  src={logoImageUrl}
                  alt={logoImageAlt.trim() || `${siteName} logo`}
                  fill
                  sizes="32px"
                  className="object-contain"
                />
              </span>
            ) : (
              <span className="font-display truncate text-sm font-semibold tracking-tight text-[var(--foreground)]">
                {siteName}
              </span>
            )}
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
            onClick={close}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav
          className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4"
          aria-label="Mobile"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={close}
              className={cn(
                "rounded-xl px-3 py-3 text-base font-medium transition-colors hover:bg-[var(--muted)]",
                pathname.startsWith(link.href)
                  ? "bg-[var(--muted)] text-[var(--foreground)]"
                  : "text-[var(--foreground)]"
              )}
            >
              {link.label}
            </Link>
          ))}

          <div className="my-2 border-t border-[var(--border)]" />

          <Link href="/shop" onClick={close} className={utilityLinkClass}>
            <Search className="h-5 w-5 shrink-0" aria-hidden />
            Search
          </Link>
          <Link href="/wishlist" onClick={close} className={utilityLinkClass}>
            <Heart
              className={cn(
                "h-5 w-5 shrink-0",
                wishlistCount > 0 && "fill-red-500 text-red-500"
              )}
              aria-hidden
            />
            Wishlist
            {wishlistCount > 0 ? (
              <span className="ml-auto text-sm text-[var(--muted-foreground)]">
                {wishlistCount}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            onClick={() => {
              close();
              onOpenCart();
            }}
            className={utilityLinkClass}
          >
            <ShoppingBag className="h-5 w-5 shrink-0" aria-hidden />
            Cart
            {cartCount > 0 ? (
              <span className="ml-auto text-sm text-[var(--muted-foreground)]">
                {cartCount}
              </span>
            ) : null}
          </button>

          {session?.user ? (
            <>
              <div className="my-2 border-t border-[var(--border)]" />
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-[var(--foreground)]">
                  {session.user.name}
                </p>
                <p className="truncate text-sm text-[var(--muted-foreground)]">
                  {session.user.email}
                </p>
              </div>
              <Link href="/profile" onClick={close} className={utilityLinkClass}>
                <User className="h-5 w-5 shrink-0" aria-hidden />
                Profile
              </Link>
              <Link href="/orders" onClick={close} className={utilityLinkClass}>
                Orders
              </Link>
              {(session.user.role === "ADMIN" ||
                session.user.role === "SUPERADMIN") && (
                <Link href="/admin" onClick={close} className={utilityLinkClass}>
                  Admin
                </Link>
              )}
              <button
                type="button"
                className={cn(utilityLinkClass, "text-left")}
                onClick={() => {
                  resetCartForUser(null);
                  void signOut({ callbackUrl: "/" });
                  close();
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <Button asChild className="mx-3 mt-2">
              <Link href="/login" onClick={close}>
                Sign in
              </Link>
            </Button>
          )}
        </nav>
      </aside>
    </>
  );
}
