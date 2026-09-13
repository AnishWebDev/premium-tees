import Link from "next/link";
import { getCmsBlock } from "@/lib/cms-content";
import { notFoundPartStyle } from "@/lib/not-found-styles";
import { RemoteImage } from "@/components/shared/remote-image";
import { Button } from "@/components/ui/button";

export default async function NotFound() {
  const storeCopy = await getCmsBlock("storeCopy");
  const heroImage = storeCopy.notFoundImageUrl.trim();
  const backgroundImage = storeCopy.notFoundBackgroundImageUrl.trim();

  const codeStyle = notFoundPartStyle("code", storeCopy);
  const titleStyle = notFoundPartStyle("title", storeCopy);
  const descriptionStyle = notFoundPartStyle("description", storeCopy);

  const codeLabel = storeCopy.notFoundCode.trim() || "404";
  const shopLabel = storeCopy.notFoundShopLabel.trim() || "Browse shop";
  const homeLabel = storeCopy.notFoundHomeLabel.trim() || "Go home";

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

        <p className={codeStyle.className} style={codeStyle.style}>
          {codeLabel}
        </p>
        <h1 className={`mt-4 ${titleStyle.className}`} style={titleStyle.style}>
          {storeCopy.notFoundTitle}
        </h1>
        <p
          className={`mt-4 ${descriptionStyle.className}`}
          style={descriptionStyle.style}
        >
          {storeCopy.notFoundDescription}
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button asChild variant="outline" className="no-underline">
            <Link href="/shop" className="no-underline">
              {shopLabel}
            </Link>
          </Button>
          <Button asChild className="no-underline">
            <Link href="/" className="no-underline">
              {homeLabel}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
