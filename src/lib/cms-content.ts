import { prisma } from "@/lib/prisma";
import { DEFAULT_SITE_NAME } from "@/lib/site-defaults";

export const CMS_KEYS = [
  "collections",
  "legal",
  "storeCopy",
  "sizeGuide",
  "auth",
] as const;

export type CmsKey = (typeof CMS_KEYS)[number];

export type LegalSection = {
  heading: string;
  paragraphs: string[];
};

export type LegalPageData = {
  title: string;
  lastUpdated: string;
  contactEmail: string;
  sections: LegalSection[];
};

export type LegalData = {
  terms: LegalPageData;
  privacy: LegalPageData;
  shippingIntro: string;
  shippingSections: LegalSection[];
};

export type CollectionsPageData = {
  title: string;
  subtitle: string;
};

export type StoreCopyData = {
  shopEmptyTitle: string;
  shopEmptyDescription: string;
  cartEmptyTitle: string;
  cartEmptyDescription: string;
  notFoundTitle: string;
  notFoundDescription: string;
  /** Optional image shown above the 404 heading */
  notFoundImageUrl: string;
  notFoundImageAlt: string;
  /** Optional full-page background image */
  notFoundBackgroundImageUrl: string;
  checkoutSuccessLead: string;
  checkoutSuccessPaid: string;
};

/** Fields for the editable 404 page (Page content → Store copy → Empty states). */
export const NOT_FOUND_COPY_FIELDS = [
  "notFoundTitle",
  "notFoundDescription",
  "notFoundImageUrl",
  "notFoundImageAlt",
  "notFoundBackgroundImageUrl",
] as const satisfies readonly (keyof StoreCopyData)[];

export type SizeGuideRow = {
  size: string;
  chest: string;
  length: string;
};

export type SizeGuideData = {
  title: string;
  intro: string;
  rows: SizeGuideRow[];
  fitNote: string;
};

export type AuthCopyData = {
  loginTitle: string;
  loginSubtitle: string;
  registerTitle: string;
  registerSubtitle: string;
};

export const STORE_COPY_LABELS: Record<keyof StoreCopyData, string> = {
  shopEmptyTitle: "Shop empty title",
  shopEmptyDescription: "Shop empty description",
  cartEmptyTitle: "Cart empty title",
  cartEmptyDescription: "Cart empty description",
  notFoundTitle: "404 page title",
  notFoundDescription: "404 page description",
  notFoundImageUrl: "404 image above text (URL)",
  notFoundImageAlt: "404 image alt text",
  notFoundBackgroundImageUrl: "404 background image (URL)",
  checkoutSuccessLead: "Checkout success (lead capture)",
  checkoutSuccessPaid: "Checkout success (paid)",
};

export const AUTH_COPY_LABELS: Record<keyof AuthCopyData, string> = {
  loginTitle: "Login title",
  loginSubtitle: "Login subtitle",
  registerTitle: "Register title",
  registerSubtitle: "Register subtitle",
};

export type AllCmsContent = {
  collections: CollectionsPageData;
  legal: LegalData;
  storeCopy: StoreCopyData;
  sizeGuide: SizeGuideData;
  auth: AuthCopyData;
};

