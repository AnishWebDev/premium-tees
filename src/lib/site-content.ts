import { prisma } from "@/lib/prisma";
import {
  DEFAULT_SITE_DESCRIPTION,
  DEFAULT_SITE_NAME,
} from "@/lib/site-defaults";
import {
  FAQ_ITEMS,
  FOOTER_ESSENTIAL_LINKS,
  FOOTER_IMAGE,
  FOOTER_TRUST_ITEMS,
  INSTAGRAM_IMAGES,
  NAV_LINKS,
  TESTIMONIALS,
} from "@/lib/constants";
import {
  isHomeTemplateId,
  type HomeTemplateId,
} from "@/lib/home-templates";
import {
  defaultSectionsForTemplate,
  normalizeHomeSections,
  type HomeSectionItem,
} from "@/lib/home-sections";
import {
  DEFAULT_THEME,
  normalizeSavedThemes,
  normalizeTheme,
  type SavedThemePreset,
  type ThemeData,
} from "@/lib/theme";
import type { HelloBarData } from "@/lib/hello-bar";
import { DEFAULT_HELLO_BAR, mergeHelloBar } from "@/lib/hello-bar";

export type { HelloBarData };

export const CONTENT_KEYS = [
  "site",
  "header",
  "footer",
  "hero",
  "home",
  "about",
  "contact",
  "testimonials",
  "faq",
  "instagram",
  "newsletter",
  "theme",
  "savedThemes",
  "footerCredit",
] as const;

export type ContentKey = (typeof CONTENT_KEYS)[number];

export type SiteData = {
  name: string;
  description: string;
};

export type NavLinkItem = {
  href: string;
  label: string;
};

export type HeaderData = {
  navLinks: NavLinkItem[];
  logoImageUrl: string;
  logoImageAlt: string;
  helloBar: HelloBarData;
};

export type FooterTrustItem = {
  title: string;
  subtitle: string;
};

export type FooterData = {
  bannerImageUrl: string;
  bannerImageAlt: string;
  tagline: string;
  trustItems: FooterTrustItem[];
  essentialLinks: NavLinkItem[];
};

export type HeroData = {
  brand: string;
  headline: string;
  subheadline: string;
  imageUrl: string;
  /** Optional looping hero video (poster falls back to imageUrl). */
  videoUrl?: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
};

export type HomeSectionData = {
  title: string;
  subtitle: string;
};

export type HomeStoryData = {
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl: string;
};

export type HomeData = {
  /** SuperAdmin-selected homepage layout preset */
  template: HomeTemplateId;
  /** Ordered blocks — SuperAdmin can drag / add / remove */
  sections: HomeSectionItem[];
  marqueeItems: string[];
  essentials: HomeSectionData;
  story: HomeStoryData;
  bestSellers: HomeSectionData;
  newArrivals: HomeSectionData;
  categories: HomeSectionData;
};

export type ContactData = {
  title: string;
  subtitle: string;
  email: string;
  phone: string;
  phoneHours: string;
  studioLabel: string;
  studioLine1: string;
  studioLine2: string;
  formTitle: string;
};

export type AboutValue = { title: string; body: string };

export type AboutData = {
  eyebrow: string;
  title: string;
  intro: string;
  storyTitle: string;
  storyParagraphs: string[];
  valuesTitle: string;
  values: AboutValue[];
  ctaTitle: string;
  ctaSubtitle: string;
  ctaLabel: string;
  ctaHref: string;
};

export type TestimonialItem = {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
};

export type TestimonialsData = {
  title: string;
  subtitle: string;
  items: TestimonialItem[];
};

export type FaqData = {
  title: string;
  subtitle: string;
  items: { question: string; answer: string }[];
};

export type InstagramData = {
  title: string;
  subtitle: string;
  profileUrl: string;
  images: string[];
};

export type NewsletterData = {
  title: string;
  subtitle: string;
};

export type FooterCreditData = {
  enabled: boolean;
  prefix: string;
  name: string;
  nameHref: string;
  heartColor: string;
  textColor: string;
  fontSizePx: number;
  fontFamily: string;
  italic: boolean;
};

export type { ThemeData };

