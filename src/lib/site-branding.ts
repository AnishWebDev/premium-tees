import { unstable_cache } from "next/cache";
import { getContentBlock } from "@/lib/site-content";
import { SITE_IDENTITY_TAG } from "@/lib/site-identity";

/** 1×1 PNG when no CMS favicon is set. */
export const FALLBACK_FAVICON_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

async function loadSiteFaviconUrl(): Promise<string> {
  const site = await getContentBlock("site");
  return site.faviconUrl?.trim() ?? "";
}

/** CMS favicon URL; invalidated when Admin saves Site identity. */
export const getSiteFaviconUrl = unstable_cache(
  loadSiteFaviconUrl,
  [SITE_IDENTITY_TAG, "site-favicon"],
  { revalidate: 60, tags: [SITE_IDENTITY_TAG] }
);

/** Proxies the CMS favicon (used for /favicon.ico). */
export async function proxySiteFaviconResponse(): Promise<Response> {
  const faviconUrl = await loadSiteFaviconUrl();
  if (!faviconUrl) {
    return new Response(FALLBACK_FAVICON_PNG, {
      headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=300" },
    });
  }

  const upstream = await fetch(faviconUrl, { cache: "no-store" });
  if (!upstream.ok) {
    return new Response(FALLBACK_FAVICON_PNG, {
      headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=300" },
    });
  }

  const contentType = upstream.headers.get("content-type") ?? "image/png";
  const body = await upstream.arrayBuffer();
  return new Response(body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
}
