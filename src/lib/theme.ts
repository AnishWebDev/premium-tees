import { fontFamilyStack } from "@/lib/fonts";

export type ButtonRadius = "pill" | "rounded" | "square";
export type ButtonStyle = "solid" | "outline" | "soft";
export type ButtonWeight = "normal" | "medium" | "semibold";
export type LinkStyle = "underline" | "accent" | "subtle" | "bold";

export type ThemeData = {
  presetId: string;
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  accent: string;
  accentForeground: string;
  ring: string;
  fontSans: string;
  fontDisplay: string;
  buttonRadius: ButtonRadius;
  buttonStyle: ButtonStyle;
  buttonWeight: ButtonWeight;
  linkStyle: LinkStyle;
};

export const DEFAULT_THEME: ThemeData = {
  presetId: "studio",
  background: "#fafafa",
  foreground: "#0a0a0a",
  muted: "#f4f4f5",
  mutedForeground: "#71717a",
  border: "#e4e4e7",
  accent: "#18181b",
  accentForeground: "#fafafa",
  ring: "#0a0a0a",
  fontSans: "DM Sans",
  fontDisplay: "Instrument Serif",
  buttonRadius: "pill",
  buttonStyle: "solid",
  buttonWeight: "medium",
  linkStyle: "underline",
};

export type ThemePreset = {
  id: string;
  name: string;
  description: string;
  theme: Omit<ThemeData, "presetId">;
};

/** Curated full-site looks. Avoids purple / cream-terracotta / newspaper defaults. */
export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "studio",
    name: "Studio",
    description: "Clean neutrals with soft serif headlines",
    theme: {
      background: "#fafafa",
      foreground: "#0a0a0a",
      muted: "#f4f4f5",
      mutedForeground: "#71717a",
      border: "#e4e4e7",
      accent: "#18181b",
      accentForeground: "#fafafa",
      ring: "#0a0a0a",
      fontSans: "DM Sans",
      fontDisplay: "Instrument Serif",
      buttonRadius: "pill",
      buttonStyle: "solid",
      buttonWeight: "medium",
      linkStyle: "underline",
    },
  },
  {
    id: "editorial",
    name: "Editorial",
    description: "Sharp contrast, classic display type",
    theme: {
      background: "#ffffff",
      foreground: "#111111",
      muted: "#f3f3f3",
      mutedForeground: "#5c5c5c",
      border: "#d4d4d4",
      accent: "#111111",
      accentForeground: "#ffffff",
      ring: "#111111",
      fontSans: "Libre Baskerville",
      fontDisplay: "Playfair Display",
      buttonRadius: "square",
      buttonStyle: "outline",
      buttonWeight: "semibold",
      linkStyle: "bold",
    },
  },
  {
    id: "slate",
    name: "Slate",
    description: "Cool blue-gray accent, modern sans",
    theme: {
      background: "#f8fafc",
      foreground: "#0f172a",
      muted: "#e2e8f0",
      mutedForeground: "#64748b",
      border: "#cbd5e1",
      accent: "#334155",
      accentForeground: "#f8fafc",
      ring: "#334155",
      fontSans: "Manrope",
      fontDisplay: "Space Grotesk",
      buttonRadius: "rounded",
      buttonStyle: "solid",
      buttonWeight: "semibold",
      linkStyle: "accent",
    },
  },
  {
    id: "olive",
    name: "Olive",
    description: "Earthy green accent on warm stone",
    theme: {
      background: "#f6f4ef",
      foreground: "#1c1917",
      muted: "#ebe6dc",
      mutedForeground: "#78716c",
      border: "#d6d0c4",
      accent: "#3f4a2f",
      accentForeground: "#f6f4ef",
      ring: "#3f4a2f",
      fontSans: "Outfit",
      fontDisplay: "Fraunces",
      buttonRadius: "rounded",
      buttonStyle: "soft",
      buttonWeight: "medium",
      linkStyle: "accent",
    },
  },
  {
    id: "noir",
    name: "Noir",
    description: "Dark storefront with bright type",
    theme: {
      background: "#0c0c0c",
      foreground: "#f5f5f5",
      muted: "#1a1a1a",
      mutedForeground: "#a3a3a3",
      border: "#2e2e2e",
      accent: "#f5f5f5",
      accentForeground: "#0c0c0c",
      ring: "#f5f5f5",
      fontSans: "Plus Jakarta Sans",
      fontDisplay: "Bebas Neue",
      buttonRadius: "square",
      buttonStyle: "solid",
      buttonWeight: "semibold",
      linkStyle: "subtle",
    },
  },
  {
    id: "ink-gold",
    name: "Ink & Gold",
    description: "Black ink with muted gold accents",
    theme: {
      background: "#faf9f6",
      foreground: "#141414",
      muted: "#f0ebe3",
      mutedForeground: "#6b6560",
      border: "#ddd5c8",
      accent: "#8a7340",
      accentForeground: "#faf9f6",
      ring: "#8a7340",
      fontSans: "Raleway",
      fontDisplay: "Cormorant Garamond",
      buttonRadius: "pill",
      buttonStyle: "solid",
      buttonWeight: "medium",
      linkStyle: "underline",
    },
  },
];

