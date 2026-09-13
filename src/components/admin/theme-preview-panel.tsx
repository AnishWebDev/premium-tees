"use client";

import type { ThemeData } from "@/lib/theme";
import { fontWeightToCss } from "@/lib/theme";
import { FONT_CSS_VAR } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type ThemePreviewPanelProps = {
  theme: ThemeData;
  className?: string;
};

function buttonRadiusPx(theme: ThemeData) {
  if (theme.buttonRadius === "pill") return 9999;
  if (theme.buttonRadius === "square") return 4;
  return 12;
}

function buttonStyles(theme: ThemeData, variant: "solid" | "outline" | "soft") {
  const radius = buttonRadiusPx(theme);
  const weight = Number(fontWeightToCss(theme.buttonWeight));

  if (variant === "outline") {
    return {
      background: "transparent",
      color: theme.accent,
      border: `1px solid ${theme.accent}`,
      borderRadius: radius,
      fontWeight: weight,
    };
  }
  if (variant === "soft") {
    return {
      background: theme.muted,
      color: theme.accent,
      border: `1px solid ${theme.muted}`,
      borderRadius: radius,
      fontWeight: weight,
    };
  }
  return {
    background: theme.accent,
    color: theme.accentForeground,
    border: `1px solid ${theme.accent}`,
    borderRadius: radius,
    fontWeight: weight,
  };
}

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
        textUnderlineOffset: 4,
        fontWeight: 500,
      };
  }
}

export function ThemePreviewPanel({ theme, className }: ThemePreviewPanelProps) {
  const sans =
    FONT_CSS_VAR[theme.fontSans] ?? `"${theme.fontSans}", system-ui, sans-serif`;
  const display =
    FONT_CSS_VAR[theme.fontDisplay] ??
    `"${theme.fontDisplay}", Georgia, serif`;

  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-sm font-medium text-neutral-950">Live preview</p>
      <div
        className="overflow-hidden rounded-xl border border-neutral-200 shadow-sm"
        style={{
          background: theme.background,
          color: theme.foreground,
          fontFamily: sans,
          fontWeight: Number(fontWeightToCss(theme.fontSansWeight)),
        }}
      >
        <div
          className="px-4 py-2 text-center text-xs font-medium"
          style={{
            background: theme.foreground,
            color: theme.background,
          }}
        >
          Promo hello bar sample
        </div>

        <div
          className="border-b px-4 py-3"
          style={{ borderColor: theme.border }}
        >
          <p
            className="text-lg"
            style={{
              fontFamily: display,
              fontWeight: Number(fontWeightToCss(theme.fontDisplayWeight)),
            }}
          >
            Display heading
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
            className="rounded-lg p-3 text-xs"
            style={{
              background: theme.muted,
              color: theme.mutedForeground,
            }}
          >
            Muted card / soft surface
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="px-4 py-2 text-xs"
              style={buttonStyles(theme, "solid")}
            >
              Primary
            </button>
            <button
              type="button"
              className="px-4 py-2 text-xs"
              style={buttonStyles(theme, "outline")}
            >
              Outline
            </button>
            <button
              type="button"
              className="px-4 py-2 text-xs"
              style={buttonStyles(theme, "soft")}
            >
              Soft
            </button>
          </div>

          <div
            className="inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium"
            style={{
              background: theme.accent,
              color: theme.accentForeground,
            }}
          >
            Accent badge
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
