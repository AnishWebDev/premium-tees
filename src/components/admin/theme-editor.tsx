"use client";

import { useMemo, useState } from "react";
import { Check, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { adminFixedSaveBar } from "@/lib/admin-ui-classes";
import type { SavedThemePreset, ThemeData } from "@/lib/theme";
import {
  DEFAULT_THEME,
  FONT_CATALOG,
  THEME_PRESETS,
  createSavedThemePreset,
  normalizeTheme,
  themeFromPreset,
  themeMatchesPreset,
  type FontWeightOption,
} from "@/lib/theme";
import { ThemePreviewPanel } from "@/components/admin/theme-preview-panel";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  initialSavedThemes?: SavedThemePreset[];
  /** SuperAdmin can snapshot / restore the approved style pack */
  isSuperAdmin?: boolean;
  hasStyleDefaults?: boolean;
};

const COLOR_FIELDS: { key: keyof ThemeData; label: string; hint?: string }[] = [
  { key: "background", label: "Page background" },
  { key: "foreground", label: "Main text" },
  { key: "muted", label: "Secondary", hint: "Section backgrounds, cards, soft buttons" },
  { key: "mutedForeground", label: "Secondary text" },
  { key: "border", label: "Borders" },
  { key: "accent", label: "Link/Button" },
  { key: "accentForeground", label: "Text on link/button" },
  { key: "ring", label: "Focus ring" },
];

const FONT_WEIGHT_OPTIONS: { value: FontWeightOption; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "medium", label: "Medium" },
  { value: "semibold", label: "Semibold" },
  { value: "bold", label: "Bold" },
];

export function ThemeEditor({
  initialTheme,
  initialSavedThemes = [],
  isSuperAdmin = false,
  hasStyleDefaults: initialHasDefaults = false,
}: ThemeEditorProps) {
  const [theme, setTheme] = useState<ThemeData>(() => normalizeTheme(initialTheme));
  const [savedThemes, setSavedThemes] = useState<SavedThemePreset[]>(initialSavedThemes);
  const [themeName, setThemeName] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingThemeList, setSavingThemeList] = useState(false);
  const [defaultsBusy, setDefaultsBusy] = useState<"save" | "reset" | null>(null);
  const [hasStyleDefaults, setHasStyleDefaults] = useState(initialHasDefaults);

  const activePresetId = useMemo(() => {
    for (const preset of THEME_PRESETS) {
      if (themeMatchesPreset(theme, preset.id, savedThemes)) return preset.id;
    }
    for (const preset of savedThemes) {
      if (themeMatchesPreset(theme, preset.id, savedThemes)) return preset.id;
    }
    return "custom";
  }, [theme, savedThemes]);

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
    const next = themeFromPreset(presetId, savedThemes);
    if (next) setTheme(next);
  };

  const persistSavedThemes = async (next: SavedThemePreset[]) => {
    setSavingThemeList(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "savedThemes", data: next }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Could not save theme list");
      }
      setSavedThemes(next);
    } finally {
      setSavingThemeList(false);
    }
  };

  const saveNamedTheme = async () => {
    const name = themeName.trim();
    if (!name) {
      toast.error("Enter a name for your theme");
      return;
    }
    try {
      const preset = createSavedThemePreset(
        currentPayload(),
        name,
        savedThemes.map((p) => p.id)
      );
      const next = [...savedThemes, preset];
      await persistSavedThemes(next);
      setTheme(normalizeTheme({ presetId: preset.id, ...preset.theme }));
      setThemeName("");
      toast.success(`Saved theme “${name}”`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save theme");
    }
  };

  const deleteSavedTheme = async (id: string) => {
    const preset = savedThemes.find((p) => p.id === id);
    if (!preset) return;
    if (!window.confirm(`Delete saved theme “${preset.name}”?`)) return;
    try {
      const next = savedThemes.filter((p) => p.id !== id);
      await persistSavedThemes(next);
      if (activePresetId === id) {
        setTheme((t) => ({ ...t, presetId: "custom" }));
      }
      toast.success(`Deleted “${preset.name}”`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete theme");
    }
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
    <div className="relative pb-24">
      <div className="lg:pr-[min(100%,24rem)]">
        <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Themes</CardTitle>
          <CardDescription>
            Pick a built-in or saved theme, or choose Custom and fine-tune below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Label htmlFor="theme-save-name">Save current style as theme</Label>
              <Input
                id="theme-save-name"
                className="mt-2"
                value={themeName}
                placeholder="e.g. Summer drop"
                onChange={(e) => setThemeName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void saveNamedTheme();
                  }
                }}
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => void saveNamedTheme()}
              disabled={savingThemeList || !themeName.trim()}
            >
              {savingThemeList ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save theme"
              )}
            </Button>
          </div>

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

            {savedThemes.map((preset) => {
              const selected = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset.id)}
                  className={cn(
                    "relative rounded-xl border p-4 text-left transition-colors",
                    selected
                      ? "border-neutral-950 bg-neutral-50"
                      : "border-neutral-200 hover:border-neutral-400"
                  )}
                >
                  {selected ? (
                    <Check
                      className="absolute left-3 top-3 h-4 w-4 text-neutral-950"
                      aria-hidden
                    />
                  ) : null}
                  <div className={cn("min-w-0", selected && "pl-6")}>
                    <p className="truncate pe-8 text-sm font-semibold text-neutral-950">
                      {preset.name}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">Your saved theme</p>
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
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1.5 top-1.5 h-8 w-8 text-neutral-400 hover:text-red-600"
                    aria-label={`Delete theme ${preset.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      void deleteSavedTheme(preset.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
            <Label className="mt-3">Body weight</Label>
            <Select
              value={theme.fontSansWeight}
              onValueChange={(v) => set("fontSansWeight", v as FontWeightOption)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_WEIGHT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
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
            <Label className="mt-3">Heading weight</Label>
            <Select
              value={theme.fontDisplayWeight}
              onValueChange={(v) => set("fontDisplayWeight", v as FontWeightOption)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_WEIGHT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
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
                {FONT_WEIGHT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
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
                <SelectItem value="accent">Link/Button color</SelectItem>
                <SelectItem value="subtle">Subtle</SelectItem>
                <SelectItem value="bold">Bold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isSuperAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Site chrome</CardTitle>
            <CardDescription>
              SuperAdmin storefront layout options that apply across every page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-3">
              <Checkbox
                id="theme-hide-scrollbar"
                checked={theme.hideScrollbar}
                onCheckedChange={(v) => set("hideScrollbar", v === true)}
              />
              <Label
                htmlFor="theme-hide-scrollbar"
                className="cursor-pointer text-sm font-medium leading-none"
              >
                Hide page scrollbar
              </Label>
            </div>
            <p className="text-xs text-neutral-500">
              Hides the main browser scrollbar on the storefront. Pages still
              scroll with trackpad, mouse wheel, and touch.
            </p>
          </CardContent>
        </Card>
      )}

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
        </div>
      </div>

      <aside
        aria-label="Theme live preview"
        className="pointer-events-none fixed bottom-24 right-4 top-[4.75rem] z-10 hidden w-[min(100%,22.5rem)] lg:block xl:right-8"
      >
        <div className="pointer-events-auto h-full overflow-y-auto overscroll-contain pb-2">
          <ThemePreviewPanel theme={theme} />
        </div>
      </aside>

      <div className="mt-6 lg:hidden">
        <ThemePreviewPanel theme={theme} />
      </div>

      {/* Fixed action bar — always visible on long style forms */}
      <div className={`${adminFixedSaveBar} md:px-6`}>
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
