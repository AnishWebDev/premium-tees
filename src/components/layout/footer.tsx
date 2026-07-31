import Link from "next/link";
import { FOOTER_LINKS, SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";
import { getContentBlock } from "@/lib/site-content";
import { NewsletterForm } from "@/components/home/newsletter-form";
import { FooterCredit } from "@/components/layout/footer-credit";
import { ColorModeToggle } from "@/components/theme/color-mode-toggle";

export async function Footer() {
  const credit = await getContentBlock("footerCredit");

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--muted)] text-[var(--muted-foreground)]">
      <div className="container-tight section-padding">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link
              href="/"
              className="font-display text-2xl font-semibold text-[var(--foreground)]"
            >
              {SITE_NAME}
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--muted-foreground)]">
              {SITE_DESCRIPTION}
            </p>
            <div className="mt-8">
              <p className="text-sm font-medium text-[var(--foreground)]">
                Stay in the loop
              </p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                New drops, exclusive offers, and fabric stories.
              </p>
              <div className="mt-4">
                <NewsletterForm />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8 lg:justify-items-end">
            <div>
              <h3 className="text-sm font-semibold text-[var(--foreground)]">
                Shop
              </h3>
              <ul className="mt-4 space-y-3">
                {FOOTER_LINKS.shop.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors hover:text-[var(--foreground)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--foreground)]">
                Help
              </h3>
              <ul className="mt-4 space-y-3">
                {FOOTER_LINKS.help.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors hover:text-[var(--foreground)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--foreground)]">
                Company
              </h3>
              <ul className="mt-4 space-y-3">
                {FOOTER_LINKS.company.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors hover:text-[var(--foreground)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-[var(--border)] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-xs text-[var(--muted-foreground)]">
              © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
            </p>
            <FooterCredit credit={credit} />
          </div>
          <div className="flex flex-wrap items-center gap-6 text-xs text-[var(--muted-foreground)]">
            <ColorModeToggle variant="labeled" />
            <Link
              href="/privacy"
              className="transition-colors hover:text-[var(--foreground)]"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="transition-colors hover:text-[var(--foreground)]"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
