"use client";

import { useState, type ReactNode } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type {
  AboutData,
  AllSiteContent,
  ContactData,
  ContentKey,
  FaqData,
  FooterCreditData,
  HeroData,
  HomeData,
  InstagramData,
  TestimonialsData,
} from "@/lib/site-content";
import { HOME_TEMPLATES } from "@/lib/home-templates";
import { defaultSectionsForTemplate } from "@/lib/home-sections";
import { fontFamilyStack } from "@/lib/fonts";
import { FONT_CATALOG } from "@/lib/theme";
import { HomeSectionsBuilder } from "@/components/admin/home-sections-builder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const FOOTER_FONT_CHOICES = [
  { name: "Georgia", stack: "Georgia, 'Times New Roman', serif" },
  ...FONT_CATALOG.map((f) => ({
    name: f.name,
    stack: fontFamilyStack(f.name, "Georgia, 'Times New Roman', serif"),
  })),
] as const;

function matchFooterFontName(fontFamily: string) {
  const exact = FOOTER_FONT_CHOICES.find((f) => f.stack === fontFamily);
  if (exact) return exact.name;
  const byName = FOOTER_FONT_CHOICES.find(
    (f) =>
      fontFamily === f.name ||
      fontFamily.includes(`"${f.name}"`) ||
      fontFamily.includes(f.name)
  );
  return byName?.name ?? "Georgia";
}

type SiteContentEditorProps = {
  initialContent: AllSiteContent;
  canSelectHomeTemplate?: boolean;
  hasStyleDefaults?: boolean;
  /** SuperAdmin-only footer credit styling */
  canEditFooterCredit?: boolean;
};

const BASE_TABS: { key: ContentKey; label: string }[] = [
  { key: "site", label: "Site" },
  { key: "hero", label: "Hero" },
  { key: "home", label: "Home sections" },
  { key: "about", label: "About" },
  { key: "contact", label: "Contact" },
  { key: "testimonials", label: "Testimonials" },
  { key: "faq", label: "FAQ" },
  { key: "instagram", label: "Instagram" },
  { key: "newsletter", label: "Newsletter" },
];