export type AllSiteContent = {
  site: SiteData;
  header: HeaderData;
  footer: FooterData;
  hero: HeroData;
  home: HomeData;
  about: AboutData;
  contact: ContactData;
  testimonials: TestimonialsData;
  faq: FaqData;
  instagram: InstagramData;
  newsletter: NewsletterData;
  theme: ThemeData;
  savedThemes: SavedThemePreset[];
  footerCredit: FooterCreditData;
};

export const DEFAULT_SITE_CONTENT: AllSiteContent = {
  site: {
    name: DEFAULT_SITE_NAME,
    description: DEFAULT_SITE_DESCRIPTION,
  },
  header: {
    navLinks: [...NAV_LINKS],
    logoImageUrl: "",
    logoImageAlt: "",
    helloBar: { ...DEFAULT_HELLO_BAR },
  },
  footer: {
    bannerImageUrl: FOOTER_IMAGE,
    bannerImageAlt: "Outdoor landscape",
    tagline: "Go slow. Get outside.",
    trustItems: FOOTER_TRUST_ITEMS.map((item) => ({ ...item })),
    essentialLinks: FOOTER_ESSENTIAL_LINKS.map((item) => ({ ...item })),
  },
  hero: {
    brand: DEFAULT_SITE_NAME,
    headline: "Tees built for everyday excellence.",
    subheadline:
      "Premium organic cotton, refined fit, and a finish that holds up wash after wash.",
    imageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1920&q=80",
    // Optional: set a CDN .mp4 in Admin → Site content → Hero for video background
    videoUrl: "",
    primaryCtaLabel: "Shop",
    primaryCtaHref: "/shop",
    secondaryCtaLabel: "Our story",
    secondaryCtaHref: "/about",
  },
  home: {
    template: "parallax",
    sections: defaultSectionsForTemplate("parallax"),
    marqueeItems: [
      "Organic cotton",
      "Refined fit",
      "Everyday wear",
      "Built to last",
    ],
    essentials: {
      title: "Essentials",
      subtitle: "A short edit of pieces we reach for every week.",
    },
    story: {
      eyebrow: DEFAULT_SITE_NAME,
      title: "Cut slow. Worn daily.",
      body: "Soft organic cotton, a considered fit, and finishes that stay honest after every wash.",
      ctaLabel: "Our story",
      ctaHref: "/about",
      imageUrl:
        "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=1920&q=80",
    },
    bestSellers: {
      title: "Best sellers",
      subtitle: "The pieces our community reaches for again and again.",
    },
    newArrivals: {
      title: "New arrivals",
      subtitle: "Fresh cuts and colors, just landed.",
    },
    categories: {
      title: "Shop by category",
      subtitle: "Curated collections for every part of your wardrobe.",
    },
  },
  contact: {
    title: "Contact us",
    subtitle:
      "Questions about sizing, orders, or wholesale? Our team typically responds within one business day.",
    email: "hello@premiumtees.com",
    phone: "",
    phoneHours: "Mon–Fri, 9am–5pm PT",
    studioLabel: "Studio",
    studioLine1: "Los Angeles, CA",
    studioLine2: DEFAULT_SITE_NAME,
    formTitle: "Send a message",
  },
  about: {
    eyebrow: "Our story",
    title: "Less noise. Better tees.",
    intro: DEFAULT_SITE_DESCRIPTION,
    storyTitle: "Crafted for everyday",
    storyParagraphs: [
      `${DEFAULT_SITE_NAME} started with a simple frustration: great-looking tees that fell apart after a few washes. We spent two years sourcing long-staple organic cotton, refining our patterns, and partnering with factories that share our standards for fair labor and low-impact production.`,
      "Every piece is designed in Los Angeles and built to become a staple — not a seasonal throwaway. Minimal branding, maximum quality.",
    ],
    valuesTitle: "What we stand for",
    values: [
      {
        title: "Premium materials",
        body: "Organic and long-staple cotton, low-impact dyes, and fabrics that soften with wear — never thin out.",
      },
      {
        title: "Intentional fit",
        body: "A modern tailored silhouette that works tucked or untucked, layered or alone.",
      },
      {
        title: "Transparent production",
        body: "We publish material and factory details for every product. No greenwashing, no shortcuts.",
      },
    ],
    ctaTitle: "Ready to feel the difference?",
    ctaSubtitle: "Explore the collection and find your next everyday essential.",
    ctaLabel: "Shop the collection",
    ctaHref: "/shop",
  },
  testimonials: {
    title: "What customers say",
    subtitle: "Real feedback from people who live in our tees.",
    items: TESTIMONIALS,
  },
  faq: {
    title: "Frequently asked questions",
    subtitle:
      "Everything you need to know about ordering, sizing, and caring for your tees.",
    items: FAQ_ITEMS,
  },
  instagram: {
    title: "On the gram",
    subtitle: "Tag us @premiumtees for a chance to be featured.",
    profileUrl: "https://instagram.com",
    images: INSTAGRAM_IMAGES,
  },
  newsletter: {
    title: "Join the club",
    subtitle:
      "New designs, club news, and a good excuse to take a break.",
  },
  theme: DEFAULT_THEME,
  savedThemes: [],
  footerCredit: {
    enabled: true,
    prefix: "Made with",
    name: "Anish",
    nameHref: "",
    heartColor: "#e11d48",
    textColor: "#a3a3a3",
    fontSizePx: 15,
    fontFamily: "Georgia, 'Times New Roman', serif",
    italic: true,
  },
};

