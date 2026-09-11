import { prisma } from "@/lib/prisma";

export const STORE_SETTINGS_KEY = "storeSettings";

export type StoreSettings = {
  /** When false, customers submit address/details without payment (lead capture). */
  paymentsEnabled: boolean;
  updatedAt: string;
};

const DEFAULT_STORE_SETTINGS: StoreSettings = {
  paymentsEnabled: false,
  updatedAt: new Date(0).toISOString(),
};

export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const row = await prisma.siteContent.findUnique({
      where: { key: STORE_SETTINGS_KEY },
    });
    if (!row?.data || typeof row.data !== "object") {
      return DEFAULT_STORE_SETTINGS;
    }
    const data = row.data as Partial<StoreSettings>;
    return {
      paymentsEnabled: data.paymentsEnabled ?? DEFAULT_STORE_SETTINGS.paymentsEnabled,
      updatedAt:
        typeof data.updatedAt === "string"
          ? data.updatedAt
          : DEFAULT_STORE_SETTINGS.updatedAt,
    };
  } catch {
    return DEFAULT_STORE_SETTINGS;
  }
}

export async function upsertStoreSettings(
  input: Pick<StoreSettings, "paymentsEnabled">
): Promise<StoreSettings> {
  const next: StoreSettings = {
    paymentsEnabled: input.paymentsEnabled,
    updatedAt: new Date().toISOString(),
  };

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
