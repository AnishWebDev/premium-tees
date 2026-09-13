import type { CmsKey } from "@/lib/cms-content";

export type CmsMainTab =
  | "site"
  | "header"
  | "footer"
  | "pages"
  | "global-copy";

const MAIN_TABS: { key: CmsMainTab; label: string }[] = [
  { key: "site", label: "Site" },
  { key: "header", label: "Header" },
  { key: "footer", label: "Footer" },
  { key: "pages", label: "Pages" },
  { key: "global-copy", label: "Global copy" },
];

const GLOBAL_COPY_SUBTABS: { key: CmsKey; label: string }[] = [
  { key: "storeCopy", label: "404 & messages" },
  { key: "sizeGuide", label: "Size guide" },
  { key: "auth", label: "Auth pages" },
];

export { MAIN_TABS, GLOBAL_COPY_SUBTABS };

export function parseCmsMainTab(value: string | null | undefined): CmsMainTab {
  if (value && MAIN_TABS.some((tab) => tab.key === value)) {
    return value as CmsMainTab;
  }
  return "site";
}

export function parseCmsGlobalCopyTab(value: string | null | undefined): CmsKey {
  if (value && GLOBAL_COPY_SUBTABS.some((tab) => tab.key === value)) {
    return value as CmsKey;
  }
  return "storeCopy";
}
