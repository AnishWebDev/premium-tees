"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { galleryBandClass } from "@/components/home/blocks/image-gallery";
import { HELLO_BAR_DISMISS_KEY } from "@/lib/hello-bar";
import { isSettingEnabled, isWithinSchedule } from "@/lib/promo-schedule";
import { cn } from "@/lib/utils";

type PromoHelloBarProps = {
  sectionId: string;
  enabled?: boolean;
  message: string;
  linkHref?: string;
  linkLabel?: string;
  scheduleStartAt?: string;
  scheduleEndAt?: string;
  bgStyle?: string;
  backgroundColor?: string;
  textColor?: string;
  settingSticky?: string;
  settingDismissible?: string;
  initiallyVisible?: boolean;
};

export function PromoHelloBar({
  sectionId,
  enabled = true,
  message,
  linkHref = "",
  linkLabel = "",
  scheduleStartAt,
  scheduleEndAt,
  bgStyle = "theme",
  backgroundColor = "",
  textColor = "",
  settingSticky,
  settingDismissible,
  initiallyVisible = true,
}: PromoHelloBarProps) {
  const sticky = isSettingEnabled(settingSticky);
  const dismissible = isSettingEnabled(settingDismissible);
  const [visible, setVisible] = useState(initiallyVisible);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!dismissible) return;
    try {
      if (localStorage.getItem(`${HELLO_BAR_DISMISS_KEY}:${sectionId}`) === "1") {
        setDismissed(true);
      }
    } catch {
      /* ignore */
    }
  }, [dismissible, sectionId]);

  useEffect(() => {
    const tick = () => {
      setVisible(isWithinSchedule(scheduleStartAt, scheduleEndAt));
    };
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [scheduleStartAt, scheduleEndAt]);

  if (!enabled || dismissed || !visible || !message.trim()) return null;

  const hasLink = linkHref.trim().length > 0;
  const bandClass = galleryBandClass(bgStyle, backgroundColor);
  const customBg = backgroundColor?.trim();
  const customColor = textColor?.trim();

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(`${HELLO_BAR_DISMISS_KEY}:${sectionId}`, "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <aside
      role="region"
      aria-label="Promo hello bar"
      className={cn(
        "border-b border-[var(--border)]",
        bandClass,
        sticky && "sticky top-0 z-40"
      )}
      style={{
        ...(customBg ? { backgroundColor: customBg } : {}),
        ...(customColor ? { color: customColor } : {}),
      }}
    >
      <div className="container-tight flex items-center justify-center gap-3 px-4 py-2.5 text-center text-sm">
        <p className="flex-1 font-medium">{message}</p>
        {hasLink ? (
          <Link
            href={linkHref}
            className="shrink-0 underline underline-offset-2 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            {linkLabel.trim() || "Learn more"}
          </Link>
        ) : null}
        {dismissible ? (
          <button
            type="button"
            onClick={dismiss}
            className="shrink-0 rounded p-1 opacity-80 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            aria-label="Dismiss promo message"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
      </div>
    </aside>
  );
}