function mergeContent<T extends object>(defaults: T, stored: unknown): T {
  if (!stored || typeof stored !== "object") return defaults;
  return { ...defaults, ...(stored as Partial<T>) };
}

function mergeNavLinks(stored: unknown, defaults: NavLinkItem[]): NavLinkItem[] {
  if (!Array.isArray(stored) || stored.length === 0) return defaults;
  const links = stored
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Partial<NavLinkItem>;
      const href = row.href?.trim() ?? "";
      const label = row.label?.trim() ?? "";
      if (!href || !label) return null;
      return { href, label };
    })
    .filter((item): item is NavLinkItem => item !== null);
  return links.length > 0 ? links : defaults;
}

function mergeHeader(stored: unknown): HeaderData {
  const defaults = DEFAULT_SITE_CONTENT.header;
  const partial =
    stored && typeof stored === "object" ? (stored as Partial<HeaderData>) : {};
  return {
    navLinks: mergeNavLinks(partial.navLinks, defaults.navLinks),
    logoImageUrl:
      typeof partial.logoImageUrl === "string" ? partial.logoImageUrl.trim() : "",
    logoImageAlt:
      typeof partial.logoImageAlt === "string"
        ? partial.logoImageAlt.trim()
        : defaults.logoImageAlt,
    helloBar: mergeHelloBar(partial.helloBar),
  };
}

function mergeFooter(stored: unknown): FooterData {
  const defaults = DEFAULT_SITE_CONTENT.footer;
  const partial =
    stored && typeof stored === "object" ? (stored as Partial<FooterData>) : {};
  const trustItems = Array.isArray(partial.trustItems)
    ? partial.trustItems
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const row = item as Partial<FooterTrustItem>;
          const title = row.title?.trim() ?? "";
          const subtitle = row.subtitle?.trim() ?? "";
          if (!title) return null;
          return { title, subtitle };
        })
        .filter((item): item is FooterTrustItem => item !== null)
    : defaults.trustItems;

  return {
    bannerImageUrl:
      typeof partial.bannerImageUrl === "string" && partial.bannerImageUrl.trim()
        ? partial.bannerImageUrl.trim()
        : defaults.bannerImageUrl,
    bannerImageAlt:
      typeof partial.bannerImageAlt === "string" && partial.bannerImageAlt.trim()
        ? partial.bannerImageAlt.trim()
        : defaults.bannerImageAlt,
    tagline:
      typeof partial.tagline === "string" && partial.tagline.trim()
        ? partial.tagline.trim()
        : defaults.tagline,
    trustItems: trustItems.length > 0 ? trustItems : defaults.trustItems,
    essentialLinks: mergeNavLinks(partial.essentialLinks, defaults.essentialLinks),
  };
}

function mergeFooterCredit(stored: unknown): FooterCreditData {
  const defaults = DEFAULT_SITE_CONTENT.footerCredit;
  const partial =
    stored && typeof stored === "object"
      ? (stored as Partial<FooterCreditData>)
      : {};
  return {
    enabled: partial.enabled ?? defaults.enabled,
    prefix: partial.prefix?.trim() || defaults.prefix,
    name: partial.name?.trim() || defaults.name,
    nameHref: typeof partial.nameHref === "string" ? partial.nameHref.trim() : "",
    heartColor: partial.heartColor || defaults.heartColor,
    textColor: partial.textColor || defaults.textColor,
    fontSizePx:
      typeof partial.fontSizePx === "number" && partial.fontSizePx > 0
        ? Math.min(48, Math.max(10, partial.fontSizePx))
        : defaults.fontSizePx,
    fontFamily: partial.fontFamily?.trim() || defaults.fontFamily,
    italic: partial.italic ?? defaults.italic,
  };
}

