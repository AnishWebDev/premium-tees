import Link from "next/link";
import { getSiteIdentity } from "@/lib/site-identity";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const site = await getSiteIdentity();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-4 py-12 text-[var(--foreground)]">
      <Link
        href="/"
        className="mb-10 font-display text-2xl font-semibold tracking-tight text-[var(--foreground)]"
      >
        {site.name}
      </Link>

      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6 shadow-sm sm:p-8">
        {children}
      </div>

      <p className="mt-8 text-center text-xs text-[var(--muted-foreground)]">
        &copy; {new Date().getFullYear()} {site.name}. All rights reserved.
      </p>
    </div>
  );
}
