"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Menu, X, ShoppingBag, Heart, User, Search } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import type { NavLinkItem } from "@/lib/site-content";
import { RemoteImage } from "@/components/shared/remote-image";
import { useSiteIdentity } from "@/components/providers/site-identity-provider";
import { resetCartForUser, useCartStore } from "@/lib/stores/cart-store";
import { useWishlistStore } from "@/lib/stores/wishlist-store";
import { cn } from "@/lib/utils";
import { ColorModeToggle } from "@/components/theme/color-mode-toggle";
import { MiniCartDrawer } from "@/components/cart/mini-cart-drawer";
import { MobileNavDrawer } from "@/components/layout/mobile-nav-drawer";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type HeaderProps = {
  navLinks?: NavLinkItem[];
  logoImageUrl?: string;
  logoImageAlt?: string;
};

export function Header({
  navLinks = NAV_LINKS,
  logoImageUrl = "",
  logoImageAlt = "",
}: HeaderProps) {
  const { name: siteName } = useSiteIdentity();
  const links = navLinks.length > 0 ? navLinks : NAV_LINKS;
  const hasLogoImage = logoImageUrl.trim().length > 0;
  const pathname = usePathname();
  const { data: session } = useSession();
  const itemCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.productIds.length);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const count = mounted ? itemCount : 0;
  const wishlist = mounted ? wishlistCount : 0;

  return (
    <>
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled
          ? "border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_85%,transparent)] backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <div className="container-tight flex h-16 items-center justify-between gap-4 lg:h-20">
        <div className="flex min-w-0 flex-1 items-center gap-3 lg:flex-none">
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="shrink-0 rounded-full p-2 text-[var(--foreground)] hover:bg-[var(--muted)] lg:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link
            href="/"
            title={siteName}
            aria-label={`${siteName} home`}
            className="flex min-w-0 items-center gap-2"
          >
            {hasLogoImage && (
              <span className="relative block h-8 w-8 shrink-0 sm:h-9 sm:w-9">
                <RemoteImage
                  src={logoImageUrl}
                  alt={logoImageAlt.trim() || `${siteName} logo`}
                  fill
                  sizes="36px"
                  className="object-contain"
                  priority
                />
              </span>
            )}
            <span className="font-display truncate text-base font-semibold tracking-tight text-[var(--foreground)] sm:text-xl lg:text-2xl">
              {siteName}
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-[var(--foreground)]",
                pathname.startsWith(link.href)
                  ? "text-[var(--foreground)]"
                  : "text-[var(--muted-foreground)]"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <ColorModeToggle />
          <div className="hidden items-center gap-1 sm:gap-2 lg:flex">
            <Button variant="ghost" size="icon" asChild aria-label="Search">
              <Link href="/shop">
                <Search className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild aria-label="Wishlist">
              <Link href="/wishlist">
                <Heart
                  className={cn(
                    "h-5 w-5",
                    wishlist > 0 && "fill-red-500 text-red-500"
                  )}
                />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Cart${count > 0 ? `, ${count} items` : ""}`}
              className="relative"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-medium text-[var(--accent-foreground)]">
                  {count}
                </span>
              )}
            </Button>

            {session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Account menu">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-sm">
                    <p className="font-medium">{session.user.name}</p>
                    <p className="truncate text-[var(--muted-foreground)]">
                      {session.user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders">Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/wishlist">Wishlist</Link>
                  </DropdownMenuItem>
                  {(session.user.role === "ADMIN" ||
                    session.user.role === "SUPERADMIN") && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Admin</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      resetCartForUser(null);
                      void signOut({ callbackUrl: "/" });
                    }}
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                <Link href="/login">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

    </header>

    <MobileNavDrawer
      open={open}
      onOpenChange={setOpen}
      links={links}
      cartCount={count}
      wishlistCount={wishlist}
      onOpenCart={() => setCartOpen(true)}
      logoImageUrl={logoImageUrl}
      logoImageAlt={logoImageAlt}
      siteName={siteName}
    />

    <MiniCartDrawer open={cartOpen} onOpenChange={setCartOpen} />
  </>
  );
}