export async function getContentBlock<K extends ContentKey>(
  key: K
): Promise<AllSiteContent[K]> {
  try {
    const row = await prisma.siteContent.findUnique({ where: { key } });
    if (key === "theme") {
      return normalizeTheme(row?.data) as AllSiteContent[K];
    }
    if (key === "savedThemes") {
      return normalizeSavedThemes(row?.data) as AllSiteContent[K];
    }
    if (key === "home") {
      return mergeHome(row?.data) as AllSiteContent[K];
    }
    if (key === "footerCredit") {
      return mergeFooterCredit(row?.data) as AllSiteContent[K];
    }
    if (key === "header") {
      return mergeHeader(row?.data) as AllSiteContent[K];
    }
    if (key === "footer") {
      return mergeFooter(row?.data) as AllSiteContent[K];
    }
    return mergeContent(DEFAULT_SITE_CONTENT[key], row?.data) as AllSiteContent[K];
  } catch {
    return DEFAULT_SITE_CONTENT[key];
  }
}

function mergeHome(stored: unknown): HomeData {
  const partial =
    stored && typeof stored === "object" ? (stored as Partial<HomeData>) : {};
  const defaults = DEFAULT_SITE_CONTENT.home;
  const template = isHomeTemplateId(partial.template)
    ? partial.template
    : defaults.template;
  return {
    template,
    sections: normalizeHomeSections(partial.sections, template),
    marqueeItems:
      Array.isArray(partial.marqueeItems) && partial.marqueeItems.length > 0
        ? partial.marqueeItems.map(String)
        : defaults.marqueeItems,
    essentials: mergeContent(defaults.essentials, partial.essentials),
    story: mergeContent(defaults.story, partial.story),
    bestSellers: mergeContent(defaults.bestSellers, partial.bestSellers),
    newArrivals: mergeContent(defaults.newArrivals, partial.newArrivals),
    categories: mergeContent(defaults.categories, partial.categories),
  };
}

export async function getAllSiteContent(): Promise<AllSiteContent> {
  try {
    const rows = await prisma.siteContent.findMany();
    const byKey = Object.fromEntries(rows.map((r) => [r.key, r.data]));
    return {
      site: mergeContent(DEFAULT_SITE_CONTENT.site, byKey.site),
      header: mergeHeader(byKey.header),
      footer: mergeFooter(byKey.footer),
      hero: mergeContent(DEFAULT_SITE_CONTENT.hero, byKey.hero),
      home: mergeHome(byKey.home),
      about: mergeContent(DEFAULT_SITE_CONTENT.about, byKey.about),
      contact: mergeContent(DEFAULT_SITE_CONTENT.contact, byKey.contact),
      testimonials: mergeContent(DEFAULT_SITE_CONTENT.testimonials, byKey.testimonials),
      faq: mergeContent(DEFAULT_SITE_CONTENT.faq, byKey.faq),
      instagram: mergeContent(DEFAULT_SITE_CONTENT.instagram, byKey.instagram),
      newsletter: mergeContent(DEFAULT_SITE_CONTENT.newsletter, byKey.newsletter),
      theme: normalizeTheme(byKey.theme),
      savedThemes: normalizeSavedThemes(byKey.savedThemes),
      footerCredit: mergeFooterCredit(byKey.footerCredit),
    };
  } catch {
    return DEFAULT_SITE_CONTENT;
  }
}

export async function upsertContentBlock(key: ContentKey, data: unknown) {
  return prisma.siteContent.upsert({
    where: { key },
    create: { key, data: data as object },
    update: { data: data as object },
  });
}

export async function seedDefaultSiteContent() {
  for (const key of CONTENT_KEYS) {
    await prisma.siteContent.upsert({
      where: { key },
      create: { key, data: DEFAULT_SITE_CONTENT[key] },
      update: {},
    });
  }
}
