export const AUDIENCE_IDS = ["men", "women", "girl", "boy"] as const;

export type AudienceId = (typeof AUDIENCE_IDS)[number];

export const AUDIENCE_LABELS: Record<AudienceId, string> = {
  men: "Men",
  women: "Women",
  girl: "Girls",
  boy: "Boys",
};

/** Kids age bands for Girls / Boys shop filters and product assignment. */
export const KIDS_AGE_IDS = ["2-4", "5-7", "8-10", "11-13"] as const;

export type KidsAgeId = (typeof KIDS_AGE_IDS)[number];

export const KIDS_AGE_LABELS: Record<KidsAgeId, string> = {
  "2-4": "2–4 years",
  "5-7": "5–7 years",
  "8-10": "8–10 years",
  "11-13": "11–13 years",
};

export const DEFAULT_AUDIENCE: AudienceId = "men";

export type AudienceSettings = {
  women: boolean;
  girl: boolean;
  boy: boolean;
};

export const DEFAULT_AUDIENCE_SETTINGS: AudienceSettings = {
  women: false,
  girl: false,
  boy: false,
};

export function isAudienceId(value: string): value is AudienceId {
  return (AUDIENCE_IDS as readonly string[]).includes(value);
}

export function isKidsAudience(audience: AudienceId): boolean {
  return audience === "girl" || audience === "boy";
}

export function isKidsAgeId(value: string): value is KidsAgeId {
  return (KIDS_AGE_IDS as readonly string[]).includes(value);
}

export function toPrismaKidsAge(id: KidsAgeId): "AGE_2_4" | "AGE_5_7" | "AGE_8_10" | "AGE_11_13" {
  const map: Record<KidsAgeId, "AGE_2_4" | "AGE_5_7" | "AGE_8_10" | "AGE_11_13"> = {
    "2-4": "AGE_2_4",
    "5-7": "AGE_5_7",
    "8-10": "AGE_8_10",
    "11-13": "AGE_11_13",
  };
  return map[id];
}

export function fromPrismaKidsAge(value: string | null | undefined): KidsAgeId | null {
  if (!value) return null;
  const map: Record<string, KidsAgeId> = {
    AGE_2_4: "2-4",
    AGE_5_7: "5-7",
    AGE_8_10: "8-10",
    AGE_11_13: "11-13",
  };
  return map[value] ?? null;
}

/** Valid kids age from URL when browsing Girls / Boys; null means all ages. */
export function resolveKidsAge(
  param: string | undefined,
  audience: AudienceId
): KidsAgeId | null {
  if (!isKidsAudience(audience)) return null;
  const normalized = param?.trim();
  if (normalized && isKidsAgeId(normalized)) return normalized;
  return null;
}

export function toPrismaAudience(id: AudienceId): "MEN" | "WOMEN" | "GIRL" | "BOY" {
  return id.toUpperCase() as "MEN" | "WOMEN" | "GIRL" | "BOY";
}

export function fromPrismaAudience(value: string): AudienceId {
  const normalized = value.toLowerCase();
  return isAudienceId(normalized) ? normalized : DEFAULT_AUDIENCE;
}

export function getEnabledAudiences(settings: AudienceSettings): AudienceId[] {
  const enabled: AudienceId[] = [DEFAULT_AUDIENCE];
  if (settings.women) enabled.push("women");
  if (settings.girl) enabled.push("girl");
  if (settings.boy) enabled.push("boy");
  return enabled;
}

export function normalizeAudienceSettings(input: unknown): AudienceSettings {
  const partial =
    input && typeof input === "object" ? (input as Partial<AudienceSettings>) : {};
  return {
    women: partial.women === true,
    girl: partial.girl === true,
    boy: partial.boy === true,
  };
}

/** Pick a valid shop filter audience from the URL, defaulting to Men. */
export function resolveShopAudience(
  param: string | undefined,
  enabled: AudienceId[]
): AudienceId {
  const normalized = param?.trim().toLowerCase();
  if (normalized && isAudienceId(normalized) && enabled.includes(normalized)) {
    return normalized;
  }
  return DEFAULT_AUDIENCE;
}
