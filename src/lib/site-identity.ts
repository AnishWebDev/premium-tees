import { unstable_cache } from "next/cache";
import {
  DEFAULT_SITE_DESCRIPTION,
  DEFAULT_SITE_NAME,
} from "@/lib/site-defaults";
import { getContentBlock } from "@/lib/site-content";

export const SITE_IDENTITY_TAG = "site-identity";

export { DEFAULT_SITE_DESCRIPTION, DEFAULT_SITE_NAME };

export type SiteIdentity = {
  name: string;
  description: string;
};

async function loadSiteIdentity(): Promise<SiteIdentity> {
  const site = await getContentBlock("site");
  return {
    name: site.name?.trim() || DEFAULT_SITE_NAME,
    description: site.description?.trim() || DEFAULT_SITE_DESCRIPTION,
  };
}

/** CMS-backed site name + description (Admin → Site content → Site). */
export const getSiteIdentity = unstable_cache(
  loadSiteIdentity,
  [SITE_IDENTITY_TAG],
  { revalidate: 60, tags: [SITE_IDENTITY_TAG] }
);
