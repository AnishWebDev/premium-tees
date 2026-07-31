"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

type AdminColorModeToggleProps = {
  dark: boolean;
  onToggle: () => void;
};

/** Admin-only theme toggle — does not change storefront html.dark. */
export function AdminColorModeToggle({
  dark,
  onToggle,
}: AdminColorModeToggleProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="rounded-md gap-1.5"
      onClick={onToggle}
      aria-label={dark ? "Switch admin to light mode" : "Switch admin to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
    >
      {dark ? (
        <Sun className="h-3.5 w-3.5" aria-hidden />
      ) : (
        <Moon className="h-3.5 w-3.5" aria-hidden />
      )}
      <span className="hidden sm:inline">{dark ? "Light" : "Dark"}</span>
    </Button>
  );
}
