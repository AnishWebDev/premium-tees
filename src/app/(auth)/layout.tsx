import Link from "next/link";
import { getSiteIdentity } from "@/lib/site-identity";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const site = await getSiteIdentity();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Link
        href="/"
        className="mb-10 font-display text-2xl font-semibold tracking-tight text-neutral-950"
      >
        {site.name}
      </Link>

      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        {children}
      </div>

      <p className="mt-8 text-center text-xs text-neutral-400">
        &copy; {new Date().getFullYear()} {site.name}. All rights reserved.
      </p>
    </div>
  );
}
