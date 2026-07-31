import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Link
        href="/"
        className="mb-10 font-display text-2xl font-semibold tracking-tight text-neutral-950"
      >
        {SITE_NAME}
      </Link>

      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        {children}
      </div>

      <p className="mt-8 text-center text-xs text-neutral-400">
        &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
      </p>
    </div>
  );
}
