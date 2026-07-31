import { cn } from "@/lib/utils";
import type { HomeSectionProps } from "@/lib/home-sections";

export type SpacingSize = "default" | "none" | "sm" | "md" | "lg";

export const SPACING_SIZE_OPTIONS: { value: SpacingSize; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "none", label: "None" },
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
];

const AXIS: Record<
  "pt" | "pb" | "pl" | "pr",
  Record<Exclude<SpacingSize, "default">, string>
> = {
  pt: {
    none: "pt-0",
    sm: "pt-4 sm:pt-6",
    md: "pt-10 sm:pt-14",
    lg: "pt-16 sm:pt-20 lg:pt-28",
  },
  pb: {
    none: "pb-0",
    sm: "pb-4 sm:pb-6",
    md: "pb-10 sm:pb-14",
    lg: "pb-16 sm:pb-20 lg:pb-28",
  },
  pl: {
    none: "pl-0",
    sm: "pl-3 sm:pl-4",
    md: "pl-5 sm:pl-8",
    lg: "pl-8 sm:pl-12",
  },
  pr: {
    none: "pr-0",
    sm: "pr-3 sm:pr-4",
    md: "pr-5 sm:pr-8",
    lg: "pr-8 sm:pr-12",
  },
};

function resolveSize(value?: string): SpacingSize {
  if (value === "none" || value === "sm" || value === "md" || value === "lg") {
    return value;
  }
  return "default";
}

function axisClass(
  axis: "pt" | "pb" | "pl" | "pr",
  value?: string
): string | undefined {
  const size = resolveSize(value);
  if (size === "default") return undefined;
  return AXIS[axis][size];
}

/** Outer spacing classes from CMS padding* props. */
export function sectionSpacingClass(props?: HomeSectionProps): string {
  if (!props) return "";
  return cn(
    axisClass("pt", props.paddingTop),
    axisClass("pb", props.paddingBottom),
    axisClass("pl", props.paddingLeft),
    axisClass("pr", props.paddingRight)
  );
}

/** True when top/bottom override the block’s built-in `.section-padding`. */
export function overridesSectionPaddingY(props?: HomeSectionProps): boolean {
  if (!props) return false;
  return (
    resolveSize(props.paddingTop) !== "default" ||
    resolveSize(props.paddingBottom) !== "default"
  );
}

export const COLUMN_OPTIONS = [
  { value: "1", label: "1 per row" },
  { value: "2", label: "2 per row" },
  { value: "3", label: "3 per row" },
  { value: "4", label: "4 per row" },
] as const;

export function columnsClass(columns?: string): string {
  switch (columns) {
    case "2":
      return "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6";
    case "3":
      return "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6";
    case "4":
      return "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6";
    case "1":
    default:
      return "grid grid-cols-1 gap-6";
  }
}
