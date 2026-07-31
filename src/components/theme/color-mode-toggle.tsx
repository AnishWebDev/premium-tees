"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ColorModeToggleProps = {
  className?: string;
  /** Compact icon button (header) vs labeled control (footer) */
  variant?: "icon" | "labeled";
};

function withThemeTransition(apply: () => void) {
  const root = document.documentElement;
  root.classList.add("theme-transition");
  apply();
  window.setTimeout(() => {
    root.classList.remove("theme-transition");
  }, 420);
}

export function ColorModeToggle({
  className,
  variant = "icon",
}: ColorModeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  const toggle = () => {
    withThemeTransition(() => setTheme(isDark ? "light" : "dark"));
  };

  if (variant === "labeled") {
    return (
      <button
        type="button"
        onClick={toggle}
        className={cn(
          "inline-flex items-center gap-2 text-xs transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
          className
        )}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDark ? (
          <Sun className="h-3.5 w-3.5" aria-hidden />
        ) : (
          <Moon className="h-3.5 w-3.5" aria-hidden />
        )}
        <span>{mounted ? (isDark ? "Light mode" : "Dark mode") : "Theme"}</span>
      </button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={className}
    >
      {isDark ? (
        <Sun className="h-5 w-5" aria-hidden />
      ) : (
        <Moon className="h-5 w-5" aria-hidden />
      )}
    </Button>
  );
}
