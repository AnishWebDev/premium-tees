import type { HomeTemplateId } from "@/lib/home-templates";

/** Minimal content bag for prefilling section editors (avoids circular imports). */
export type SectionContentSource = {
  site: { name: string };
  hero: {
    brand: string;
    headline: string;
    subheadline: string;
    imageUrl: string;
    videoUrl?: string;
    primaryCtaLabel: string;
    primaryCtaHref: string;
    secondaryCtaLabel: string;
    secondaryCtaHref: string;
  };
  home: {
    marqueeItems: string[];
    essentials: { title: string; subtitle: string };
    story: {
      eyebrow: string;
      title: string;
      body: string;
      ctaLabel: string;
      ctaHref: string;
      imageUrl: string;
    };
    bestSellers: { title: string; subtitle: string };
    newArrivals: { title: string; subtitle: string };
    categories: { title: string; subtitle: string };
  };
  about: { valuesTitle: string; intro: string };
  testimonials: { title: string; subtitle: string };
  faq: { title: string; subtitle: string };
  instagram: { title: string; subtitle: string; profileUrl: string };
  newsletter: { title: string; subtitle: string };
};

/** Block types SuperAdmin can place on the homepage. */
export const HOME_SECTION_TYPES = [
  "heroCinematic",
  "heroStatic",
  "heroMedia",
  "editorialMasthead",
  "carousel",
  "marquee",
  "promoBanner",
  "categoryPills",
  "valuePillars",
  "chapterStory",
  "chapterAlt",
  "lookScroll",
  "lookGrid",
  "essentialsGrid",
  "essentialsFeatured",
  "featureDrop",
  "pullQuote",
  "productRows",
  "bestSellersShelf",
  "newArrivalsShelf",
  "categoriesCards",
  "categoriesList",
  "imageMosaic",
  "stackedPanels",
  "storySplit",
  "storyInline",
  "mission",
  "testimonials",
  "faq",
  "instagram",
  "newsletter",
  "newsletterBand",
  "embedFrame",
  "contentCard",
] as const;

export type HomeSectionType = (typeof HOME_SECTION_TYPES)[number];

/** Per-instance fields for a placed homepage block. */
export type HomeSectionProps = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  body?: string;
  chapter?: string;
  brand?: string;
  headline?: string;
  subheadline?: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  linkLabel?: string;
  linkHref?: string;
  imageUrl?: string;
  videoUrl?: string;
  embedUrl?: string;
  profileUrl?: string;
  marqueeItems?: string;
  productLimit?: number;
  /** Content card — media placement */
  mediaLayout?: string;
  /** Content card — entrance animation */
  animation?: string;
  /** Content card — corner radius */
  borderRadius?: string;
  /** Content card — background token or custom */
  bgStyle?: string;
  backgroundColor?: string;
  textColor?: string;
  /** Inner card content padding (contentCard) */
  padding?: string;
  mediaAspect?: string;
  /** Section outer spacing — default | none | sm | md | lg */
  paddingTop?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  paddingRight?: string;
  /** Content card grid — cards per row: 1–4 */
  columns?: string;
  /** Extra / all content cards as JSON array of ContentCardItem */
  cardsJson?: string;
};

