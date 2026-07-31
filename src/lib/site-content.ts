import { prisma } from "@/lib/prisma";
import {
  FAQ_ITEMS,
  INSTAGRAM_IMAGES,
  SITE_DESCRIPTION,
  SITE_NAME,
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
import { DEFAULT_THEME, normalizeTheme, type ThemeData } from "@/lib/theme";

export const CONTENT_KEYS = [
  "site",
  "hero",
  "home",
  "about",
  "contact",
  "testimonials",
  "faq",
  "instagram",
  "newsletter",
  "theme",
  "footerCredit",
] as const;

export type ContentKey = (typeof CONTENT_KEYS)[number];

export type SiteData = {
  name: string;
  description: string;
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
  hero: HeroData;
  home: HomeData;
  about: AboutData;
  contact: ContactData;
  testimonials: TestimonialsData;
  faq: FaqData;
  instagram: InstagramData;
  newsletter: NewsletterData;
  theme: ThemeData;
  footerCredit: FooterCreditData;
};

export const DEFAULT_SITE_CONTENT: AllSiteContent = {
  site: {
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  hero: {
    brand: SITE_NAME,
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
      eyebrow: SITE_NAME,
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
    studioLine2: SITE_NAME,
    formTitle: "Send a message",
  },
  about: {
    eyebrow: "Our story",
    title: "Less noise. Better tees.",
    intro: SITE_DESCRIPTION,
    storyTitle: "Crafted for everyday",
    storyParagraphs: [
      `${SITE_NAME} started with a simple frustration: great-looking tees that fell apart after a few washes. We spent two years sourcing long-staple organic cotton, refining our patterns, and partnering with factories that share our standards for fair labor and low-impact production.`,
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
    title: "Stay in the loop",
    subtitle: "New drops, restocks, and fabric stories — delivered to your inbox.",
  },
  theme: DEFAULT_THEME,
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
    if (key === "home") {
      return mergeHome(row?.data) as AllSiteContent[K];
    }
    if (key === "footerCredit") {
      return mergeFooterCredit(row?.data) as AllSiteContent[K];
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
      hero: mergeContent(DEFAULT_SITE_CONTENT.hero, byKey.hero),
      home: mergeHome(byKey.home),
      about: mergeContent(DEFAULT_SITE_CONTENT.about, byKey.about),
      contact: mergeContent(DEFAULT_SITE_CONTENT.contact, byKey.contact),
      testimonials: mergeContent(DEFAULT_SITE_CONTENT.testimonials, byKey.testimonials),
      faq: mergeContent(DEFAULT_SITE_CONTENT.faq, byKey.faq),
      instagram: mergeContent(DEFAULT_SITE_CONTENT.instagram, byKey.instagram),
      newsletter: mergeContent(DEFAULT_SITE_CONTENT.newsletter, byKey.newsletter),
      theme: normalizeTheme(byKey.theme),
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
