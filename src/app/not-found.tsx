import Link from "next/link";
import { getCmsBlock } from "@/lib/cms-content";
import { Button } from "@/components/ui/button";

export default async function NotFound() {
  const storeCopy = await getCmsBlock("storeCopy");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-4">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted-foreground)]">404</p>
      <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-[var(--foreground)]">
        {storeCopy.notFoundTitle}
      </h1>
      <p className="mt-4 max-w-md text-center text-sm leading-relaxed text-[var(--muted-foreground)]">
        {storeCopy.notFoundDescription}
      </p>
      <div className="mt-10 flex gap-3">
        <Button asChild variant="outline">
          <Link href="/shop">Browse shop</Link>
        </Button>
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
