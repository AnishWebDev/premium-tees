import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">404</p>
      <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-neutral-950">
        Page not found
      </h1>
      <p className="mt-4 max-w-md text-center text-sm leading-relaxed text-neutral-500">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
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
