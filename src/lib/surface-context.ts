import { cn } from "@/lib/utils";

/** CMS / component background style keys that need contrasting buttons. */
export type SurfaceBgStyle = "theme" | "muted" | "accent" | "custom" | string;

/** Class that scopes button contrast overrides (see globals.css). */
export function surfaceContextClass(
  bgStyle?: SurfaceBgStyle,
  backgroundColor?: string
): string {
  if (backgroundColor?.trim()) return "";
  switch (bgStyle) {
    case "muted":
      return "surface-muted";
    case "accent":
      return "surface-accent";
    default:
      return "";
  }
}

/** Section band background + surface context for gallery-style blocks. */
export function galleryBandClass(
  bgStyle?: string,
  backgroundColor?: string
): string {
  if (backgroundColor?.trim()) return "";
  const surface = surfaceContextClass(bgStyle);
  switch (bgStyle) {
    case "muted":
      return cn(surface, "bg-[var(--muted)]/40");
    case "accent":
      return cn(surface, "bg-[var(--accent)]/10");
    default:
      return "bg-[var(--background)]";
  }
}
