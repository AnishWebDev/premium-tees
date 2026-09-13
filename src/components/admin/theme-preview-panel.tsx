"use client";

import type { ThemeData } from "@/lib/theme";
import { fontWeightToCss, themeButtonTokens } from "@/lib/theme";
import { FONT_CSS_VAR } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type ThemePreviewPanelProps = {
  theme: ThemeData;
  className?: string;
};

function linkStyles(theme: ThemeData): React.CSSProperties {
  switch (theme.linkStyle) {
    case "accent":
      return { color: theme.accent, textDecoration: "none", fontWeight: 500 };
    case "subtle":
      return {
        color: theme.mutedForeground,
        textDecoration: "none",
        fontWeight: 400,
      };
    case "bold":
      return { color: theme.foreground, textDecoration: "none", fontWeight: 600 };
    default:
      return {
        color: theme.foreground,
        textDecoration: "underline",
        fontWeight: 500,
      };
  }
}

function themeVarStyle(theme: ThemeData): React.CSSProperties {
  const tokens = themeButtonTokens(theme);
  const radius =
    theme.buttonRadius === "pill"
      ? "9999px"
      : theme.buttonRadius === "square"
        ? "0.25rem"
        : "0.75rem";
  return {
    ["--background" as string]: theme.background,
    ["--foreground" as string]: theme.foreground,
    ["--muted" as string]: theme.muted,
    ["--muted-foreground" as string]: theme.mutedForeground,
    ["--border" as string]: theme.border,
    ["--accent" as string]: theme.accent,
    ["--accent-foreground" as string]: theme.accentForeground,
    ["--button-bg" as string]: tokens.bg,
    ["--button-fg" as string]: tokens.fg,
    ["--button-border" as string]: tokens.border,
    ["--button-hover-bg" as string]: tokens.hoverBg,
    ["--button-hover-fg" as string]: tokens.hoverFg,
    ["--button-hover-border" as string]: tokens.hoverBorder,
    ["--button-radius" as string]: radius,
    ["--button-weight" as string]: fontWeightToCss(theme.buttonWeight),
  };
}

export function ThemePreviewPanel({ theme, className }: ThemePreviewPanelProps) {
  const sans =
    FONT_CSS_VAR[theme.fontSans] ?? `"${theme.fontSans}", system-ui, sans-serif`;
  const display =
    FONT_CSS_VAR[theme.fontDisplay] ??
    `"${theme.fontDisplay}", Georgia, serif`;

  const fillLabel =
    theme.buttonStyle === "outline"
      ? "Outline fill"
      : theme.buttonStyle === "soft"
        ? "Soft fill"
        : "Solid fill";

  return (
    <div className={cn("sticky top-24", className)}>
      <div
        className="overflow-hidden rounded-xl border border-neutral-200 shadow-sm"
        style={{
          background: theme.background,
          color: theme.foreground,
          fontFamily: sans,
          fontWeight: Number(fontWeightToCss(theme.fontSansWeight)),
          ...themeVarStyle(theme),
        }}
      >
        <div
          className="px-4 py-3 text-xs font-medium uppercase tracking-wider"
          style={{
            background: theme.foreground,
            color: theme.background,
          }}
        >
          Live preview
        </div>

        <div
          className="border-b px-4 py-5"
          style={{ borderColor: theme.border }}
        >
          <p
            className="font-display text-2xl"
            style={{
              fontFamily: display,
              fontWeight: Number(fontWeightToCss(theme.fontDisplayWeight)),
            }}
          >
            Headline
          </p>
          <p className="mt-1 text-xs" style={{ color: theme.mutedForeground }}>
            Body copy with{" "}
            <a href="#preview" style={linkStyles(theme)}>
              sample link
            </a>
            .
          </p>
        </div>

        <div className="space-y-3 p-4">
          <div
            className="surface-muted rounded-lg bg-[var(--muted)] p-3"
            style={themeVarStyle(theme)}
          >
            <p className="text-xs text-[var(--muted-foreground)]">
              Secondary
            </p>
            <Button type="button" size="sm" className="mt-3">
              Primary on secondary
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" size="sm">
              {fillLabel}
            </Button>
            <Button type="button" size="sm" variant="outline">
              Outline variant
            </Button>
          </div>

          <div
            className="inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium"
            style={{
              background: theme.accent,
              color: theme.accentForeground,
            }}
          >
            Link/Button badge
          </div>

          <div
            className="h-8 rounded-md border"
            style={{ borderColor: theme.border }}
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}
