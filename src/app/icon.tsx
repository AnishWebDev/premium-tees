import { getSiteFaviconUrl } from "@/lib/site-branding";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** 1×1 PNG fallback when no CMS favicon is set. */
const FALLBACK_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

export default async function Icon() {
  const faviconUrl = await getSiteFaviconUrl();
  if (!faviconUrl) {
    return new Response(FALLBACK_PNG, {
      headers: { "Content-Type": "image/png" },
    });
  }

  const upstream = await fetch(faviconUrl, { cache: "no-store" });
  if (!upstream.ok) {
    return new Response(FALLBACK_PNG, {
      headers: { "Content-Type": "image/png" },
    });
  }

  return upstream;
}
