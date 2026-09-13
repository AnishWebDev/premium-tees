import { fontFamilyStack } from "@/lib/fonts";
import type { StoreCopyData } from "@/lib/cms-content";

export const NOT_FOUND_FONT_SIZE_OPTIONS = [
  { value: "", label: "Theme default" },
  { value: "xs", label: "Extra small" },
  { value: "sm", label: "Small" },
  { value: "base", label: "Base" },
  { value: "lg", label: "Large" },
  { value: "xl", label: "Extra large" },
  { value: "2xl", label: "2× large" },
  { value: "3xl", label: "3× large" },
  { value: "4xl", label: "4× large" },
  { value: "5xl", label: "5× large" },
] as const;

const FONT_SIZE_CLASS: Record<string, string> = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  "4xl": "text-4xl",
  "5xl": "text-5xl",
};

type TextPart = "code" | "title" | "description";

const DEFAULT_CLASSES: Record<TextPart, string> = {
  code: "text-xs uppercase tracking-[0.2em] text-[var(--muted-foreground)]",
  title:
    "font-display text-4xl font-semibold tracking-tight text-[var(--foreground)]",
  description: "text-sm leading-relaxed text-[var(--muted-foreground)]",
};

const DEFAULT_FONT_FALLBACK: Record<TextPart, string> = {
  code: "system-ui, sans-serif",
  title: "Georgia, serif",
  description: "system-ui, sans-serif",
};

export function notFoundPartStyle(
  part: TextPart,
  copy: StoreCopyData
): { className: string; style: import("react").CSSProperties } {
  const colorKeys = {
    code: "notFoundCodeColor",
    title: "notFoundTitleColor",
    description: "notFoundDescriptionColor",
  } as const satisfies Record<TextPart, keyof StoreCopyData>;
  const sizeKeys = {
    code: "notFoundCodeFontSize",
    title: "notFoundTitleFontSize",
    description: "notFoundDescriptionFontSize",
  } as const satisfies Record<TextPart, keyof StoreCopyData>;
  const familyKeys = {
    code: "notFoundCodeFontFamily",
    title: "notFoundTitleFontFamily",
    description: "notFoundDescriptionFontFamily",
  } as const satisfies Record<TextPart, keyof StoreCopyData>;

  const color = copy[colorKeys[part]].trim();
  const size = copy[sizeKeys[part]].trim();
  const family = copy[familyKeys[part]].trim();

  const sizeClass = size ? FONT_SIZE_CLASS[size] : "";
  const baseClass = DEFAULT_CLASSES[part];

  const className = [baseClass, sizeClass].filter(Boolean).join(" ");

  const style: import("react").CSSProperties = {};
  if (color) style.color = color;
  if (family) {
    style.fontFamily = fontFamilyStack(family, DEFAULT_FONT_FALLBACK[part]);
  }

  return { className, style };
}
