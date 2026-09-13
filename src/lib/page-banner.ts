import { z } from "zod";

export type PageBannerTextAlign = "left" | "center" | "right";

export type PageBannerSpacing = "default" | "none" | "sm" | "md" | "lg";

export type PageBannerData = {
  /** When false, the banner is hidden on the storefront. */
  enabled: boolean;
  title: string;
  description: string;
  backgroundImageUrl: string;
  backgroundColor: string;
  textAlign: PageBannerTextAlign;
  paddingTop: PageBannerSpacing;
  paddingBottom: PageBannerSpacing;
  paddingLeft: PageBannerSpacing;
  paddingRight: PageBannerSpacing;
};

export type ResolvedPageBanner = PageBannerData & {
  displayTitle: string;
  displayDescription: string;
};

export const PAGE_BANNER_SPACING_OPTIONS: {
  value: PageBannerSpacing;
  label: string;
}[] = [
  { value: "default", label: "Default" },
  { value: "none", label: "None" },
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
];

export const PAGE_BANNER_ALIGN_OPTIONS: {
  value: PageBannerTextAlign;
  label: string;
}[] = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];

export const PAGE_BANNER_CONTENT_FIELDS = ["title", "description"] as const;

export const PAGE_BANNER_SETTINGS_FIELDS = [
  "backgroundImageUrl",
  "backgroundColor",
  "textAlign",
  "paddingTop",
  "paddingBottom",
  "paddingLeft",
  "paddingRight",
] as const;

export const PAGE_BANNER_FIELD_LABELS: Record<
  keyof PageBannerData | "enabled",
  string
> = {
  enabled: "Show page banner",
  title: "Banner title",
  description: "Banner description",
  backgroundImageUrl: "Background image (URL)",
  backgroundColor: "Background color",
  textAlign: "Text alignment",
  paddingTop: "Top spacing",
  paddingBottom: "Bottom spacing",
  paddingLeft: "Left spacing",
  paddingRight: "Right spacing",
};

const spacingSchema = z.enum(["default", "none", "sm", "md", "lg"]);

export const pageBannerSchema = z.object({
  enabled: z.boolean().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  backgroundImageUrl: z.string().optional(),
  backgroundColor: z.string().optional(),
  textAlign: z.enum(["left", "center", "right"]).optional(),
  paddingTop: spacingSchema.optional(),
  paddingBottom: spacingSchema.optional(),
  paddingLeft: spacingSchema.optional(),
  paddingRight: spacingSchema.optional(),
});

export function defaultPageBanner(
  pageTitle: string,
  pageDescription: string | null,
  slug?: string
): PageBannerData {
  return {
    enabled: slug !== "home",
    title: pageTitle,
    description: pageDescription ?? "",
    backgroundImageUrl: "",
    backgroundColor: "",
    textAlign: "center",
    paddingTop: "md",
    paddingBottom: "md",
    paddingLeft: "default",
    paddingRight: "default",
  };
}

function mergeBanner(
  defaults: PageBannerData,
  stored: unknown
): PageBannerData {
  const parsed = pageBannerSchema.safeParse(stored);
  if (!parsed.success) return defaults;
  const s = parsed.data;
  return {
    enabled: s.enabled ?? defaults.enabled,
    title: s.title ?? defaults.title,
    description: s.description ?? defaults.description,
    backgroundImageUrl: s.backgroundImageUrl ?? defaults.backgroundImageUrl,
    backgroundColor: s.backgroundColor ?? defaults.backgroundColor,
    textAlign: s.textAlign ?? defaults.textAlign,
    paddingTop: s.paddingTop ?? defaults.paddingTop,
    paddingBottom: s.paddingBottom ?? defaults.paddingBottom,
    paddingLeft: s.paddingLeft ?? defaults.paddingLeft,
    paddingRight: s.paddingRight ?? defaults.paddingRight,
  };
}

export function parsePageBanner(
  stored: unknown,
  pageTitle: string,
  pageDescription: string | null,
  slug?: string
): PageBannerData {
  return mergeBanner(
    defaultPageBanner(pageTitle, pageDescription, slug),
    stored
  );
}

export function resolvePageBanner(
  stored: unknown,
  pageTitle: string,
  pageDescription: string | null,
  slug?: string
): ResolvedPageBanner {
  const banner = parsePageBanner(stored, pageTitle, pageDescription, slug);
  const displayTitle = banner.title.trim() || pageTitle;
  const displayDescription =
    banner.description.trim() || pageDescription?.trim() || "";

  return {
    ...banner,
    displayTitle,
    displayDescription,
  };
}

const SPACING_PX: Record<PageBannerSpacing, string | undefined> = {
  default: undefined,
  none: "0",
  sm: "1rem",
  md: "2.5rem",
  lg: "4rem",
};

export function pageBannerPaddingStyle(
  banner: Pick<
    PageBannerData,
    "paddingTop" | "paddingBottom" | "paddingLeft" | "paddingRight"
  >
): import("react").CSSProperties {
  return {
    paddingTop: SPACING_PX[banner.paddingTop] ?? "2.5rem",
    paddingBottom: SPACING_PX[banner.paddingBottom] ?? "2.5rem",
    paddingLeft: SPACING_PX[banner.paddingLeft] ?? "1.5rem",
    paddingRight: SPACING_PX[banner.paddingRight] ?? "1.5rem",
  };
}

export function pageBannerTextAlignClass(
  align: PageBannerTextAlign
): string {
  switch (align) {
    case "left":
      return "text-left items-start";
    case "right":
      return "text-right items-end";
    default:
      return "text-center items-center";
  }
}
