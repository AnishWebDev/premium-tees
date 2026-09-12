"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="section-padding">
      <div className="container-tight mx-auto max-w-md text-center">
        <h1 className="font-display text-2xl font-semibold text-[var(--foreground)]">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm text-[var(--muted-foreground)]">
          We couldn&apos;t load the shop. Please try again.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" asChild>
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
