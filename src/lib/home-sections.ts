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
  "imageGallery",
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
  "trailHero",
  "trustBar",
  "productGrid",
  "videoPlayer",
  "promoHelloBar",
  "countdownOffer",
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
  /** Image mosaic tiles as JSON array of MosaicCellItem */
  cellsJson?: string;
  /** Image gallery items as JSON array of GalleryImageItem */
  imagesJson?: string;
  /** Promo hello bar / countdown — show from (ISO or datetime-local) */
  scheduleStartAt?: string;
  /** Promo hello bar / countdown — show until */
  scheduleEndAt?: string;
  /** Countdown offer — target end date/time */
  countdownTargetAt?: string;
  /** Countdown offer — copy after timer hits zero */
  countdownExpiredMessage?: string;
  /** Poster image for video player */
  posterImageUrl?: string;
  /** yes/no toggles — SuperAdmin component settings */
  settingSticky?: string;
  settingDismissible?: string;
  settingAutoplay?: string;
  settingMuted?: string;
  settingLoop?: string;
  settingShowControls?: string;
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

export type MosaicCellItem = {
  imageUrl: string;
  title: string;
  linkHref: string;
  imageAlt?: string;
  span?: "tall" | "wide" | "square";
};

export type GalleryImageItem = {
  imageUrl: string;
  title: string;
  caption: string;
  linkHref: string;
  imageAlt: string;
};

