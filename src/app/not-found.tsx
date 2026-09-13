import Link from "next/link";
import { getCmsBlock } from "@/lib/cms-content";
import { RemoteImage } from "@/components/shared/remote-image";
import { Button } from "@/components/ui/button";

export default async function NotFound() {
  const storeCopy = await getCmsBlock("storeCopy");
  const heroImage = storeCopy.notFoundImageUrl.trim();
  const backgroundImage = storeCopy.notFoundBackgroundImageUrl.trim();

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16"
      style={
        backgroundImage
          ? {
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      {backgroundImage ? (
        <div
          className="absolute inset-0 bg-[var(--background)]/85"
          aria-hidden
        />
      ) : (
        <div className="absolute inset-0 bg-[var(--background)]" aria-hidden />
      )}

      <div className="relative z-10 flex max-w-lg flex-col items-center text-center">
        {heroImage ? (
          <div className="relative mb-8 h-40 w-full max-w-xs sm:h-48 sm:max-w-sm">
            <RemoteImage
              src={heroImage}
              alt={storeCopy.notFoundImageAlt.trim() || storeCopy.notFoundTitle}
              fill
              sizes="(max-width: 640px) 280px, 320px"
              className="object-contain"
              priority
            />
          </div>
        ) : null}

        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
          404
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-[var(--foreground)]">
          {storeCopy.notFoundTitle}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[var(--muted-foreground)]">
          {storeCopy.notFoundDescription}
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/shop">Browse shop</Link>
          </Button>
          <Button asChild>
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
