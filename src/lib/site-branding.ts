import { unstable_cache } from "next/cache";
import { getContentBlock } from "@/lib/site-content";
import { SITE_IDENTITY_TAG } from "@/lib/site-identity";

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