/**
 * Fonts shown in Admin → Settings → Site style.
 * Must match keys in FONT_CSS_VAR (`src/lib/fonts.ts`).
 */
export const FONT_CATALOG = [
  { name: "DM Sans", category: "sans" },
  { name: "Inter", category: "sans" },
  { name: "Manrope", category: "sans" },
  { name: "Space Grotesk", category: "sans" },
  { name: "Outfit", category: "sans" },
  { name: "Plus Jakarta Sans", category: "sans" },
  { name: "Roboto", category: "sans" },
  { name: "Open Sans", category: "sans" },
  { name: "Montserrat", category: "sans" },
  { name: "Poppins", category: "sans" },
  { name: "Raleway", category: "sans" },
  { name: "Nunito", category: "sans" },
  { name: "Instrument Serif", category: "serif" },
  { name: "Playfair Display", category: "serif" },
  { name: "Libre Baskerville", category: "serif" },
  { name: "Cormorant Garamond", category: "serif" },
  { name: "Fraunces", category: "serif" },
  { name: "Lora", category: "serif" },
  { name: "Merriweather", category: "serif" },
  { name: "Bebas Neue", category: "display" },
] as const;

export const FONT_OPTIONS = FONT_CATALOG.map((f) => f.name);

export function normalizeTheme(input: unknown): ThemeData {
  const partial =
    input && typeof input === "object" ? (input as Partial<ThemeData>) : {};
  return {
    ...DEFAULT_THEME,
    ...partial,
    presetId: partial.presetId || "custom",
    buttonRadius: partial.buttonRadius ?? DEFAULT_THEME.buttonRadius,
    buttonStyle: partial.buttonStyle ?? DEFAULT_THEME.buttonStyle,
    buttonWeight: partial.buttonWeight ?? DEFAULT_THEME.buttonWeight,
    linkStyle: partial.linkStyle ?? DEFAULT_THEME.linkStyle,
  };
}

export function themeFromPreset(presetId: string): ThemeData | null {
  const preset = THEME_PRESETS.find((p) => p.id === presetId);
  if (!preset) return null;
  return { presetId: preset.id, ...preset.theme };
}

type ButtonSurface = {
  bg: string;
  fg: string;
  border: string;
  hoverBg: string;
  hoverFg: string;
  hoverBorder: string;
};

function buttonSurface(theme: ThemeData): ButtonSurface {
  if (theme.buttonStyle === "outline") {
    const hoverBg = `color-mix(in srgb, ${theme.accent} 18%, ${theme.background})`;
    return {
      bg: "transparent",
      fg: theme.accent,
      border: theme.accent,
      hoverBg,
      hoverFg: theme.accent,
      hoverBorder: theme.accent,
    };
  }
  if (theme.buttonStyle === "soft") {
    const hoverBg = `color-mix(in srgb, ${theme.accent} 32%, ${theme.muted})`;
    return {
      bg: theme.muted,
      fg: theme.accent,
      border: theme.muted,
      hoverBg,
      hoverFg: theme.accent,
      hoverBorder: hoverBg,
    };
  }
  // Solid: lighten toward white so near-black accents clearly shift on hover
  const hoverBg = `color-mix(in srgb, ${theme.accent} 48%, white)`;
  return {
    bg: theme.accent,
    fg: theme.accentForeground,
    border: theme.accent,
    hoverBg,
    hoverFg: theme.accentForeground,
    hoverBorder: hoverBg,
  };
}