const DEFAULT_LEGAL: LegalData = {
  terms: {
    title: "Terms of Service",
    lastUpdated: "July 31, 2026",
    contactEmail: "legal@premiumtees.com",
    sections: [
      {
        heading: "Agreement",
        paragraphs: [
          `By accessing or using the ${DEFAULT_SITE_NAME} website, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.`,
        ],
      },
      {
        heading: "Products & pricing",
        paragraphs: [
          "We strive to display accurate product descriptions, images, and pricing. Prices are in INR and may change without notice. We reserve the right to limit quantities or refuse orders.",
        ],
      },
      {
        heading: "Orders & payment",
        paragraphs: [
          "When you place an order, you offer to purchase products subject to these terms. Payment is processed securely via Razorpay. We may cancel orders suspected of fraud or pricing errors.",
        ],
      },
      {
        heading: "Shipping & returns",
        paragraphs: [
          "Delivery timelines and shipping charges are shown at checkout. Returns are accepted within 30 days for unworn items with tags — see our FAQ and shipping page for details.",
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    lastUpdated: "July 31, 2026",
    contactEmail: "privacy@premiumtees.com",
    sections: [
      {
        heading: "Information we collect",
        paragraphs: [
          "We collect information you provide when creating an account, placing an order, or contacting us — including name, email, phone, and shipping address.",
        ],
      },
      {
        heading: "How we use information",
        paragraphs: [
          "We use your information to process orders, communicate about your purchases, improve our services, and — with your consent — send marketing emails.",
        ],
      },
      {
        heading: "Cookies & analytics",
        paragraphs: [
          "We use essential cookies for cart and authentication. If enabled in site settings, analytics help us understand how visitors use the store.",
        ],
      },
      {
        heading: "Your rights",
        paragraphs: [
          "You may request access, correction, or deletion of your personal data by contacting us at the email below.",
        ],
      },
    ],
  },
  shippingIntro:
    "We ship across India. Rates below apply at checkout; free standard shipping on orders over {threshold}.",
  shippingSections: [
    {
      heading: "Processing",
      paragraphs: ["Orders are processed within 1–2 business days before dispatch."],
    },
    {
      heading: "Returns",
      paragraphs: [
        "Unworn items with tags may be returned within 30 days. Start a return from your order history.",
      ],
    },
  ],
};

export const DEFAULT_CMS_CONTENT: AllCmsContent = {
  collections: {
    title: "Collections",
    subtitle: "Browse curated edits by category.",
  },
  legal: DEFAULT_LEGAL,
  storeCopy: {
    shopEmptyTitle: "No products found",
    shopEmptyDescription: "Try adjusting your filters or search term.",
    cartEmptyTitle: "Your cart is empty",
    cartEmptyDescription: "Add something you love — we will keep it here.",
    notFoundTitle: "Page not found",
    notFoundDescription: "The page you are looking for does not exist or has moved.",
    notFoundImageUrl: "",
    notFoundImageAlt: "",
    notFoundBackgroundImageUrl: "",
    checkoutSuccessLead:
      "Thanks — we received your details. Our team will reach out to confirm your order.",
    checkoutSuccessPaid: "Payment successful. We are preparing your order.",
  },
  sizeGuide: {
    title: "Size guide",
    intro: "Measurements in inches. Garment laid flat.",
    rows: [
      { size: "XS", chest: "18", length: "27" },
      { size: "S", chest: "19", length: "28" },
      { size: "M", chest: "20", length: "29" },
      { size: "L", chest: "21", length: "30" },
      { size: "XL", chest: "22", length: "31" },
      { size: "XXL", chest: "23", length: "32" },
    ],
    fitNote: "Between sizes? Size up for a relaxed fit.",
  },
  auth: {
    loginTitle: "Welcome back",
    loginSubtitle: "Sign in to your account to continue.",
    registerTitle: "Create an account",
    registerSubtitle: "Join us for faster checkout and order tracking.",
  },
};

function mergeContent<T extends object>(defaults: T, stored: unknown): T {
  if (!stored || typeof stored !== "object") return defaults;
  return { ...defaults, ...(stored as Partial<T>) };
}

function mergeLegal(stored: unknown): LegalData {
  const defaults = DEFAULT_CMS_CONTENT.legal;
  const partial = stored && typeof stored === "object" ? (stored as Partial<LegalData>) : {};
  const mergePage = (def: LegalPageData, src: unknown): LegalPageData => {
    const p = src && typeof src === "object" ? (src as Partial<LegalPageData>) : {};
    return {
      title: p.title?.trim() || def.title,
      lastUpdated: p.lastUpdated?.trim() || def.lastUpdated,
      contactEmail: p.contactEmail?.trim() || def.contactEmail,
      sections: Array.isArray(p.sections) && p.sections.length > 0
        ? p.sections
            .map((s) => {
              if (!s || typeof s !== "object") return null;
              const row = s as Partial<LegalSection>;
              const heading = row.heading?.trim() ?? "";
              const paragraphs = Array.isArray(row.paragraphs)
                ? row.paragraphs.map(String).filter(Boolean)
                : [];
              if (!heading || paragraphs.length === 0) return null;
              return { heading, paragraphs };
            })
            .filter((s): s is LegalSection => s !== null)
        : def.sections,
    };
  };
  return {
    terms: mergePage(defaults.terms, partial.terms),
    privacy: mergePage(defaults.privacy, partial.privacy),
    shippingIntro: partial.shippingIntro?.trim() || defaults.shippingIntro,
    shippingSections:
      Array.isArray(partial.shippingSections) && partial.shippingSections.length > 0
        ? partial.shippingSections
            .map((s) => {
              if (!s || typeof s !== "object") return null;
              const row = s as Partial<LegalSection>;
              const heading = row.heading?.trim() ?? "";
              const paragraphs = Array.isArray(row.paragraphs)
                ? row.paragraphs.map(String).filter(Boolean)
                : [];
              if (!heading || paragraphs.length === 0) return null;
              return { heading, paragraphs };
            })
            .filter((s): s is LegalSection => s !== null)
        : defaults.shippingSections,
  };
}

export async function getCmsBlock<K extends CmsKey>(key: K): Promise<AllCmsContent[K]> {
  try {
    const row = await prisma.siteContent.findUnique({ where: { key } });
    if (key === "legal") return mergeLegal(row?.data) as AllCmsContent[K];
    return mergeContent(DEFAULT_CMS_CONTENT[key], row?.data) as AllCmsContent[K];
  } catch {
    return DEFAULT_CMS_CONTENT[key];
  }
}

export async function getAllCmsContent(): Promise<AllCmsContent> {
  try {
    const rows = await prisma.siteContent.findMany({
      where: { key: { in: [...CMS_KEYS] } },
    });
    const byKey = Object.fromEntries(rows.map((r) => [r.key, r.data]));
    return {
      collections: mergeContent(DEFAULT_CMS_CONTENT.collections, byKey.collections),
      legal: mergeLegal(byKey.legal),
      storeCopy: mergeContent(DEFAULT_CMS_CONTENT.storeCopy, byKey.storeCopy),
      sizeGuide: mergeContent(DEFAULT_CMS_CONTENT.sizeGuide, byKey.sizeGuide),
      auth: mergeContent(DEFAULT_CMS_CONTENT.auth, byKey.auth),
    };
  } catch {
    return DEFAULT_CMS_CONTENT;
  }
}

export async function upsertCmsBlock(key: CmsKey, data: unknown) {
  return prisma.siteContent.upsert({
    where: { key },
    create: { key, data: data as object },
    update: { data: data as object },
  });
}
