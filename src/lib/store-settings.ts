import { prisma } from "@/lib/prisma";
import {
  DEFAULT_AUDIENCE_SETTINGS,
  normalizeAudienceSettings,
  type AudienceSettings,
} from "@/lib/audience";

export const STORE_SETTINGS_KEY = "storeSettings";

export type StoreSettings = {
  /** When false, customers submit address/details without payment (lead capture). */
  paymentsEnabled: boolean;
  /** SuperAdmin toggles — Men is always available in the shop filter. */
  audiencesEnabled: AudienceSettings;
  updatedAt: string;
};

const DEFAULT_STORE_SETTINGS: StoreSettings = {
  paymentsEnabled: false,
  audiencesEnabled: DEFAULT_AUDIENCE_SETTINGS,
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
      audiencesEnabled: normalizeAudienceSettings(data.audiencesEnabled),
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
  input: Partial<Pick<StoreSettings, "paymentsEnabled" | "audiencesEnabled">>
): Promise<StoreSettings> {
  const current = await getStoreSettings();
  const next: StoreSettings = {
    paymentsEnabled: input.paymentsEnabled ?? current.paymentsEnabled,
    audiencesEnabled: input.audiencesEnabled ?? current.audiencesEnabled,
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
