import Link from "next/link";
import { RemoteImage } from "@/components/shared/remote-image";
import { getContentBlock } from "@/lib/site-content";
import { getSiteIdentity } from "@/lib/site-identity";
import { NewsletterForm } from "@/components/home/newsletter-form";
import { FooterCredit } from "@/components/layout/footer-credit";
import { ColorModeToggle } from "@/components/theme/color-mode-toggle";

export async function Footer() {
  const [site, footer, credit, newsletter, contact] = await Promise.all([
    getSiteIdentity(),
    getContentBlock("footer"),
    getContentBlock("footerCredit"),
    getContentBlock("newsletter"),
    getContentBlock("contact"),
  ]);

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]">
      <div className="relative aspect-[5/3] w-full max-h-[min(52vh,28rem)] min-h-[12rem] overflow-hidden sm:aspect-[21/9] sm:min-h-[14rem]">
        <RemoteImage
          src={footer.bannerImageUrl}
          alt={footer.bannerImageAlt}
          fill
          priority={false}
          sizes="100vw"
          className="object-cover object-center"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-black/10"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0">
          <div className="container-tight pb-8 pt-16 sm:pb-10">
            <Link
              href="/"
              aria-label={`${site.name} home`}
              className="font-display break-words text-3xl font-semibold tracking-tight text-white sm:text-4xl"
            >
              {site.name}
            </Link>
            <p className="mt-2 max-w-md text-sm text-white/85">{footer.tagline}</p>
          </div>
        </div>
      </div>

      <div className="container-tight py-12 text-center sm:py-14">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          {newsletter.title}
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-[var(--muted-foreground)]">
          {newsletter.subtitle}
        </p>
        <div className="mx-auto mt-6 flex max-w-md justify-center">
          <NewsletterForm />
        </div>
        {contact.email ? (
          <a
            href={`mailto:${contact.email}`}
            className="theme-link mt-6 inline-block text-sm font-medium"
          >
            {contact.email}
          </a>
        ) : null}
      </div>

      <div className="border-y border-[var(--border)] bg-[var(--muted)]">
        <div className="container-tight grid grid-cols-2 gap-6 py-8 sm:grid-cols-4 sm:gap-8 sm:py-10">
          {footer.trustItems.map((item) => (
            <div key={item.title} className="text-center">
              <p className="text-sm font-semibold text-[var(--foreground)]">
                {item.title}
              </p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {item.subtitle}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="container-tight flex flex-col items-center gap-5 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <p className="text-xs text-[var(--muted-foreground)]">
            © {new Date().getFullYear()} {site.name}
          </p>
          <FooterCredit credit={credit} />
        </div>
        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs"
        >
          {footer.essentialLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-[var(--foreground)]"
            >
              {link.label}
            </Link>
          ))}
          <ColorModeToggle variant="labeled" className="hidden lg:inline-flex" />
        </nav>
      </div>
    </footer>
  );
}