export function SiteContentEditor({
  initialContent,
  canSelectHomeTemplate = false,
  hasStyleDefaults: initialHasDefaults = false,
  canEditFooterCredit = false,
}: SiteContentEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState<ContentKey | null>(null);
  const [hasStyleDefaults, setHasStyleDefaults] = useState(initialHasDefaults);
  const [defaultsBusy, setDefaultsBusy] = useState<"save" | "reset" | null>(
    null
  );

  const tabs = canEditFooterCredit
    ? [...BASE_TABS, { key: "footerCredit" as const, label: "Footer credit" }]
    : BASE_TABS;

  const save = async (key: ContentKey) => {
    setSaving(key);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, data: content[key] }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Save failed");
      }
      toast.success("Saved — live site updates within about a minute");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(null);
    }
  };

  const SaveButton = ({ keyName }: { keyName: ContentKey }) => (
    <Button onClick={() => save(keyName)} disabled={saving === keyName}>
      {saving === keyName ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saving…
        </>
      ) : (
        "Save changes"
      )}
    </Button>
  );

  return (
    // data-admin-flush clears AdminShell main padding so sticky tabs sit at true top-0
    <div data-admin-flush>
      <div className="px-4 pt-4 md:px-6 md:pt-6">
        <h1 className="font-display text-2xl font-semibold text-neutral-950">
          Site content
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Update homepage, about, FAQ, and marketing copy without touching code.
        </p>
      </div>

      <Tabs defaultValue="hero">
        <div className="sticky top-0 z-20 border-b border-neutral-200 bg-[var(--background)] px-4 py-2 md:px-6">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-xl bg-[var(--muted)] p-1">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.key} value={tab.key}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="space-y-6 px-4 py-6 md:px-6">
        <TabsContent value="site" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Site identity</CardTitle>
              <CardDescription>Brand name and short description used across the store.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field
                label="Site name"
                value={content.site.name}
                onChange={(v) =>
                  setContent((c) => ({ ...c, site: { ...c.site, name: v } }))
                }
              />
              <Field
                label="Description"
                value={content.site.description}
                onChange={(v) =>
                  setContent((c) => ({ ...c, site: { ...c.site, description: v } }))
                }
                multiline
              />
              <SaveButton keyName="site" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hero" className="mt-0">
          <HeroEditor
            data={content.hero}
            onChange={(hero) => setContent((c) => ({ ...c, hero }))}
            saveButton={<SaveButton keyName="hero" />}
          />
        </TabsContent>

        <TabsContent value="home" className="mt-0">
          <HomeEditor
            data={content.home}
            contentSource={content}
            onChange={(home) => setContent((c) => ({ ...c, home }))}
            saveButton={<SaveButton keyName="home" />}
            canSelectTemplate={canSelectHomeTemplate}
            hasStyleDefaults={hasStyleDefaults}
            defaultsBusy={defaultsBusy}
            onSaveTemplateAsDefault={async () => {
              setDefaultsBusy("save");
              try {
                const res = await fetch("/api/admin/style-defaults", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    action: "save",
                    homeTemplate: content.home.template,
                  }),
                });
                const body = await res.json().catch(() => ({}));
                if (!res.ok) {
                  throw new Error(body.error || "Could not save default");
                }
                setHasStyleDefaults(true);
                toast.success("Homepage template saved as SuperAdmin default");
              } catch (err) {
                toast.error(
                  err instanceof Error ? err.message : "Could not save default"
                );
              } finally {
                setDefaultsBusy(null);
              }
            }}
            onResetStyleDefaults={async () => {
              setDefaultsBusy("reset");
              try {
                const res = await fetch("/api/admin/style-defaults", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ action: "reset" }),
                });
                const body = await res.json().catch(() => ({}));
                if (!res.ok) {
                  throw new Error(body.error || "Could not reset");
                }
                if (body.homeTemplate) {
                  setContent((c) => ({
                    ...c,
                    home: { ...c.home, template: body.homeTemplate },
                    ...(body.theme ? { theme: body.theme } : {}),
                  }));
                }
                toast.success(
                  "Reset theme + homepage template to SuperAdmin default"
                );
              } catch (err) {
                toast.error(
                  err instanceof Error ? err.message : "Could not reset"
                );
              } finally {
                setDefaultsBusy(null);
              }
            }}
          />
        </TabsContent>

        <TabsContent value="about" className="mt-0">
          <AboutEditor
            data={content.about}
            onChange={(about) => setContent((c) => ({ ...c, about }))}
            saveButton={<SaveButton keyName="about" />}
          />
        </TabsContent>

        <TabsContent value="contact" className="mt-0">
          <ContactEditor
            data={content.contact}
            onChange={(contact) => setContent((c) => ({ ...c, contact }))}
            saveButton={<SaveButton keyName="contact" />}
          />
        </TabsContent>

        <TabsContent value="testimonials" className="mt-0">
          <TestimonialsEditor
            data={content.testimonials}
            onChange={(testimonials) => setContent((c) => ({ ...c, testimonials }))}
            saveButton={<SaveButton keyName="testimonials" />}
          />
        </TabsContent>

        <TabsContent value="faq" className="mt-0">
          <FaqEditor
            data={content.faq}
            onChange={(faq) => setContent((c) => ({ ...c, faq }))}
            saveButton={<SaveButton keyName="faq" />}
          />
        </TabsContent>

        <TabsContent value="instagram" className="mt-0">
          <InstagramEditor
            data={content.instagram}
            onChange={(instagram) => setContent((c) => ({ ...c, instagram }))}
            saveButton={<SaveButton keyName="instagram" />}
          />
        </TabsContent>

        <TabsContent value="newsletter" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Newsletter block</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field
                label="Title"
                value={content.newsletter.title}
                onChange={(v) =>
                  setContent((c) => ({
                    ...c,
                    newsletter: { ...c.newsletter, title: v },
                  }))
                }
              />
              <Field
                label="Subtitle"
                value={content.newsletter.subtitle}
                onChange={(v) =>
                  setContent((c) => ({
                    ...c,
                    newsletter: { ...c.newsletter, subtitle: v },
                  }))
                }
                multiline
              />
              <SaveButton keyName="newsletter" />
            </CardContent>
          </Card>
        </TabsContent>

        {canEditFooterCredit && (
          <TabsContent value="footerCredit" className="mt-0">
            <FooterCreditEditor
              data={content.footerCredit}
              onChange={(footerCredit) =>
                setContent((c) => ({ ...c, footerCredit }))
              }
              saveButton={<SaveButton keyName="footerCredit" />}
            />
          </TabsContent>
        )}
        </div>
      </Tabs>
    </div>
  );
}