function linkTokens(theme: ThemeData) {
  switch (theme.linkStyle) {
    case "accent":
      return {
        color: theme.accent,
        hover: theme.foreground,
        decoration: "none",
        hoverDecoration: "underline",
        weight: "500",
      };
    case "subtle":
      return {
        color: theme.mutedForeground,
        hover: theme.foreground,
        decoration: "none",
        hoverDecoration: "underline",
        weight: "400",
      };
    case "bold":
      return {
        color: theme.foreground,
        hover: theme.accent,
        decoration: "none",
        hoverDecoration: "underline",
        weight: "600",
      };
    case "underline":
    default:
      return {
        color: theme.foreground,
        hover: theme.accent,
        decoration: "underline",
        hoverDecoration: "underline",
        weight: "500",
      };
  }
}

export function themeToCssVariables(theme: ThemeData) {
  const normalized = normalizeTheme(theme);
  const radius =
    normalized.buttonRadius === "pill"
      ? "9999px"
      : normalized.buttonRadius === "square"
        ? "0.25rem"
        : "0.75rem";
  const weight =
    normalized.buttonWeight === "semibold"
      ? "600"
      : normalized.buttonWeight === "normal"
        ? "400"
        : "500";
  const button = buttonSurface(normalized);
  const link = linkTokens(normalized);

  const sans = fontFamilyStack(normalized.fontSans, "system-ui, sans-serif");
  const display = fontFamilyStack(normalized.fontDisplay, "Georgia, serif");

  return `
:root {
  --background: ${normalized.background};
  --foreground: ${normalized.foreground};
  --muted: ${normalized.muted};
  --muted-foreground: ${normalized.mutedForeground};
  --border: ${normalized.border};
  --accent: ${normalized.accent};
  --accent-foreground: ${normalized.accentForeground};
  --ring: ${normalized.ring};
  --button-radius: ${radius};
  --button-bg: ${button.bg};
  --button-fg: ${button.fg};
  --button-border: ${button.border};
  --button-hover-bg: ${button.hoverBg};
  --button-hover-fg: ${button.hoverFg};
  --button-hover-border: ${button.hoverBorder};
  --button-weight: ${weight};
  --link-color: ${link.color};
  --link-hover-color: ${link.hover};
  --link-decoration: ${link.decoration};
  --link-decoration-hover: ${link.hoverDecoration};
  --link-weight: ${link.weight};
  --font-sans-family: ${sans};
  --font-display-family: ${display};
  color-scheme: light;
}
.dark {
  --background: ${normalized.foreground};
  --foreground: ${normalized.background};
  --muted: color-mix(in srgb, ${normalized.foreground} 88%, ${normalized.background});
  --muted-foreground: color-mix(in srgb, ${normalized.background} 72%, ${normalized.mutedForeground});
  --border: color-mix(in srgb, ${normalized.foreground} 78%, ${normalized.background});
  --accent: ${normalized.background};
  --accent-foreground: ${normalized.foreground};
  --ring: ${normalized.background};
  --button-bg: ${
    normalized.buttonStyle === "outline"
      ? "transparent"
      : normalized.buttonStyle === "soft"
        ? `color-mix(in srgb, ${normalized.foreground} 88%, ${normalized.background})`
        : normalized.background
  };
  --button-fg: ${
    normalized.buttonStyle === "outline" || normalized.buttonStyle === "soft"
      ? normalized.background
      : normalized.foreground
  };
  --button-border: ${
    normalized.buttonStyle === "outline"
      ? normalized.background
      : normalized.buttonStyle === "soft"
        ? `color-mix(in srgb, ${normalized.foreground} 88%, ${normalized.background})`
        : normalized.background
  };
  --button-hover-bg: ${
    normalized.buttonStyle === "outline"
      ? `color-mix(in srgb, ${normalized.background} 22%, ${normalized.foreground})`
      : normalized.buttonStyle === "soft"
        ? `color-mix(in srgb, ${normalized.background} 38%, ${normalized.foreground})`
        : // Light fill on dark page → clearly darker on hover
          `color-mix(in srgb, ${normalized.background} 52%, black)`
  };
  --button-hover-fg: ${
    normalized.buttonStyle === "outline" || normalized.buttonStyle === "soft"
      ? normalized.background
      : normalized.foreground
  };
  --button-hover-border: ${
    normalized.buttonStyle === "outline"
      ? normalized.background
      : normalized.buttonStyle === "soft"
        ? `color-mix(in srgb, ${normalized.background} 38%, ${normalized.foreground})`
        : `color-mix(in srgb, ${normalized.background} 52%, black)`
  };
  --link-color: ${normalized.background};
  --link-hover-color: ${normalized.muted};
  --link-decoration: ${link.decoration};
  --link-decoration-hover: ${link.hoverDecoration};
  --link-weight: ${link.weight};
  color-scheme: dark;
}
`.trim();
}