/** One tile inside a content-card section. */
export type ContentCardItem = {
  eyebrow?: string;
  title?: string;
  body?: string;
  imageUrl?: string;
  videoUrl?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export type HomeSectionItem = {
  id: string;
  type: HomeSectionType;
  enabled: boolean;
  props?: HomeSectionProps;
};

export type HomeSectionFieldKey = keyof HomeSectionProps;

/** Spacing + layout fields available on every homepage block. */
export const SECTION_SPACING_FIELDS: HomeSectionFieldKey[] = [
  "paddingTop",
  "paddingBottom",
  "paddingLeft",
  "paddingRight",
];

function withSpacing(fields: HomeSectionFieldKey[]): HomeSectionFieldKey[] {
  return [...fields, ...SECTION_SPACING_FIELDS];
}

/** Unique editable fields per block type (plus section spacing on all). */
export function editableFieldsForType(
  type: HomeSectionType
): HomeSectionFieldKey[] {
  switch (type) {
    case "heroCinematic":
    case "heroStatic":
    case "heroMedia":
      return withSpacing([
        "brand",
        "headline",
        "subheadline",
        "imageUrl",
        "videoUrl",
        "ctaLabel",
        "ctaHref",
        "secondaryCtaLabel",
        "secondaryCtaHref",
      ]);
    case "editorialMasthead":
      return withSpacing([
        "brand",
        "headline",
        "subheadline",
        "ctaLabel",
        "ctaHref",
      ]);
    case "carousel":
      return withSpacing(["title", "subtitle", "imageUrl"]);
    case "marquee":
      return withSpacing(["marqueeItems"]);
    case "promoBanner":
      return withSpacing(["eyebrow", "title", "ctaLabel", "ctaHref"]);
    case "categoryPills":
      return withSpacing(["title"]);
    case "valuePillars":
      return withSpacing(["title", "subtitle"]);
    case "chapterStory":
    case "chapterAlt":
      return withSpacing([
        "chapter",
        "title",
        "body",
        "ctaLabel",
        "ctaHref",
        "imageUrl",
      ]);
    case "lookScroll":
      return withSpacing([
        "title",
        "subtitle",
        "linkLabel",
        "linkHref",
        "productLimit",
      ]);
    case "lookGrid":
      return withSpacing(["productLimit"]);
    case "essentialsGrid":
    case "essentialsFeatured":
      return withSpacing([
        "title",
        "subtitle",
        "linkLabel",
        "linkHref",
        "productLimit",
      ]);
    case "featureDrop":
      return withSpacing(["eyebrow", "body"]);
    case "pullQuote":
      return withSpacing(["eyebrow", "body"]);
    case "productRows":
      return withSpacing(["title", "linkLabel", "linkHref", "productLimit"]);
    case "bestSellersShelf":
    case "newArrivalsShelf":
      return withSpacing([
        "title",
        "subtitle",
        "linkLabel",
        "linkHref",
        "productLimit",
      ]);
    case "categoriesCards":
    case "categoriesList":
      return withSpacing(["title", "subtitle"]);
    case "imageMosaic":
      return withSpacing(["eyebrow", "title"]);
    case "stackedPanels":
      return withSpacing(["subtitle"]);
    case "storySplit":
    case "storyInline":
    case "mission":
      return withSpacing([
        "eyebrow",
        "title",
        "body",
        "ctaLabel",
        "ctaHref",
        "imageUrl",
      ]);
    case "testimonials":
    case "faq":
    case "newsletter":
    case "newsletterBand":
      return withSpacing(["title", "subtitle"]);
    case "instagram":
      return withSpacing(["title", "subtitle", "profileUrl"]);
    case "embedFrame":
      return withSpacing(["eyebrow", "title", "embedUrl", "subtitle"]);
    case "contentCard":
      // Card copy lives in cardsJson editor; these are shared style + grid
      return withSpacing([
        "columns",
        "mediaLayout",
        "mediaAspect",
        "animation",
        "borderRadius",
        "bgStyle",
        "backgroundColor",
        "textColor",
        "padding",
      ]);
    default:
      return withSpacing(["title", "subtitle"]);
  }
}

export const SECTION_FIELD_LABELS: Record<HomeSectionFieldKey, string> = {
  title: "Title",
  subtitle: "Subtitle / caption",
  eyebrow: "Eyebrow",
  body: "Body / rich text",
  chapter: "Chapter label",
  brand: "Brand label",
  headline: "Headline",
  subheadline: "Subheadline",
  ctaLabel: "Primary CTA label",
  ctaHref: "Primary CTA link",
  secondaryCtaLabel: "Secondary CTA label",
  secondaryCtaHref: "Secondary CTA link",
  linkLabel: "Link label",
  linkHref: "Link href",
  imageUrl: "Image / GIF URL",
  videoUrl: "Video URL (.mp4 / .webm)",
  embedUrl: "Embed URL (YouTube / Vimeo)",
  profileUrl: "Profile URL",
  marqueeItems: "Marquee items (comma-separated)",
  productLimit: "Product limit",
  mediaLayout: "Media alignment",
  animation: "Entrance animation",
  borderRadius: "Corner radius",
  bgStyle: "Background",
  backgroundColor: "Custom background color",
  textColor: "Text color",
  padding: "Card content padding",
  mediaAspect: "Media aspect ratio",
  paddingTop: "Section padding top",
  paddingBottom: "Section padding bottom",
  paddingLeft: "Section padding left",
  paddingRight: "Section padding right",
  columns: "Cards per row",
  cardsJson: "Cards data",
};

/** Dropdown choices for enum-like section fields. */
export const SECTION_FIELD_OPTIONS: Partial<
  Record<HomeSectionFieldKey, { value: string; label: string }[]>
> = {
  mediaLayout: [
    { value: "left", label: "Media left / text right" },
    { value: "right", label: "Text left / media right" },
    { value: "top", label: "Media on top" },
    { value: "bottom", label: "Media on bottom" },
  ],
  animation: [
    { value: "none", label: "None" },
    { value: "fadeIn", label: "Fade in" },
    { value: "fadeUp", label: "Fade up" },
    { value: "fadeDown", label: "Fade down" },
    { value: "fadeLeft", label: "Fade from right" },
    { value: "fadeRight", label: "Fade from left" },
    { value: "zoomIn", label: "Zoom in" },
  ],
  borderRadius: [
    { value: "none", label: "Square" },
    { value: "sm", label: "Slightly curved" },
    { value: "md", label: "Medium" },
    { value: "lg", label: "Rounded" },
    { value: "xl", label: "Very rounded" },
    { value: "full", label: "Soft pill corners" },
  ],
  bgStyle: [
    { value: "theme", label: "Page background" },
    { value: "muted", label: "Muted surface" },
    { value: "accent", label: "Accent" },
    { value: "custom", label: "Custom color" },
  ],
  padding: [
    { value: "sm", label: "Compact" },
    { value: "md", label: "Comfortable" },
    { value: "lg", label: "Spacious" },
  ],
  mediaAspect: [
    { value: "video", label: "Widescreen (16:9)" },
    { value: "square", label: "Square" },
    { value: "portrait", label: "Portrait" },
    { value: "auto", label: "Landscape (4:3)" },
  ],
  paddingTop: [
    { value: "default", label: "Default" },
    { value: "none", label: "None" },
    { value: "sm", label: "Small" },
    { value: "md", label: "Medium" },
    { value: "lg", label: "Large" },
  ],
  paddingBottom: [
    { value: "default", label: "Default" },
    { value: "none", label: "None" },
    { value: "sm", label: "Small" },
    { value: "md", label: "Medium" },
    { value: "lg", label: "Large" },
  ],
  paddingLeft: [
    { value: "default", label: "Default" },
    { value: "none", label: "None" },
    { value: "sm", label: "Small" },
    { value: "md", label: "Medium" },
    { value: "lg", label: "Large" },
  ],
  paddingRight: [
    { value: "default", label: "Default" },
    { value: "none", label: "None" },
    { value: "sm", label: "Small" },
    { value: "md", label: "Medium" },
    { value: "lg", label: "Large" },
  ],
  columns: [
    { value: "1", label: "1 per row" },
    { value: "2", label: "2 per row" },
    { value: "3", label: "3 per row" },
    { value: "4", label: "4 per row" },
  ],
};

/** Live CMS values used to prefill the edit form for a block. */
export function defaultPropsForSection(
  type: HomeSectionType,
  content: SectionContentSource
): HomeSectionProps {
  const { hero, home, site, testimonials, faq, instagram, newsletter } = content;

  switch (type) {
    case "heroCinematic":
    case "heroStatic":
    case "heroMedia":
      return {
        brand: hero.brand,
        headline: hero.headline,
        subheadline: hero.subheadline,
        imageUrl: hero.imageUrl,
        videoUrl: hero.videoUrl ?? "",
        ctaLabel: hero.primaryCtaLabel,
        ctaHref: hero.primaryCtaHref,
        secondaryCtaLabel: hero.secondaryCtaLabel,
        secondaryCtaHref: hero.secondaryCtaHref,
      };
    case "editorialMasthead":
      return {
        brand: site.name,
        headline: hero.headline,
        subheadline: hero.subheadline,
        ctaLabel: hero.primaryCtaLabel,
        ctaHref: hero.primaryCtaHref,
      };
    case "carousel":
      return {
        title: hero.headline,
        subtitle: hero.subheadline,
        imageUrl: hero.imageUrl,
      };
    case "marquee":
      return { marqueeItems: home.marqueeItems.join(", ") };
    case "promoBanner":
      return {
        eyebrow: "This week",
        title: home.essentials.subtitle,
        ctaLabel: hero.primaryCtaLabel,
        ctaHref: "/shop",
      };
    case "categoryPills":
      return { title: "Quick shop" };
    case "valuePillars":
      return {
        title: content.about.valuesTitle,
        subtitle: content.about.intro,
      };
    case "chapterStory":
      return {
        chapter: "01 — Craft",
        title: home.story.title,
        body: home.story.body,
        ctaLabel: home.story.ctaLabel,
        ctaHref: home.story.ctaHref,
        imageUrl: home.story.imageUrl,
      };
    case "chapterAlt":
      return {
        chapter: "02 — Wear",
        title: home.categories.title,
        body: home.categories.subtitle,
        ctaLabel: "Shop collections",
        ctaHref: "/collections",
        imageUrl: home.story.imageUrl,
      };
    case "lookScroll":
      return {
        title: home.essentials.title,
        subtitle: home.essentials.subtitle,
        linkLabel: "Enter the shop",
        linkHref: "/shop",
        productLimit: 5,
      };
    case "lookGrid":
      return { productLimit: 4 };
    case "essentialsGrid":
      return {
        title: home.essentials.title,
        subtitle: home.essentials.subtitle,
        linkLabel: "Shop all",
        linkHref: "/shop",
        productLimit: 4,
      };
    case "essentialsFeatured":
      return {
        title: home.essentials.title,
        subtitle: home.essentials.subtitle,
        linkLabel: "View all",
        linkHref: "/shop",
        productLimit: 8,
      };
    case "featureDrop":
      return { eyebrow: "Selected", body: home.essentials.subtitle };
    case "pullQuote":
      return { eyebrow: home.story.eyebrow, body: home.story.body };
    case "productRows":
      return {
        title: home.essentials.title,
        linkLabel: "Full catalogue",
        linkHref: "/shop",
        productLimit: 6,
      };
    case "bestSellersShelf":
      return {
        title: home.bestSellers.title,
        subtitle: home.bestSellers.subtitle,
        linkLabel: "Shop bestsellers",
        linkHref: "/shop?sort=best",
        productLimit: 8,
      };
    case "newArrivalsShelf":
      return {
        title: home.newArrivals.title,
        subtitle: home.newArrivals.subtitle,
        linkLabel: "Shop new",
        linkHref: "/shop?sort=new",
        productLimit: 8,
      };
    case "categoriesCards":
    case "categoriesList":
      return {
        title: home.categories.title,
        subtitle: home.categories.subtitle,
      };
    case "imageMosaic":
      return { eyebrow: "Campaign", title: home.essentials.title };
    case "stackedPanels":
      return { subtitle: home.categories.subtitle };
    case "storySplit":
    case "storyInline":
    case "mission":
      return {
        eyebrow: home.story.eyebrow,
        title: home.story.title,
        body: home.story.body,
        ctaLabel: home.story.ctaLabel,
        ctaHref: home.story.ctaHref,
        imageUrl: home.story.imageUrl,
      };
    case "testimonials":
      return { title: testimonials.title, subtitle: testimonials.subtitle };
    case "faq":
      return { title: faq.title, subtitle: faq.subtitle };
    case "instagram":
      return {
        title: instagram.title,
        subtitle: instagram.subtitle,
        profileUrl: instagram.profileUrl,
      };
    case "newsletter":
    case "newsletterBand":
      return { title: newsletter.title, subtitle: newsletter.subtitle };
    case "embedFrame":
      return {
        eyebrow: "Film",
        title: "Campaign film",
        embedUrl: hero.videoUrl ?? "",
        subtitle:
          "Paste a YouTube or Vimeo URL. Leave blank to use Hero video URL.",
      };
    case "contentCard":
      return {
        columns: "1",
        mediaLayout: "left",
        mediaAspect: "video",
        animation: "fadeUp",
        borderRadius: "lg",
        bgStyle: "muted",
        backgroundColor: "",
        textColor: "",
        padding: "md",
        paddingTop: "default",
        paddingBottom: "default",
        paddingLeft: "default",
        paddingRight: "default",
        cardsJson: JSON.stringify([
          {
            eyebrow: home.story.eyebrow,
            title: home.story.title,
            body: home.story.body,
            imageUrl: home.story.imageUrl,
            videoUrl: "",
            ctaLabel: home.story.ctaLabel,
            ctaHref: home.story.ctaHref,
          },
        ] satisfies ContentCardItem[]),
      };
    default:
      return {};
  }
}

export type HomeSectionMeta = {
  type: HomeSectionType;
  label: string;
  description: string;
};

export const HOME_SECTION_CATALOG: HomeSectionMeta[] = [
  { type: "heroCinematic", label: "Cinematic hero", description: "Full-viewport parallax / video hero" },
  { type: "heroStatic", label: "Static hero", description: "Split image + copy hero" },
  { type: "heroMedia", label: "Media hero", description: "Shorter commerce media hero" },
  { type: "editorialMasthead", label: "Editorial masthead", description: "Type-led magazine header" },
  { type: "carousel", label: "Carousel", description: "Campaign image carousel" },
  { type: "marquee", label: "Marquee", description: "Scrolling word ticker" },
  { type: "promoBanner", label: "Promo banner", description: "This-week promo strip" },
  { type: "categoryPills", label: "Category pills", description: "Quick-shop category chips" },
  { type: "valuePillars", label: "Value pillars", description: "About values in three columns" },
  { type: "chapterStory", label: "Chapter band", description: "Full-bleed story chapter" },
  { type: "chapterAlt", label: "Alt chapter band", description: "Second chapter (category image)" },
  { type: "lookScroll", label: "Look scroll", description: "Horizontal look tiles" },
  { type: "lookGrid", label: "Look grid", description: "Oversized look tiles grid" },
  { type: "essentialsGrid", label: "Essentials grid", description: "4-product essentials grid" },
  { type: "essentialsFeatured", label: "Featured band", description: "Featured products on muted band" },
  { type: "featureDrop", label: "Feature drop", description: "Single featured product drop" },
  { type: "pullQuote", label: "Pull quote", description: "Large quote from story copy" },
  { type: "productRows", label: "Product rows", description: "Editorial product index rows" },
  { type: "bestSellersShelf", label: "Bestsellers shelf", description: "Horizontal bestsellers" },
  { type: "newArrivalsShelf", label: "New arrivals shelf", description: "Horizontal new arrivals" },
  { type: "categoriesCards", label: "Category cards", description: "Image category cards" },
  { type: "categoriesList", label: "Category list", description: "Text category list" },
  { type: "imageMosaic", label: "Image mosaic", description: "Campaign mosaic grid" },
  { type: "stackedPanels", label: "Stacked panels", description: "Full-bleed stacked campaigns" },
  { type: "storySplit", label: "Story split", description: "Sticky split story block" },
  { type: "storyInline", label: "Story inline", description: "Compact story + CTA row" },
  { type: "mission", label: "Mission", description: "Mission statement block" },
  { type: "testimonials", label: "Testimonials", description: "Customer reviews" },
  { type: "faq", label: "FAQ accordion", description: "Homepage FAQ digest" },
  { type: "instagram", label: "Instagram", description: "Instagram gallery" },
  { type: "newsletter", label: "Newsletter", description: "Light newsletter signup" },
  { type: "newsletterBand", label: "Newsletter band", description: "Inverted newsletter band" },
  { type: "embedFrame", label: "Embed / film", description: "YouTube/Vimeo campaign film" },
  {
    type: "contentCard",
    label: "Content card",
    description:
      "One or more media + text cards with columns, padding, and animation",
  },
];

function sid(type: HomeSectionType, i: number): HomeSectionItem {
  return { id: `${type}-${i}`, type, enabled: true };
}

export function defaultSectionsForTemplate(
  template: HomeTemplateId
): HomeSectionItem[] {
  switch (template) {
    case "simple":
      return [
        sid("heroStatic", 0),
        sid("valuePillars", 1),
        sid("essentialsGrid", 2),
        sid("categoriesList", 3),
        sid("mission", 4),
        sid("testimonials", 5),
        sid("faq", 6),
        sid("newsletter", 7),
      ];
    case "editorial":
      return [
        sid("editorialMasthead", 0),
        sid("featureDrop", 1),
        sid("pullQuote", 2),
        sid("productRows", 3),
        sid("storySplit", 4),
        sid("faq", 5),
        sid("newsletterBand", 6),
      ];
    case "lookbook":
      return [
        sid("carousel", 0),
        sid("imageMosaic", 1),
        sid("stackedPanels", 2),
        sid("lookGrid", 3),
        sid("embedFrame", 4),
        sid("instagram", 5),
      ];
    case "commerce":
      return [
        sid("heroMedia", 0),
        sid("promoBanner", 1),
        sid("categoryPills", 2),
        sid("bestSellersShelf", 3),
        sid("essentialsFeatured", 4),
        sid("newArrivalsShelf", 5),
        sid("categoriesCards", 6),
        sid("storyInline", 7),
        sid("faq", 8),
        sid("instagram", 9),
        sid("newsletterBand", 10),
      ];
    case "parallax":
    default:
      return [
        sid("heroCinematic", 0),
        sid("marquee", 1),
        sid("chapterStory", 2),
        sid("lookScroll", 3),
        sid("chapterAlt", 4),
      ];
  }
}

export function isHomeSectionType(value: unknown): value is HomeSectionType {
  return (
    typeof value === "string" &&
    (HOME_SECTION_TYPES as readonly string[]).includes(value)
  );
}

export function normalizeHomeSections(
  stored: unknown,
  template: HomeTemplateId
): HomeSectionItem[] {
  if (!Array.isArray(stored) || stored.length === 0) {
    return defaultSectionsForTemplate(template);
  }

  const seen = new Set<string>();
  const items: HomeSectionItem[] = [];

  for (const raw of stored) {
    if (!raw || typeof raw !== "object") continue;
    const row = raw as Partial<HomeSectionItem>;
    if (!isHomeSectionType(row.type)) continue;
    const id =
      typeof row.id === "string" && row.id.trim()
        ? row.id.trim()
        : `${row.type}-${items.length}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const props =
      row.props && typeof row.props === "object"
        ? normalizeSectionProps(row.props)
        : undefined;
    items.push({
      id,
      type: row.type,
      enabled: row.enabled !== false,
      ...(props ? { props } : {}),
    });
  }

  return items.length > 0 ? items : defaultSectionsForTemplate(template);
}

function normalizeSectionProps(raw: unknown): HomeSectionProps | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const p = raw as Partial<HomeSectionProps>;
  const next: HomeSectionProps = {};
  const strings: HomeSectionFieldKey[] = [
    "title",
    "subtitle",
    "eyebrow",
    "body",
    "chapter",
    "brand",
    "headline",
    "subheadline",
    "ctaLabel",
    "ctaHref",
    "secondaryCtaLabel",
    "secondaryCtaHref",
    "linkLabel",
    "linkHref",
    "imageUrl",
    "videoUrl",
    "embedUrl",
    "profileUrl",
    "marqueeItems",
    "mediaLayout",
    "animation",
    "borderRadius",
    "bgStyle",
    "backgroundColor",
    "textColor",
    "padding",
    "mediaAspect",
    "paddingTop",
    "paddingBottom",
    "paddingLeft",
    "paddingRight",
    "columns",
    "cardsJson",
  ];
  for (const key of strings) {
    if (typeof p[key] === "string") {
      (next as Record<string, string>)[key] = p[key] as string;
    }
  }
  if (typeof p.productLimit === "number" && p.productLimit > 0) {
    next.productLimit = Math.min(24, Math.round(p.productLimit));
  }
  return Object.keys(next).length > 0 ? next : undefined;
}

/** Resolve content-card tiles from cardsJson or legacy flat props. */
export function resolveContentCards(
  props?: HomeSectionProps
): ContentCardItem[] {
  const o = props ?? {};
  if (o.cardsJson?.trim()) {
    try {
      const parsed = JSON.parse(o.cardsJson) as unknown;
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((raw) => {
          const c =
            raw && typeof raw === "object"
              ? (raw as ContentCardItem)
              : ({} as ContentCardItem);
          return {
            eyebrow: typeof c.eyebrow === "string" ? c.eyebrow : "",
            title: typeof c.title === "string" ? c.title : "",
            body: typeof c.body === "string" ? c.body : "",
            imageUrl: typeof c.imageUrl === "string" ? c.imageUrl : "",
            videoUrl: typeof c.videoUrl === "string" ? c.videoUrl : "",
            ctaLabel: typeof c.ctaLabel === "string" ? c.ctaLabel : "",
            ctaHref: typeof c.ctaHref === "string" ? c.ctaHref : "",
          };
        });
      }
    } catch {
      /* fall through to legacy */
    }
  }
  return [
    {
      eyebrow: o.eyebrow ?? "",
      title: o.title ?? "",
      body: o.body ?? "",
      imageUrl: o.imageUrl ?? "",
      videoUrl: o.videoUrl ?? "",
      ctaLabel: o.ctaLabel ?? "",
      ctaHref: o.ctaHref ?? "",
    },
  ];
}

/** Prefer section override, else fallback CMS copy. */
export function sectionText(
  override: string | undefined,
  fallback: string
): string {
  const t = override?.trim();
  return t ? t : fallback;
}

export function sectionLabel(type: HomeSectionType) {
  return HOME_SECTION_CATALOG.find((s) => s.type === type)?.label ?? type;
}

/** Effective field value for admin inputs (override ?? live default). */
export function effectiveSectionProp(
  section: HomeSectionItem,
  key: HomeSectionFieldKey,
  defaults: HomeSectionProps
): string {
  const own = section.props?.[key];
  if (key === "productLimit") {
    const n =
      typeof own === "number"
        ? own
        : typeof defaults.productLimit === "number"
          ? defaults.productLimit
          : undefined;
    return n != null ? String(n) : "";
  }
  if (typeof own === "string") return own;
  const fallback = defaults[key];
  return typeof fallback === "string" ? fallback : "";
}