function FooterCreditEditor({
  data,
  onChange,
  saveButton,
}: {
  data: FooterCreditData;
  onChange: (d: FooterCreditData) => void;
  saveButton: ReactNode;
}) {
  const set = <K extends keyof FooterCreditData>(
    key: K,
    value: FooterCreditData[K]
  ) => onChange({ ...data, [key]: value });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Footer credit</CardTitle>
        <CardDescription>
          SuperAdmin only — cursive “Made with ♥ by …” line in the storefront
          footer. Style color, size, font, and optional link on the name.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={data.enabled}
            onCheckedChange={(v) => set("enabled", v === true)}
          />
          Show credit on the storefront
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Prefix text"
            value={data.prefix}
            onChange={(v) => set("prefix", v)}
          />
          <Field
            label="Name"
            value={data.name}
            onChange={(v) => set("name", v)}
          />
          <Field
            label="Name link (optional)"
            value={data.nameHref}
            onChange={(v) => set("nameHref", v)}
            placeholder="https://… or /about"
          />
          <div>
            <Label>Font</Label>
            <Select
              value={matchFooterFontName(data.fontFamily)}
              onValueChange={(name) => {
                const choice = FOOTER_FONT_CHOICES.find((f) => f.name === name);
                if (choice) set("fontFamily", choice.stack);
              }}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select a font" />
              </SelectTrigger>
              <SelectContent>
                {FOOTER_FONT_CHOICES.map((font) => (
                  <SelectItem key={font.name} value={font.name}>
                    <span style={{ fontFamily: font.stack }}>{font.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Heart color</Label>
            <div className="mt-2 flex items-center gap-2">
              <Input
                type="color"
                value={data.heartColor}
                onChange={(e) => set("heartColor", e.target.value)}
                className="h-10 w-14 cursor-pointer p-1"
              />
              <Input
                value={data.heartColor}
                onChange={(e) => set("heartColor", e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label>Text color</Label>
            <div className="mt-2 flex items-center gap-2">
              <Input
                type="color"
                value={data.textColor}
                onChange={(e) => set("textColor", e.target.value)}
                className="h-10 w-14 cursor-pointer p-1"
              />
              <Input
                value={data.textColor}
                onChange={(e) => set("textColor", e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label>Font size (px)</Label>
            <Input
              type="number"
              min={10}
              max={48}
              className="mt-2"
              value={data.fontSizePx}
              onChange={(e) =>
                set("fontSizePx", Number(e.target.value) || 15)
              }
            />
          </div>
          <label className="flex items-end gap-2 pb-2 text-sm">
            <Checkbox
              checked={data.italic}
              onCheckedChange={(v) => set("italic", v === true)}
            />
            Italic / cursive emphasis
          </label>
        </div>
        <div
          className="rounded-xl border border-neutral-200 bg-neutral-50 p-4"
          aria-hidden
        >
          <p className="text-xs text-neutral-500">Preview</p>
          <p
            className="mt-2 inline-flex items-center gap-1.5"
            style={{
              color: data.textColor,
              fontSize: `${data.fontSizePx}px`,
              fontFamily: data.fontFamily,
              fontStyle: data.italic ? "italic" : "normal",
            }}
          >
            {data.prefix}{" "}
            <span style={{ color: data.heartColor }}>♥</span> by {data.name}
          </p>
        </div>
        {saveButton}
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      {multiline ? (
        <Textarea
          className="mt-2"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
        />
      ) : (
        <Input
          className="mt-2"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

function ContactEditor({
  data,
  onChange,
  saveButton,
}: {
  data: ContactData;
  onChange: (d: ContactData) => void;
  saveButton: ReactNode;
}) {
  const set = <K extends keyof ContactData>(key: K, value: ContactData[K]) =>
    onChange({ ...data, [key]: value });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact page</CardTitle>
        <CardDescription>
          Email, phone, studio details, and intro copy shown on /contact.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Field
          label="Page title"
          value={data.title}
          onChange={(v) => set("title", v)}
        />
        <Field
          label="Intro"
          value={data.subtitle}
          onChange={(v) => set("subtitle", v)}
          multiline
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Email"
            value={data.email}
            onChange={(v) => set("email", v)}
            placeholder="hello@example.com"
          />
          <Field
            label="Phone (optional)"
            value={data.phone}
            onChange={(v) => set("phone", v)}
            placeholder="+1 …"
          />
          <Field
            label="Phone hours / note"
            value={data.phoneHours}
            onChange={(v) => set("phoneHours", v)}
            placeholder="Mon–Fri, 9am–5pm"
          />
          <Field
            label="Studio label"
            value={data.studioLabel}
            onChange={(v) => set("studioLabel", v)}
          />
          <Field
            label="Studio line 1"
            value={data.studioLine1}
            onChange={(v) => set("studioLine1", v)}
          />
          <Field
            label="Studio line 2"
            value={data.studioLine2}
            onChange={(v) => set("studioLine2", v)}
          />
        </div>
        <Field
          label="Form title"
          value={data.formTitle}
          onChange={(v) => set("formTitle", v)}
        />
        {saveButton}
      </CardContent>
    </Card>
  );
}

function HeroEditor({
  data,
  onChange,
  saveButton,
}: {
  data: HeroData;
  onChange: (d: HeroData) => void;
  saveButton: ReactNode;
}) {
  const set = (patch: Partial<HeroData>) => onChange({ ...data, ...patch });
  return (
    <Card>
      <CardHeader>
        <CardTitle>Homepage hero</CardTitle>
        <CardDescription>First thing visitors see on the homepage.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Field label="Brand label" value={data.brand} onChange={(v) => set({ brand: v })} />
        <Field label="Headline" value={data.headline} onChange={(v) => set({ headline: v })} />
        <Field
          label="Supporting text"
          value={data.subheadline}
          onChange={(v) => set({ subheadline: v })}
          multiline
        />
        <Field
          label="Poster / fallback image URL"
          value={data.imageUrl}
          onChange={(v) => set({ imageUrl: v })}
          placeholder="https://..."
        />
        <Field
          label="Hero video URL (optional)"
          value={data.videoUrl ?? ""}
          onChange={(v) => set({ videoUrl: v || undefined })}
          placeholder="https://...mp4 — leave empty for parallax image"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Primary button label"
            value={data.primaryCtaLabel}
            onChange={(v) => set({ primaryCtaLabel: v })}
          />
          <Field
            label="Primary button link"
            value={data.primaryCtaHref}
            onChange={(v) => set({ primaryCtaHref: v })}
          />
          <Field
            label="Secondary button label"
            value={data.secondaryCtaLabel}
            onChange={(v) => set({ secondaryCtaLabel: v })}
          />
          <Field
            label="Secondary button link"
            value={data.secondaryCtaHref}
            onChange={(v) => set({ secondaryCtaHref: v })}
          />
        </div>
        {saveButton}
      </CardContent>
    </Card>
  );
}

function HomeEditor({
  data,
  contentSource,
  onChange,
  saveButton,
  canSelectTemplate,
  hasStyleDefaults,
  defaultsBusy,
  onSaveTemplateAsDefault,
  onResetStyleDefaults,
}: {
  data: HomeData;
  contentSource: AllSiteContent;
  onChange: (d: HomeData) => void;
  saveButton: ReactNode;
  canSelectTemplate: boolean;
  hasStyleDefaults: boolean;
  defaultsBusy: "save" | "reset" | null;
  onSaveTemplateAsDefault: () => Promise<void>;
  onResetStyleDefaults: () => Promise<void>;
}) {
  return (
    <div className="space-y-6 pb-24">
      {canSelectTemplate ? (
        <Card>
          <CardHeader>
            <CardTitle>Homepage template</CardTitle>
            <CardDescription>
              SuperAdmin only — picking a preset reseeds the page layout list
              below. You can then drag, add, or remove blocks.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {HOME_TEMPLATES.map((tpl) => {
                const selected = data.template === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() =>
                      onChange({
                        ...data,
                        template: tpl.id,
                        sections: defaultSectionsForTemplate(tpl.id),
                      })
                    }
                    className={
                      selected
                        ? "rounded-xl border border-neutral-950 bg-neutral-50 p-4 text-left"
                        : "rounded-xl border border-neutral-200 p-4 text-left hover:border-neutral-400"
                    }
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-neutral-950">
                        {tpl.name}
                      </p>
                      <span className="text-[10px] uppercase tracking-wider text-neutral-400">
                        {tpl.density}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-neutral-500">
                      {tpl.description}
                    </p>
                    <p className="mt-2 text-[11px] uppercase tracking-wider text-neutral-400">
                      Inspired by {tpl.inspiredBy}
                    </p>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-sm font-medium text-neutral-950">
                SuperAdmin style defaults
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                Save this template into the approved default pack (keeps the
                saved default theme). Reset restores both theme and template.
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onSaveTemplateAsDefault}
                  disabled={Boolean(defaultsBusy)}
                >
                  {defaultsBusy === "save" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving default…
                    </>
                  ) : (
                    "Save template as default"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onResetStyleDefaults}
                  disabled={Boolean(defaultsBusy) || !hasStyleDefaults}
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
              </div>
              {!hasStyleDefaults && (
                <p className="mt-2 text-xs text-amber-700">
                  No SuperAdmin default yet — save from here or Site style.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Homepage layout</CardTitle>
            <CardDescription>
              Current preset:{" "}
              <span className="font-medium text-neutral-950">
                {data.template}
              </span>
              . Edit section copy below — SuperAdmin controls order and which
              blocks appear.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Both roles edit section fields; only SuperAdmin can reorder/add/remove */}
      <HomeSectionsBuilder
        sections={data.sections}
        template={data.template}
        content={contentSource}
        canManageLayout={canSelectTemplate}
        onChange={(sections) => onChange({ ...data, sections })}
      />

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/80 md:px-6 lg:left-64">
        <div className="flex flex-wrap items-center gap-3">{saveButton}</div>
      </div>
    </div>
  );
}

function AboutEditor({
  data,
  onChange,
  saveButton,
}: {
  data: AboutData;
  onChange: (d: AboutData) => void;
  saveButton: ReactNode;
}) {
  const set = (patch: Partial<AboutData>) => onChange({ ...data, ...patch });

  return (
    <Card>
      <CardHeader>
        <CardTitle>About page</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Field label="Eyebrow" value={data.eyebrow} onChange={(v) => set({ eyebrow: v })} />
        <Field label="Title" value={data.title} onChange={(v) => set({ title: v })} />
        <Field label="Intro" value={data.intro} onChange={(v) => set({ intro: v })} multiline />
        <Field
          label="Story title"
          value={data.storyTitle}
          onChange={(v) => set({ storyTitle: v })}
        />
        {data.storyParagraphs.map((p, i) => (
          <Field
            key={i}
            label={`Story paragraph ${i + 1}`}
            value={p}
            onChange={(v) => {
              const storyParagraphs = [...data.storyParagraphs];
              storyParagraphs[i] = v;
              set({ storyParagraphs });
            }}
            multiline
          />
        ))}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => set({ storyParagraphs: [...data.storyParagraphs, ""] })}
          >
            <Plus className="mr-1 h-4 w-4" /> Add paragraph
          </Button>
          {data.storyParagraphs.length > 1 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                set({ storyParagraphs: data.storyParagraphs.slice(0, -1) })
              }
            >
              <Trash2 className="mr-1 h-4 w-4" /> Remove last
            </Button>
          )}
        </div>
        <Field
          label="Values title"
          value={data.valuesTitle}
          onChange={(v) => set({ valuesTitle: v })}
        />
        {data.values.map((item, i) => (
          <div key={i} className="space-y-3 rounded-xl border border-neutral-200 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Value {i + 1}</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  set({ values: data.values.filter((_, idx) => idx !== i) })
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Field
              label="Title"
              value={item.title}
              onChange={(v) => {
                const values = [...data.values];
                values[i] = { ...item, title: v };
                set({ values });
              }}
            />
            <Field
              label="Body"
              value={item.body}
              onChange={(v) => {
                const values = [...data.values];
                values[i] = { ...item, body: v };
                set({ values });
              }}
              multiline
            />
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            set({ values: [...data.values, { title: "", body: "" }] })
          }
        >
          <Plus className="mr-1 h-4 w-4" /> Add value
        </Button>
        <Field label="CTA title" value={data.ctaTitle} onChange={(v) => set({ ctaTitle: v })} />
        <Field
          label="CTA subtitle"
          value={data.ctaSubtitle}
          onChange={(v) => set({ ctaSubtitle: v })}
          multiline
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="CTA button label"
            value={data.ctaLabel}
            onChange={(v) => set({ ctaLabel: v })}
          />
          <Field
            label="CTA button link"
            value={data.ctaHref}
            onChange={(v) => set({ ctaHref: v })}
          />
        </div>
        {saveButton}
      </CardContent>
    </Card>
  );
}

function TestimonialsEditor({
  data,
  onChange,
  saveButton,
}: {
  data: TestimonialsData;
  onChange: (d: TestimonialsData) => void;
  saveButton: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Testimonials</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Field
          label="Section title"
          value={data.title}
          onChange={(v) => onChange({ ...data, title: v })}
        />
        <Field
          label="Section subtitle"
          value={data.subtitle}
          onChange={(v) => onChange({ ...data, subtitle: v })}
          multiline
        />
        {data.items.map((item, i) => (
          <div key={item.id} className="space-y-3 rounded-xl border border-neutral-200 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Quote {i + 1}</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  onChange({
                    ...data,
                    items: data.items.filter((_, idx) => idx !== i),
                  })
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Field
              label="Name"
              value={item.name}
              onChange={(v) => {
                const items = [...data.items];
                items[i] = { ...item, name: v };
                onChange({ ...data, items });
              }}
            />
            <Field
              label="Role"
              value={item.role}
              onChange={(v) => {
                const items = [...data.items];
                items[i] = { ...item, role: v };
                onChange({ ...data, items });
              }}
            />
            <Field
              label="Quote"
              value={item.quote}
              onChange={(v) => {
                const items = [...data.items];
                items[i] = { ...item, quote: v };
                onChange({ ...data, items });
              }}
              multiline
            />
            <Field
              label="Rating (1–5)"
              value={String(item.rating)}
              onChange={(v) => {
                const items = [...data.items];
                items[i] = {
                  ...item,
                  rating: Math.min(5, Math.max(1, Number(v) || 5)),
                };
                onChange({ ...data, items });
              }}
            />
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            onChange({
              ...data,
              items: [
                ...data.items,
                {
                  id: crypto.randomUUID(),
                  name: "",
                  role: "",
                  quote: "",
                  rating: 5,
                },
              ],
            })
          }
        >
          <Plus className="mr-1 h-4 w-4" /> Add testimonial
        </Button>
        {saveButton}
      </CardContent>
    </Card>
  );
}

function FaqEditor({
  data,
  onChange,
  saveButton,
}: {
  data: FaqData;
  onChange: (d: FaqData) => void;
  saveButton: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>FAQ</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Field
          label="Page title"
          value={data.title}
          onChange={(v) => onChange({ ...data, title: v })}
        />
        <Field
          label="Page subtitle"
          value={data.subtitle}
          onChange={(v) => onChange({ ...data, subtitle: v })}
          multiline
        />
        {data.items.map((item, i) => (
          <div key={i} className="space-y-3 rounded-xl border border-neutral-200 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Question {i + 1}</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  onChange({
                    ...data,
                    items: data.items.filter((_, idx) => idx !== i),
                  })
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Field
              label="Question"
              value={item.question}
              onChange={(v) => {
                const items = [...data.items];
                items[i] = { ...item, question: v };
                onChange({ ...data, items });
              }}
            />
            <Field
              label="Answer"
              value={item.answer}
              onChange={(v) => {
                const items = [...data.items];
                items[i] = { ...item, answer: v };
                onChange({ ...data, items });
              }}
              multiline
            />
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            onChange({
              ...data,
              items: [...data.items, { question: "", answer: "" }],
            })
          }
        >
          <Plus className="mr-1 h-4 w-4" /> Add FAQ
        </Button>
        {saveButton}
      </CardContent>
    </Card>
  );
}

function InstagramEditor({
  data,
  onChange,
  saveButton,
}: {
  data: InstagramData;
  onChange: (d: InstagramData) => void;
  saveButton: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Instagram gallery</CardTitle>
        <CardDescription>Paste image URLs (one per field).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Field
          label="Section title"
          value={data.title}
          onChange={(v) => onChange({ ...data, title: v })}
        />
        <Field
          label="Section subtitle"
          value={data.subtitle}
          onChange={(v) => onChange({ ...data, subtitle: v })}
          multiline
        />
        <Field
          label="Profile / link URL"
          value={data.profileUrl}
          onChange={(v) => onChange({ ...data, profileUrl: v })}
        />
        {data.images.map((url, i) => (
          <div key={i} className="flex gap-2">
            <div className="flex-1">
              <Field
                label={`Image ${i + 1} URL`}
                value={url}
                onChange={(v) => {
                  const images = [...data.images];
                  images[i] = v;
                  onChange({ ...data, images });
                }}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mt-8"
              onClick={() =>
                onChange({
                  ...data,
                  images: data.images.filter((_, idx) => idx !== i),
                })
              }
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange({ ...data, images: [...data.images, ""] })}
        >
          <Plus className="mr-1 h-4 w-4" /> Add image
        </Button>
        {saveButton}
      </CardContent>
    </Card>
  );
}
