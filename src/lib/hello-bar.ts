import { isSettingEnabled, isWithinSchedule } from "@/lib/promo-schedule";

export type HelloBarData = {
  enabled: boolean;
  message: string;
  linkHref: string;
  linkLabel: string;
  scheduleStartAt: string;
  scheduleEndAt: string;
  bgStyle: string;
  backgroundColor: string;
  textColor: string;
  settingSticky: string;
  settingDismissible: string;
};

export const DEFAULT_HELLO_BAR: HelloBarData = {
  enabled: false,
  message: "",
  linkHref: "",
  linkLabel: "",
  scheduleStartAt: "",
  scheduleEndAt: "",
  bgStyle: "accent",
  backgroundColor: "",
  textColor: "",
  settingSticky: "no",
  settingDismissible: "yes",
};

export const HELLO_BAR_DISMISS_KEY = "site-hello-bar";

export function mergeHelloBar(stored: unknown): HelloBarData {
  const partial =
    stored && typeof stored === "object"
      ? (stored as Partial<HelloBarData>)
      : {};
  return {
    enabled: partial.enabled === true,
    message: typeof partial.message === "string" ? partial.message.trim() : "",
    linkHref: typeof partial.linkHref === "string" ? partial.linkHref.trim() : "",
    linkLabel:
      typeof partial.linkLabel === "string" ? partial.linkLabel.trim() : "",
    scheduleStartAt:
      typeof partial.scheduleStartAt === "string"
        ? partial.scheduleStartAt.trim()
        : "",
    scheduleEndAt:
      typeof partial.scheduleEndAt === "string"
        ? partial.scheduleEndAt.trim()
        : "",
    bgStyle:
      partial.bgStyle === "muted" ||
      partial.bgStyle === "accent" ||
      partial.bgStyle === "custom" ||
      partial.bgStyle === "theme"
        ? partial.bgStyle
        : DEFAULT_HELLO_BAR.bgStyle,
    backgroundColor:
      typeof partial.backgroundColor === "string"
        ? partial.backgroundColor.trim()
        : "",
    textColor:
      typeof partial.textColor === "string" ? partial.textColor.trim() : "",
    settingSticky:
      typeof partial.settingSticky === "string"
        ? partial.settingSticky
        : DEFAULT_HELLO_BAR.settingSticky,
    settingDismissible:
      typeof partial.settingDismissible === "string"
        ? partial.settingDismissible
        : DEFAULT_HELLO_BAR.settingDismissible,
  };
}

export function helloBarIsVisible(
  bar: HelloBarData,
  now: Date = new Date()
): boolean {
  if (!bar.enabled || !bar.message.trim()) return false;
  return isWithinSchedule(bar.scheduleStartAt, bar.scheduleEndAt, now);
}

export { isSettingEnabled };
