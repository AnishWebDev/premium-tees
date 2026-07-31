import { prisma } from "@/lib/prisma";
import {
  getContentBlock,
  upsertContentBlock,
  type HomeData,
} from "@/lib/site-content";
import {
  isHomeTemplateId,
  type HomeTemplateId,
} from "@/lib/home-templates";
import { defaultSectionsForTemplate } from "@/lib/home-sections";
import { DEFAULT_THEME, normalizeTheme, type ThemeData } from "@/lib/theme";

/** Stored separately from live content — SuperAdmin style pack. */
export const STYLE_DEFAULTS_KEY = "styleDefaults";

export type StyleDefaults = {
  theme: ThemeData;
  homeTemplate: HomeTemplateId;
  updatedAt: string;
};

export async function getStyleDefaults(): Promise<StyleDefaults | null> {
  try {
    const row = await prisma.siteContent.findUnique({
      where: { key: STYLE_DEFAULTS_KEY },
    });
    if (!row?.data || typeof row.data !== "object") return null;
    const data = row.data as Partial<StyleDefaults>;
    if (!isHomeTemplateId(data.homeTemplate)) return null;
    return {
      theme: normalizeTheme(data.theme),
      homeTemplate: data.homeTemplate,
      updatedAt:
        typeof data.updatedAt === "string"
          ? data.updatedAt
          : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export async function upsertStyleDefaults(
  input: Partial<Pick<StyleDefaults, "theme" | "homeTemplate">>
): Promise<StyleDefaults> {
  const existing = await getStyleDefaults();
  const liveTheme = await getContentBlock("theme");
  const liveHome = await getContentBlock("home");

  const next: StyleDefaults = {
    theme: normalizeTheme(input.theme ?? existing?.theme ?? liveTheme),
    homeTemplate: isHomeTemplateId(input.homeTemplate)
      ? input.homeTemplate
      : existing?.homeTemplate ?? liveHome.template,
    updatedAt: new Date().toISOString(),
  };

  await prisma.siteContent.upsert({
    where: { key: STYLE_DEFAULTS_KEY },
    create: { key: STYLE_DEFAULTS_KEY, data: next },
    update: { data: next },
  });

  return next;
}

/** Apply SuperAdmin defaults to live theme + homepage template. */
export async function applyStyleDefaults(): Promise<StyleDefaults> {
  const defaults = await getStyleDefaults();
  if (!defaults) {
    throw new Error("No SuperAdmin style defaults have been saved yet");
  }

  await upsertContentBlock("theme", defaults.theme);

  const home = await getContentBlock("home");
  const nextHome: HomeData = {
    ...home,
    template: defaults.homeTemplate,
    sections: defaultSectionsForTemplate(defaults.homeTemplate),
  };
  await upsertContentBlock("home", nextHome);

  return defaults;
}

export function fallbackStyleDefaults(): StyleDefaults {
  return {
    theme: DEFAULT_THEME,
    homeTemplate: "parallax",
    updatedAt: new Date(0).toISOString(),
  };
}
