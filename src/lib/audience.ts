export const AUDIENCE_IDS = ["men", "women", "girl", "boy"] as const;

export type AudienceId = (typeof AUDIENCE_IDS)[number];

export const AUDIENCE_LABELS: Record<AudienceId, string> = {
  men: "Men",
  women: "Women",
  girl: "Girl",
  boy: "Boy",
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