export type HomeSectionItem = {
  id: string;
  type: HomeSectionType;
  enabled: boolean;
  /** When set, props merge library component props with page-level overrides. */
  componentRefId?: string;
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

/** Content fields only — section padding lives in component settings (SuperAdmin). */
function contentFields(fields: HomeSectionFieldKey[]): HomeSectionFieldKey[] {
  return fields;
}

/** Visual / layout fields — shown under Component settings (SuperAdmin). */
const CONTENT_CARD_SETTINGS_FIELDS: HomeSectionFieldKey[] = [
  "columns",
  "mediaLayout",
  "mediaAspect",
  "animation",
  "borderRadius",
  "bgStyle",
  "backgroundColor",
  "textColor",
  "padding",
];

const IMAGE_GALLERY_SETTINGS_FIELDS: HomeSectionFieldKey[] = [
  "columns",
  "mediaAspect",
  "borderRadius",
  "bgStyle",
  "backgroundColor",
];

const VIDEO_PLAYER_SETTINGS_FIELDS: HomeSectionFieldKey[] = [
  "mediaAspect",
  "borderRadius",
  "bgStyle",
  "backgroundColor",
  "textColor",
  "settingAutoplay",
  "settingMuted",
  "settingLoop",
  "settingShowControls",
];

const PROMO_HELLO_BAR_SETTINGS_FIELDS: HomeSectionFieldKey[] = [
  "bgStyle",
  "backgroundColor",
  "textColor",
  "settingSticky",
  "settingDismissible",
];

const COUNTDOWN_OFFER_SETTINGS_FIELDS: HomeSectionFieldKey[] = [
  "bgStyle",
  "backgroundColor",
  "textColor",
  "borderRadius",
];

/** Padding, spacing, and block-level styling — SuperAdmin component settings panel. */
export function componentSettingsFieldsForType(
  type: HomeSectionType
): HomeSectionFieldKey[] {
  if (type === "contentCard") {
    return [...CONTENT_CARD_SETTINGS_FIELDS, ...SECTION_SPACING_FIELDS];
  }
  if (type === "imageGallery") {
    return [...IMAGE_GALLERY_SETTINGS_FIELDS, ...SECTION_SPACING_FIELDS];
  }
  if (type === "videoPlayer") {
    return [...VIDEO_PLAYER_SETTINGS_FIELDS, ...SECTION_SPACING_FIELDS];
  }
  if (type === "promoHelloBar") {
    return [...PROMO_HELLO_BAR_SETTINGS_FIELDS, ...SECTION_SPACING_FIELDS];
  }
  if (type === "countdownOffer") {
    return [...COUNTDOWN_OFFER_SETTINGS_FIELDS, ...SECTION_SPACING_FIELDS];
  }
  return [...SECTION_SPACING_FIELDS];
}

/** Unique editable fields per block type (plus section spacing on all). */
export function editableFieldsForType(
  type: HomeSectionType
): HomeSectionFieldKey[] {
  switch (type) {
    case "heroCinematic":
    case "heroStatic":
    case "heroMedia":
      return contentFields([
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
      return contentFields([
        "brand",
        "headline",
        "subheadline",
        "ctaLabel",
        "ctaHref",
      ]);
    case "carousel":
      return contentFields(["title", "subtitle", "imageUrl"]);
    case "marquee":
      return contentFields(["marqueeItems"]);
    case "promoBanner":
      return contentFields(["eyebrow", "title", "ctaLabel", "ctaHref"]);
    case "categoryPills":
      return contentFields(["title"]);
    case "valuePillars":
      return contentFields(["title", "subtitle"]);
    case "chapterStory":
    case "chapterAlt":
      return contentFields([
        "chapter",
        "title",
        "body",
        "ctaLabel",
        "ctaHref",
        "imageUrl",
      ]);
    case "lookScroll":
      return contentFields([
        "title",
        "subtitle",
        "linkLabel",
        "linkHref",
        "productLimit",
      ]);
    case "lookGrid":
      return contentFields(["productLimit"]);
    case "essentialsGrid":
    case "essentialsFeatured":
      return contentFields([
        "title",
        "subtitle",
        "linkLabel",
        "linkHref",
        "productLimit",
      ]);
    case "featureDrop":
      return contentFields(["eyebrow", "body"]);
    case "pullQuote":
      return contentFields(["eyebrow", "body"]);
    case "productRows":
      return contentFields(["title", "linkLabel", "linkHref", "productLimit"]);
    case "bestSellersShelf":
    case "newArrivalsShelf":
      return contentFields([
        "title",
        "subtitle",
        "linkLabel",
        "linkHref",
        "productLimit",
      ]);
    case "categoriesCards":
    case "categoriesList":
      return contentFields(["title", "subtitle"]);
    case "imageMosaic":
      return contentFields(["eyebrow", "title"]);
    case "imageGallery":
      return contentFields(["title", "subtitle"]);
    case "stackedPanels":
      return contentFields(["subtitle"]);
    case "storySplit":
    case "storyInline":
    case "mission":
      return contentFields([
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
      return contentFields(["title", "subtitle"]);
    case "instagram":
      return contentFields(["title", "subtitle", "profileUrl"]);
    case "embedFrame":
      return contentFields(["eyebrow", "title", "embedUrl", "subtitle"]);
    case "contentCard":
      // Card copy lives in cardsJson editor; layout/style in component settings
      return contentFields([]);
    case "trailHero":
      return contentFields([
        "eyebrow",
        "brand",
        "headline",
        "subheadline",
        "imageUrl",
        "ctaLabel",
        "ctaHref",
        "subtitle",
        "linkLabel",
        "linkHref",
      ]);
    case "trustBar":
      return contentFields(["title", "subtitle", "linkLabel", "linkHref"]);
    case "productGrid":
      return contentFields([
        "title",
        "subtitle",
        "linkLabel",
        "linkHref",
        "productLimit",
      ]);
    case "videoPlayer":
      return contentFields([
        "title",
        "subtitle",
        "videoUrl",
        "embedUrl",
        "posterImageUrl",
        "ctaLabel",
        "ctaHref",
      ]);
    case "promoHelloBar":
      return contentFields([
        "body",
        "ctaLabel",
        "ctaHref",
        "scheduleStartAt",
        "scheduleEndAt",
      ]);
    case "countdownOffer":
      return contentFields([
        "title",
        "subtitle",
        "scheduleStartAt",
        "countdownTargetAt",
        "countdownExpiredMessage",
        "ctaLabel",
        "ctaHref",
      ]);
    default:
      return contentFields(["title", "subtitle"]);
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
  cellsJson: "Mosaic tiles data",
  imagesJson: "Gallery images data",
  scheduleStartAt: "Starts at (date & time)",
  scheduleEndAt: "Show until (date & time)",
  countdownTargetAt: "Ends at (date & time)",
  countdownExpiredMessage: "Message when offer ends",
  posterImageUrl: "Poster image (optional)",
  settingSticky: "Stick to top while scrolling",
  settingDismissible: "Allow visitors to dismiss",
  settingAutoplay: "Autoplay video",
  settingMuted: "Start video muted",
  settingLoop: "Loop video",
  settingShowControls: "Show video controls",
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
    { value: "5", label: "5 per row" },
    { value: "6", label: "6 per row" },
  ],
  settingSticky: [
    { value: "no", label: "No" },
    { value: "yes", label: "Yes" },
  ],
  settingDismissible: [
    { value: "no", label: "No" },
    { value: "yes", label: "Yes" },
  ],
  settingAutoplay: [
    { value: "no", label: "No" },
    { value: "yes", label: "Yes" },
  ],
  settingMuted: [
    { value: "yes", label: "Yes (recommended)" },
    { value: "no", label: "No — sound on play (autoplay may be blocked)" },
  ],
  settingLoop: [
    { value: "no", label: "No" },
    { value: "yes", label: "Yes" },
  ],
  settingShowControls: [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
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
      return {
        eyebrow: "Campaign",
        title: home.essentials.title,
        cellsJson: JSON.stringify([
          {
            imageUrl: home.story.imageUrl,
            title: home.story.title,
            linkHref: home.story.ctaHref,
            imageAlt: home.story.title,
            span: "tall",
          },
          {
            imageUrl: hero.imageUrl,
            title: hero.headline,
            linkHref: hero.primaryCtaHref,
            imageAlt: hero.headline,
            span: "wide",
          },
        ] satisfies MosaicCellItem[]),
      };
    case "imageGallery":
      return {
        title: "Gallery",
        subtitle: home.categories.subtitle,
        columns: "3",
        mediaAspect: "square",
        borderRadius: "md",
        bgStyle: "theme",
        imagesJson: JSON.stringify([
          {
            imageUrl: home.story.imageUrl,
            title: "Look one",
            caption: "",
            linkHref: "/shop",
            imageAlt: "Look one",
          },
          {
            imageUrl: hero.imageUrl,
            title: "Look two",
            caption: "",
            linkHref: "/shop",
            imageAlt: "Look two",
          },
          {
            imageUrl: home.story.imageUrl,
            title: "Look three",
            caption: "",
            linkHref: "/shop",
            imageAlt: "Look three",
          },
        ] satisfies GalleryImageItem[]),
      };
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
    case "trailHero":
      return {
        eyebrow: "Graphic tees for your kind of outside",
        brand: hero.brand,
        headline: "GO SLOW.\nGET OUTSIDE.",
        subheadline:
          "Good nature. A little mischief.\nTees for taking the long way home.",
        imageUrl: hero.imageUrl,
        ctaLabel: hero.primaryCtaLabel,
        ctaHref: hero.primaryCtaHref,
        subtitle: "4.8 / 5 · 4,000+ customer reviews",
        linkLabel: "See who’s wearing us",
        linkHref: "/shop",
      };
    case "trustBar":
      return {
        title: "Free shipping on orders over ₹2,000 · More wandering, less worrying",
      };
    case "productGrid":
      return {
        title: "Your trail uniform.",
        subtitle: "Explore the tees",
        linkLabel: "Explore the tees",
        linkHref: "/shop",
        productLimit: 8,
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
    case "videoPlayer":
      return {
        title: "Watch our story",
        subtitle: "A short film about how we make every tee.",
        videoUrl: hero.videoUrl ?? "",
        embedUrl: "",
        posterImageUrl: hero.imageUrl,
        ctaLabel: hero.primaryCtaLabel,
        ctaHref: hero.primaryCtaHref,
        mediaAspect: "video",
        borderRadius: "lg",
        bgStyle: "theme",
        settingMuted: "yes",
        settingShowControls: "yes",
        settingAutoplay: "no",
        settingLoop: "yes",
      };
    case "promoHelloBar":
      return {
        body: "Free shipping on orders over ₹2,000 — this week only",
        ctaLabel: "Shop now",
        ctaHref: "/shop",
        scheduleStartAt: "",
        scheduleEndAt: "",
        bgStyle: "accent",
        settingSticky: "no",
        settingDismissible: "yes",
      };
    case "countdownOffer":
      return {
        title: "Launch weekend sale",
        subtitle: "Extra 15% off essentials before the timer runs out.",
        scheduleStartAt: "",
        countdownTargetAt: "",
        countdownExpiredMessage: "This offer has ended — explore the full collection.",
        ctaLabel: hero.primaryCtaLabel,
        ctaHref: "/shop",
        bgStyle: "muted",
        borderRadius: "lg",
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
  {
    type: "imageGallery",
    label: "Image gallery",
    description: "Custom image grid with titles and optional links",
  },
  { type: "stackedPanels", label: "Stacked panels", description: "Full-bleed stacked campaigns" },
  { type: "storySplit", label: "Story split", description: "Sticky split story block" },
  { type: "storyInline", label: "Story inline", description: "Compact story + CTA row" },
  { type: "mission", label: "Mission", description: "Mission statement block" },
  { type: "testimonials", label: "Testimonials", description: "Customer reviews" },
  { type: "faq", label: "FAQ accordion", description: "Homepage FAQ digest" },
  { type: "instagram", label: "Instagram", description: "Instagram gallery" },
  { type: "newsletter", label: "Newsletter", description: "Light newsletter signup" },
  { type: "newsletterBand", label: "Newsletter band", description: "Inverted newsletter band" },
  { type: "embedFrame", label: "Video embed (legacy)", description: "YouTube or Vimeo embed with heading" },
  {
    type: "videoPlayer",
    label: "Video player",
    description: "Self-hosted .mp4 or YouTube/Vimeo with poster and caption",
  },
  {
    type: "countdownOffer",
    label: "Countdown offer",
    description: "Sale countdown with end date and expired message",
  },
  {
    type: "contentCard",
    label: "Content card",
    description:
      "One or more media + text cards with columns, padding, and animation",
  },
  {
    type: "trailHero",
    label: "Trail hero",
    description: "Outdoor-club split hero with reviews strip",
  },
  { type: "trustBar", label: "Trust bar", description: "Shipping / reviews promo strip" },
  {
    type: "productGrid",
    label: "Product grid",
    description: "8-up bestseller grid with shop link",
  },
];

export function getHomeSectionCatalogSorted(): HomeSectionMeta[] {
  return [...HOME_SECTION_CATALOG].sort((a, b) =>
    a.label.localeCompare(b.label, undefined, { sensitivity: "base" })
  );
}

function sid(
  type: HomeSectionType,
  i: number,
  props?: HomeSectionProps
): HomeSectionItem {
  return {
    id: `${type}-${i}`,
    type,
    enabled: true,
    ...(props ? { props } : {}),
  };
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
    case "trail":
      return [
        sid("trustBar", 0, {
          title:
            "Free shipping on orders over ₹2,000 · More wandering, less worrying",
        }),
        sid("trailHero", 1),
        sid("marquee", 2, {
          marqueeItems:
            "More wandering,Less worrying,Absolutely no rushing,Take your time",
        }),
        sid("productGrid", 3, {
          title: "Your trail uniform.",
          subtitle: "Explore the tees",
          linkLabel: "Explore the tees",
          linkHref: "/shop",
          productLimit: 8,
        }),
        sid("newArrivalsShelf", 4, {
          title: "Fresh tees. Same slow pace.",
          subtitle: "New arrivals",
          linkLabel: "Shop new arrivals",
          linkHref: "/shop?sort=new",
        }),
        sid("contentCard", 5, {
          eyebrow: "Why we love organic cotton",
          title: "Made for\ntaking it easy.",
          body:
            "• 100% ring-spun cotton — substantial, soft feel\n• Garment-dyed for that already-loved feel\n• Relaxed fit with room to slow down",
          imageUrl:
            "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=1600&q=80",
          mediaLayout: "left",
          mediaAspect: "portrait",
          bgStyle: "muted",
          padding: "lg",
          ctaLabel: "Find your everyday tee",
          ctaHref: "/shop",
          cardsJson: JSON.stringify([
            {
              eyebrow: "Why we love organic cotton",
              title: "Made for taking it easy.",
              body:
                "• 100% ring-spun cotton — substantial, soft feel\n• Garment-dyed for that already-loved feel\n• Relaxed fit with room to slow down",
              imageUrl:
                "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=1600&q=80",
              ctaLabel: "Find your everyday tee",
              ctaHref: "/shop",
            },
          ]),
        }),
        sid("essentialsFeatured", 6, {
          title: "A warmer kind of slow.",
          subtitle: "Soft fleece. Woodland humor. Room for one more snack break.",
          linkLabel: "Shop sweatshirts",
          linkHref: "/shop",
        }),
        sid("testimonials", 7, {
          title: "Worn by you.",
          subtitle: "Good tees. Great company. Shop the shirts our customers wear.",
        }),
        sid("contentCard", 8, {
          columns: "2",
          title: "Pack your favorites.",
          body: "Two good tees. A few snacks. Absolutely no hurry to get there.",
          mediaLayout: "top",
          mediaAspect: "square",
          bgStyle: "theme",
          cardsJson: JSON.stringify([
            {
              title: "Weekend carry",
              body: "Out Of Breath tee · Sunrise Pines tee",
              imageUrl:
                "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
              ctaLabel: "Shop bestsellers",
              ctaHref: "/shop?sort=best",
            },
            {
              title: "In the bag",
              body: "Layer up. Stay outside. Take the scenic route.",
              imageUrl:
                "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80",
              ctaLabel: "Build your kit",
              ctaHref: "/shop",
            },
          ]),
        }),
        sid("newsletterBand", 9, {
          title: "A little more outside.",
          subtitle: "New designs, club news, and a good excuse to take a break.",
        }),
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
    "cellsJson",
    "imagesJson",
    "scheduleStartAt",
    "scheduleEndAt",
    "countdownTargetAt",
    "countdownExpiredMessage",
    "posterImageUrl",
    "settingSticky",
    "settingDismissible",
    "settingAutoplay",
    "settingMuted",
    "settingLoop",
    "settingShowControls",
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

function parseJsonArray<T>(
  raw: string | undefined,
  mapItem: (value: unknown) => T
): T[] | null {
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed.map(mapItem);
  } catch {
    return null;
  }
}

/** Admin-edited mosaic tiles; null when using storefront auto-fill. */
export function resolveMosaicCells(
  props?: HomeSectionProps
): MosaicCellItem[] | null {
  return parseJsonArray(props?.cellsJson, (raw) => {
    const c =
      raw && typeof raw === "object"
        ? (raw as MosaicCellItem)
        : ({} as MosaicCellItem);
    const span = c.span;
    return {
      imageUrl: typeof c.imageUrl === "string" ? c.imageUrl : "",
      title: typeof c.title === "string" ? c.title : "",
      linkHref: typeof c.linkHref === "string" ? c.linkHref : "",
      imageAlt: typeof c.imageAlt === "string" ? c.imageAlt : "",
      span:
        span === "tall" || span === "wide" || span === "square"
          ? span
          : undefined,
    };
  });
}

/** Gallery images from imagesJson. */
export function resolveGalleryImages(
  props?: HomeSectionProps
): GalleryImageItem[] {
  const parsed = parseJsonArray(props?.imagesJson, (raw) => {
    const c =
      raw && typeof raw === "object"
        ? (raw as GalleryImageItem)
        : ({} as GalleryImageItem);
    return {
      imageUrl: typeof c.imageUrl === "string" ? c.imageUrl : "",
      title: typeof c.title === "string" ? c.title : "",
      caption: typeof c.caption === "string" ? c.caption : "",
      linkHref: typeof c.linkHref === "string" ? c.linkHref : "",
      imageAlt: typeof c.imageAlt === "string" ? c.imageAlt : "",
    };
  });
  return parsed ?? [];
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
