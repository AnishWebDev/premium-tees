"use client";

import { createContext, useContext } from "react";
import type { SiteIdentity } from "@/lib/site-identity";
import {
  DEFAULT_SITE_DESCRIPTION,
  DEFAULT_SITE_NAME,
} from "@/lib/site-defaults";

const SiteIdentityContext = createContext<SiteIdentity>({
  name: DEFAULT_SITE_NAME,
  description: DEFAULT_SITE_DESCRIPTION,
});

export function SiteIdentityProvider({
  site,
  children,
}: {
  site: SiteIdentity;
  children: React.ReactNode;
}) {
  return (
    <SiteIdentityContext.Provider value={site}>
      {children}
    </SiteIdentityContext.Provider>
  );
}

export function useSiteIdentity() {
  return useContext(SiteIdentityContext);
}
