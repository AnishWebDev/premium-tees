import { prisma } from "@/lib/prisma";
import {
  DEFAULT_AUDIENCE_SETTINGS,
  normalizeAudienceSettings,
  type AudienceSettings,
} from "@/lib/audience";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_METHODS } from "@/lib/constants";

export const STORE_SETTINGS_KEY = "storeSettings";

export type ShippingMethodSetting = {
  id: "standard" | "express" | "overnight";
  label: string;
  price: number;
  days: string;
};

export type StoreSettings = {
  paymentsEnabled: boolean;
  audiencesEnabled: AudienceSettings;
  shipping: {
    freeShippingThreshold: number;
    pincodeDeliveryDays: string;
    methods: ShippingMethodSetting[];
  };
  tax: {
    gstRate: number;
  };
  seo: {
    titleSuffix: string;
    keywords: string[];
    ogImageUrl: string;
    analyticsId: string;
  };
  announcement: {
    enabled: boolean;
    message: string;
    linkHref: string;
    linkLabel: string;
  };
  updatedAt: string;
};

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  paymentsEnabled: false,
  audiencesEnabled: DEFAULT_AUDIENCE_SETTINGS,
  shipping: {
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    pincodeDeliveryDays: "4–6 business days",
    methods: SHIPPING_METHODS.map((m) => ({ ...m })),
  },
  tax: { gstRate: 0.05 },
  seo: {
    titleSuffix: "Premium Essential Tees",
    keywords: [
      "premium t-shirts",
      "organic cotton tee",
      "minimal apparel",
      "essential wardrobe",
    ],
    ogImageUrl: "/og.jpg",
    analyticsId: "",
  },
  announcement: {
    enabled: false,
    message: "",
    linkHref: "",
    linkLabel: "",
  },
  updatedAt: new Date(0).toISOString(),
};

function normalizeShippingMethods(input: unknown): ShippingMethodSetting[] {
  if (!Array.isArray(input) || input.length === 0) {
    return DEFAULT_STORE_SETTINGS.shipping.methods;
  }
  const ids = new Set<string>();
  const methods: ShippingMethodSetting[] = [];
  for (const row of input) {
    if (!row || typeof row !== "object") continue;
    const item = row as Partial<ShippingMethodSetting>;
    const id = item.id;
    if (id !== "standard" && id !== "express" && id !== "overnight") continue;
    if (ids.has(id)) continue;
    ids.add(id);
    methods.push({
      id,
      label: typeof item.label === "string" && item.label.trim() ? item.label.trim() : id,
      price: typeof item.price === "number" && item.price >= 0 ? item.price : 0,
      days: typeof item.days === "string" && item.days.trim() ? item.days.trim() : "",
    });
  }
  return methods.length > 0 ? methods : DEFAULT_STORE_SETTINGS.shipping.methods;
}

export function normalizeStoreSettings(input: unknown): StoreSettings {
  const partial =
    input && typeof input === "object" ? (input as Partial<StoreSettings>) : {};
  const shippingPartial: Partial<StoreSettings["shipping"]> =
    partial.shipping && typeof partial.shipping === "object"
      ? partial.shipping
      : {};
  const taxPartial: Partial<StoreSettings["tax"]> =
    partial.tax && typeof partial.tax === "object" ? partial.tax : {};
  const seoPartial: Partial<StoreSettings["seo"]> =
    partial.seo && typeof partial.seo === "object" ? partial.seo : {};
  const announcementPartial: Partial<StoreSettings["announcement"]> =
    partial.announcement && typeof partial.announcement === "object"
      ? partial.announcement
      : {};

  return {
    paymentsEnabled: partial.paymentsEnabled ?? DEFAULT_STORE_SETTINGS.paymentsEnabled,
    audiencesEnabled: normalizeAudienceSettings(partial.audiencesEnabled),
    shipping: {
      freeShippingThreshold:
        typeof shippingPartial.freeShippingThreshold === "number" &&
        shippingPartial.freeShippingThreshold >= 0
          ? shippingPartial.freeShippingThreshold
          : DEFAULT_STORE_SETTINGS.shipping.freeShippingThreshold,
      pincodeDeliveryDays:
        typeof shippingPartial.pincodeDeliveryDays === "string" &&
        shippingPartial.pincodeDeliveryDays.trim()
          ? shippingPartial.pincodeDeliveryDays.trim()
          : DEFAULT_STORE_SETTINGS.shipping.pincodeDeliveryDays,
      methods: normalizeShippingMethods(shippingPartial.methods),
    },
    tax: {
      gstRate:
        typeof taxPartial.gstRate === "number" &&
        taxPartial.gstRate >= 0 &&
        taxPartial.gstRate <= 1
          ? taxPartial.gstRate
          : DEFAULT_STORE_SETTINGS.tax.gstRate,
    },
    seo: {
      titleSuffix:
        typeof seoPartial.titleSuffix === "string" && seoPartial.titleSuffix.trim()
          ? seoPartial.titleSuffix.trim()
          : DEFAULT_STORE_SETTINGS.seo.titleSuffix,
      keywords: Array.isArray(seoPartial.keywords)
        ? seoPartial.keywords.map(String).filter(Boolean)
        : DEFAULT_STORE_SETTINGS.seo.keywords,
      ogImageUrl:
        typeof seoPartial.ogImageUrl === "string" && seoPartial.ogImageUrl.trim()
          ? seoPartial.ogImageUrl.trim()
          : DEFAULT_STORE_SETTINGS.seo.ogImageUrl,
      analyticsId:
        typeof seoPartial.analyticsId === "string"
          ? seoPartial.analyticsId.trim()
          : DEFAULT_STORE_SETTINGS.seo.analyticsId,
    },
    announcement: {
      enabled: announcementPartial.enabled === true,
      message:
        typeof announcementPartial.message === "string"
          ? announcementPartial.message.trim()
          : "",
      linkHref:
        typeof announcementPartial.linkHref === "string"
          ? announcementPartial.linkHref.trim()
          : "",
      linkLabel:
        typeof announcementPartial.linkLabel === "string"
          ? announcementPartial.linkLabel.trim()
          : "",
    },
    updatedAt:
      typeof partial.updatedAt === "string"
        ? partial.updatedAt
        : DEFAULT_STORE_SETTINGS.updatedAt,
  };
}

export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const row = await prisma.siteContent.findUnique({
      where: { key: STORE_SETTINGS_KEY },
    });
    if (!row?.data) return DEFAULT_STORE_SETTINGS;
    return normalizeStoreSettings(row.data);
  } catch {
    return DEFAULT_STORE_SETTINGS;
  }
}

export async function upsertStoreSettings(
  input: Partial<Omit<StoreSettings, "updatedAt">>
): Promise<StoreSettings> {
  const current = await getStoreSettings();
  const next: StoreSettings = normalizeStoreSettings({
    ...current,
    ...input,
    shipping: { ...current.shipping, ...input.shipping },
    tax: { ...current.tax, ...input.tax },
    seo: { ...current.seo, ...input.seo },
    announcement: { ...current.announcement, ...input.announcement },
    updatedAt: new Date().toISOString(),
  });

  await prisma.siteContent.upsert({
    where: { key: STORE_SETTINGS_KEY },
    create: { key: STORE_SETTINGS_KEY, data: next },
    update: { data: next },
  });

  return next;
}

export function isLeadCaptureMode(settings: StoreSettings): boolean {
  return !settings.paymentsEnabled;
}
