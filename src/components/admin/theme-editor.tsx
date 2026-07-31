"use client";

import { useMemo, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { ThemeData } from "@/lib/theme";
import { FONT_CSS_VAR } from "@/lib/fonts";
import {
  DEFAULT_THEME,
  FONT_CATALOG,
  THEME_PRESETS,
  normalizeTheme,
  themeFromPreset,
} from "@/lib/theme";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ThemeEditorProps = {
  initialTheme: ThemeData;
  /** SuperAdmin can snapshot / restore the approved style pack */
  isSuperAdmin?: boolean;
  hasStyleDefaults?: boolean;
};

const COLOR_FIELDS: { key: keyof ThemeData; label: string; hint?: string }[] = [
  { key: "background", label: "Page background" },
  { key: "foreground", label: "Main text" },
  { key: "muted", label: "Muted surface", hint: "Cards, soft buttons" },
  { key: "mutedForeground", label: "Muted text" },
  { key: "border", label: "Borders" },
  { key: "accent", label: "Accent" },
  { key: "accentForeground", label: "Text on accent" },
  { key: "ring", label: "Focus ring" },
];

function buttonPreviewRadius(theme: ThemeData) {
  if (theme.buttonRadius === "pill") return 9999;
  if (theme.buttonRadius === "square") return 4;
  return 12;
}

function buttonPreviewStyles(theme: ThemeData): React.CSSProperties {
  const radius = buttonPreviewRadius(theme);
  const weight =
    theme.buttonWeight === "semibold"
      ? 600
      : theme.buttonWeight === "normal"
        ? 400
        : 500;

  if (theme.buttonStyle === "outline") {
    return {
      background: "transparent",
      color: theme.accent,
      border: `1px solid ${theme.accent}`,
      borderRadius: radius,
      fontWeight: weight,
    };
  }
  if (theme.buttonStyle === "soft") {
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

function linkPreviewStyles(theme: ThemeData): React.CSSProperties {
  switch (theme.linkStyle) {
    case "accent":
      return {
        color: theme.accent,
        textDecoration: "none",
        fontWeight: 500,
      };
    case "subtle":
      return {
        color: theme.mutedForeground,
        textDecoration: "none",
        fontWeight: 400,
      };
    case "bold":
      return {
        color: theme.foreground,
        textDecoration: "none",
        fontWeight: 600,
      };
    default:
      return {
        color: theme.foreground,
        textDecoration: "underline",
        textUnderlineOffset: 4,
        fontWeight: 500,
      };
  }
}

export function ThemeEditor({
  initialTheme,
  isSuperAdmin = false,
  hasStyleDefaults: initialHasDefaults = false,
}: ThemeEditorProps) {
  const [theme, setTheme] = useState<ThemeData>(() => normalizeTheme(initialTheme));
  const [saving, setSaving] = useState(false);
  const [defaultsBusy, setDefaultsBusy] = useState<"save" | "reset" | null>(null);
  const [hasStyleDefaults, setHasStyleDefaults] = useState(initialHasDefaults);

  const activePresetId = useMemo(() => {
    if (theme.presetId && theme.presetId !== "custom") {
      const match = themeFromPreset(theme.presetId);
      if (!match) return "custom";
      const { presetId: _p, ...rest } = match;
      const { presetId: _t, ...current } = theme;
      return JSON.stringify(rest) === JSON.stringify(current)
        ? theme.presetId
        : "custom";
    }
    return "custom";
  }, [theme]);

  const set = <K extends keyof ThemeData>(key: K, value: ThemeData[K]) => {
    setTheme((t) => ({
      ...t,
      [key]: value,
      ...(key === "presetId" ? {} : { presetId: "custom" }),
    }));
  };

  const applyPreset = (presetId: string) => {
    if (presetId === "custom") {
      setTheme((t) => ({ ...t, presetId: "custom" }));
      return;
    }
    const next = themeFromPreset(presetId);
    if (next) setTheme(next);
  };

  const currentPayload = (): ThemeData => ({
    ...theme,
    presetId: activePresetId,
  });

  const save = async () => {
    setSaving(true);
    try {
      const payload = currentPayload();
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "theme", data: payload }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Save failed");
      }
      setTheme(payload);
      toast.success("Style saved — refresh the storefront to see changes");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  const saveAsDefault = async () => {
    setDefaultsBusy("save");
    try {
      const res = await fetch("/api/admin/style-defaults", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          theme: currentPayload(),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Could not save defaults");
      setHasStyleDefaults(true);
      toast.success(
        "Saved as SuperAdmin default (theme + current homepage template)"
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save defaults");
    } finally {
      setDefaultsBusy(null);
    }
  };

  const resetToDefault = async () => {
    setDefaultsBusy("reset");
    try {
      const res = await fetch("/api/admin/style-defaults", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Could not reset");
      if (body.theme) setTheme(normalizeTheme(body.theme));
      toast.success(
        "Reset to SuperAdmin default style and homepage template"
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reset");
    } finally {
      setDefaultsBusy(null);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <Card>
        <CardHeader>
          <CardTitle>Themes</CardTitle>
          <CardDescription>
            Pick a full look in one click, or choose Custom and fine-tune below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {THEME_PRESETS.map((preset) => {
              const selected = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset.id)}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-colors",
                    selected
                      ? "border-neutral-950 bg-neutral-50"
                      : "border-neutral-200 hover:border-neutral-400"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-neutral-950">
                        {preset.name}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        {preset.description}
                      </p>
                    </div>
                    {selected && <Check className="h-4 w-4 shrink-0 text-neutral-950" />}
                  </div>
                  <div className="mt-4 flex gap-1.5">
                    {[
                      preset.theme.background,
                      preset.theme.foreground,
                      preset.theme.accent,
                      preset.theme.muted,
                    ].map((color, i) => (
                      <span
                        key={`${preset.id}-${i}`}
                        className="h-6 w-6 rounded-full border border-black/10"
                        style={{ background: color }}
                      />
                    ))}
                  </div>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => applyPreset("custom")}
              className={cn(
                "rounded-xl border p-4 text-left transition-colors",
                activePresetId === "custom"
                  ? "border-neutral-950 bg-neutral-50"
                  : "border-neutral-200 hover:border-neutral-400"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-neutral-950">Custom</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    Your own mix of colors, fonts, buttons, and links
                  </p>
                </div>
                {activePresetId === "custom" && (
                  <Check className="h-4 w-4 shrink-0 text-neutral-950" />
                )}
              </div>
              <div className="mt-4 flex gap-1.5">
                {[theme.background, theme.foreground, theme.accent, theme.muted].map(
                  (color, i) => (
                    <span
                      key={`custom-${i}`}
                      className="h-6 w-6 rounded-full border border-black/10"
                      style={{ background: color }}
                    />
                  )
                )}
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Colors</CardTitle>
          <CardDescription>
            Editing any value switches the theme to Custom.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {COLOR_FIELDS.map((field) => {
            const value = String(theme[field.key]);
            return (
              <div key={field.key}>
                <Label htmlFor={field.key}>{field.label}</Label>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    id={field.key}
                    type="color"
                    value={value}
                    onChange={(e) => set(field.key, e.target.value)}
                    className="h-10 w-12 cursor-pointer rounded border border-neutral-200 bg-transparent p-1"
                  />
                  <Input
                    value={value}
                    onChange={(e) => set(field.key, e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
                {field.hint && (
                  <p className="mt-1 text-xs text-neutral-500">{field.hint}</p>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fonts</CardTitle>
          <CardDescription>Loaded via next/font on the live site.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Body font</Label>
            <Select value={theme.fontSans} onValueChange={(v) => set("fontSans", v)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_CATALOG.map((font) => (
                  <SelectItem key={font.name} value={font.name}>
                    <span style={{ fontFamily: `"${font.name}", sans-serif` }}>
                      {font.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Display / headings font</Label>
            <Select
              value={theme.fontDisplay}
              onValueChange={(v) => set("fontDisplay", v)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_CATALOG.map((font) => (
                  <SelectItem key={font.name} value={font.name}>
                    <span style={{ fontFamily: `"${font.name}", serif` }}>
                      {font.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
          <CardDescription>
            Shape, fill style, and weight for primary storefront buttons.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label>Corner style</Label>
            <Select
              value={theme.buttonRadius}
              onValueChange={(v) =>
                set("buttonRadius", v as ThemeData["buttonRadius"])
              }
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pill">Pill</SelectItem>
                <SelectItem value="rounded">Rounded</SelectItem>
                <SelectItem value="square">Square</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Fill style</Label>
            <Select
              value={theme.buttonStyle}
              onValueChange={(v) =>
                set("buttonStyle", v as ThemeData["buttonStyle"])
              }
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">Solid</SelectItem>
                <SelectItem value="outline">Outline</SelectItem>
                <SelectItem value="soft">Soft</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Weight</Label>
            <Select
              value={theme.buttonWeight}
              onValueChange={(v) =>
                set("buttonWeight", v as ThemeData["buttonWeight"])
              }
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="semibold">Semibold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Links</CardTitle>
          <CardDescription>
            How text links appear in content and “link” style buttons.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-xs">
            <Label>Link style</Label>
            <Select
              value={theme.linkStyle}
              onValueChange={(v) => set("linkStyle", v as ThemeData["linkStyle"])}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="underline">Underline</SelectItem>
                <SelectItem value="accent">Accent color</SelectItem>
                <SelectItem value="subtle">Subtle</SelectItem>
                <SelectItem value="bold">Bold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="rounded-xl border border-neutral-200 p-6"
            style={{
              background: theme.background,
              color: theme.foreground,
              fontFamily:
                FONT_CSS_VAR[theme.fontSans] ??
                `"${theme.fontSans}", system-ui, sans-serif`,
            }}
          >
            <p
              className="text-2xl font-semibold"
              style={{
                fontFamily:
                  FONT_CSS_VAR[theme.fontDisplay] ??
                  `"${theme.fontDisplay}", Georgia, serif`,
              }}
            >
              Preview heading
            </p>
            <p className="mt-2 text-sm" style={{ color: theme.mutedForeground }}>
              Body text with{" "}
              <a href="#preview" style={linkPreviewStyles(theme)}>
                a sample link
              </a>{" "}
              using your link style.
            </p>
            <button
              type="button"
              className="mt-4 px-6 py-2.5 text-sm"
              style={buttonPreviewStyles(theme)}
            >
              Primary button
            </button>
          </div>
        </CardContent>
      </Card>

      {isSuperAdmin && (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <p className="text-sm font-medium text-neutral-950">
            SuperAdmin style defaults
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            Snapshot the current theme (and live homepage template) as the
            approved default. Only you can restore the store to that pack —
            Admins can still edit live styles, but cannot change this default.
          </p>
          {!hasStyleDefaults && (
            <p className="mt-2 text-xs text-amber-700">
              No SuperAdmin default saved yet — use “Save as default” first.
            </p>
          )}
        </div>
      )}

      {/* Fixed action bar — always visible on long style forms */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/80 md:px-6 lg:left-64">
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={save} disabled={saving || Boolean(defaultsBusy)}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save style"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setTheme(DEFAULT_THEME)}
            disabled={saving || Boolean(defaultsBusy)}
          >
            Preview Studio preset
          </Button>
          {isSuperAdmin && (
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={saveAsDefault}
                disabled={saving || Boolean(defaultsBusy)}
              >
                {defaultsBusy === "save" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving default…
                  </>
                ) : (
                  "Save as default"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetToDefault}
                disabled={
                  saving || Boolean(defaultsBusy) || !hasStyleDefaults
                }
              >
                {defaultsBusy === "reset" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting…
                  </>
                ) : (
                  "Reset to default"
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
