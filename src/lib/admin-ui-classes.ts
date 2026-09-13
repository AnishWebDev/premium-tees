/** Divider above “Component settings” accordions in CMS editors. */
export const adminComponentSettingsDivider =
  "border-t border-[var(--border)] pt-2";

/** Sticky save bar shared by CMS, site content, and theme editors. */
export const adminFixedSaveBar =
  "admin-fixed-save-bar fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--border)] bg-[var(--background)]/95 px-4 py-3 backdrop-blur-md supports-[backdrop-filter]:bg-[var(--background)]/90 lg:left-64";

/** Muted inset panel (e.g. “Component type” picker). */
export const adminPanelMuted =
  "rounded-xl border border-[var(--border)] bg-[var(--muted)]/70 p-4";

/** Inline list/card surface inside admin panels. */
export const adminInlinePanel =
  "rounded-xl border border-[var(--border)] bg-[var(--background)]";

/** Dashed panel for “Create a new page” and similar forms. */
export const adminCreatePagePanel =
  "border-dashed border-[var(--border)] bg-[var(--muted)]/40";

/** Tab list strip for CMS / settings sub-navigation. */
export const adminTabsList =
  "flex h-auto w-full flex-wrap justify-start gap-1 rounded-xl bg-[var(--muted)] p-1";
