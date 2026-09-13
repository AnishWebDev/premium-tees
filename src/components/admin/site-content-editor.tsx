"use client";

import { useState, type ReactNode } from "react";
import { ImageIcon, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type {
  AboutData,
  AllSiteContent,
  ContactData,
  ContentKey,
  FaqData,
  FooterCreditData,
  FooterData,
  HeaderData,
  HeroData,
  HomeData,
  InstagramData,
  NavLinkItem,
  TestimonialsData,
} from "@/lib/site-content";
import { ImageUrlField } from "@/components/admin/image-url-field";
import { adminFixedSaveBar } from "@/lib/admin-ui-classes";
import { HOME_TEMPLATES } from "@/lib/home-templates";
import { defaultSectionsForTemplate } from "@/lib/home-sections";
import { fontFamilyStack } from "@/lib/fonts";
import { FONT_CATALOG } from "@/lib/theme";
import { EditorSectionsAccordion } from "@/components/admin/editor-sections-accordion";
import { HelloBarEditor } from "@/components/admin/hello-bar-editor";
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
  /** Limit which tabs appear (defaults to all). */
  visibleTabs?: ContentKey[];
  title?: string;
  description?: string;
  /** Render a single tab panel without chrome (for Page content embed). */
  embedMode?: boolean;
  activeTab?: ContentKey;
  hideSave?: boolean;
  content?: AllSiteContent;
  onContentChange?: (content: AllSiteContent) => void;
};

const BASE_TABS: { key: ContentKey; label: string }[] = [
  { key: "site", label: "Site" },
  { key: "header", label: "Header" },
  { key: "footer", label: "Footer" },
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
  visibleTabs,
  title = "Site content",
  description = "Update homepage, about, FAQ, and marketing copy without touching code.",
  embedMode = false,
  activeTab,
  hideSave = false,
  content: controlledContent,
  onContentChange,
}: SiteContentEditorProps) {
  const [internalContent, setInternalContent] = useState(initialContent);
  const content = controlledContent ?? internalContent;
  const setContent = (
    updater: AllSiteContent | ((prev: AllSiteContent) => AllSiteContent)
  ) => {
    const prev = controlledContent ?? internalContent;
    const next =
      typeof updater === "function" ? updater(prev) : updater;
    if (onContentChange) onContentChange(next);
    else setInternalContent(next);
  };
  const [saving, setSaving] = useState<ContentKey | null>(null);
  const [hasStyleDefaults, setHasStyleDefaults] = useState(initialHasDefaults);
  const [defaultsBusy, setDefaultsBusy] = useState<"save" | "reset" | null>(
    null
  );

  const allTabs = canEditFooterCredit
    ? [...BASE_TABS, { key: "footerCredit" as const, label: "Footer credit" }]
    : BASE_TABS;
  const tabs = visibleTabs
    ? allTabs.filter((tab) => visibleTabs.includes(tab.key))
    : allTabs;

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

  const saveSiteIdentity = async () => {
    setSaving("site");
    try {
      for (const key of ["site", "header"] as const) {
        const res = await fetch("/api/admin/content", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, data: content[key] }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Save failed");
        }
      }
      toast.success("Saved — live site updates within about a minute");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(null);
    }
  };

  const SaveButton = ({ keyName }: { keyName: ContentKey }) =>
    hideSave ? null : (
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

  const tabPanels = (
    <>
        <TabsContent value="site" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Site identity</CardTitle>
              <CardDescription>
                Logo, site name, and description — updates header, footer, emails, checkout, and SEO.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <SiteLogoEditor
                logoImageUrl={content.header.logoImageUrl}
                logoImageAlt={content.header.logoImageAlt}
                onChange={(patch) =>
                  setContent((c) => ({
                    ...c,
                    header: { ...c.header, ...patch },
                  }))
                }
              />
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
              {!hideSave ? (
                <Button onClick={saveSiteIdentity} disabled={saving === "site"}>
                  {saving === "site" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    "Save changes"
                  )}
                </Button>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="header" className="mt-0">
          <HeaderEditor
            data={content.header}
            onChange={(header) => setContent((c) => ({ ...c, header }))}
            saveButton={<SaveButton keyName="header" />}
            canEditHelloBarSettings={canSelectHomeTemplate}
          />
        </TabsContent>

        <TabsContent value="footer" className="mt-0">
          <FooterEditor
            data={content.footer}
            onChange={(footer) => setContent((c) => ({ ...c, footer }))}
            saveButton={<SaveButton keyName="footer" />}
          />
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
                toast.success("Homepage template saved as default");
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
                toast.success("Reset theme and homepage template to default");
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
              <EditorSectionsAccordion
                sections={[
                  {
                    id: "copy",
                    title: "Newsletter copy",
                    content: (
                      <>
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
                      </>
                    ),
                  },
                ]}
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
    </>
  );

  if (embedMode && activeTab) {
    return (
      <Tabs value={activeTab} className="mt-0">
        {tabPanels}
      </Tabs>
    );
  }

  return (
    <div data-admin-flush>
      <div className="px-4 pt-4 md:px-6 md:pt-6">
        <h1 className="font-display text-2xl font-semibold text-neutral-950">
          {title}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">{description}</p>
      </div>

      <Tabs defaultValue={tabs[0]?.key ?? "site"}>
        <div className="sticky top-0 z-20 border-b border-neutral-200 bg-[var(--background)] px-4 py-2 md:px-6">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-xl bg-[var(--muted)] p-1">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.key} value={tab.key}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="space-y-6 px-4 py-6 md:px-6">{tabPanels}</div>
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
          Cursive “Made with ♥ by …” line in the storefront footer. Style color,
          size, font, and optional link on the name.
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

function SiteLogoEditor({
  logoImageUrl,
  logoImageAlt,
  onChange,
}: {
  logoImageUrl: string;
  logoImageAlt: string;
  onChange: (patch: Pick<HeaderData, "logoImageUrl" | "logoImageAlt">) => void;
}) {
  const [broken, setBroken] = useState(false);
  const trimmed = logoImageUrl.trim();
  const showPreview = trimmed.length > 0 && !broken;

  return (
    <div className="space-y-4">
      <div>
        <Label>Logo</Label>
        <p className="mt-1 text-xs text-neutral-500">
          Shown in the site header next to your site name. Use a transparent PNG or SVG.
        </p>
      </div>

      <div
        className="flex min-h-[10rem] items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-8 sm:min-h-[12rem]"
        aria-live="polite"
      >
        {showPreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={trimmed}
            alt={logoImageAlt.trim() || "Logo preview"}
            className="max-h-32 max-w-full object-contain sm:max-h-40"
            onError={() => setBroken(true)}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-neutral-400">
            <ImageIcon className="h-12 w-12 sm:h-14 sm:w-14" aria-hidden />
            <span className="text-sm">No logo yet — add a URL below</span>
          </div>
        )}
      </div>

      {trimmed && broken ? (
        <p className="text-xs text-amber-700" role="alert">
          Preview unavailable — check the URL is public and direct.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="site-logo-url">Logo image URL</Label>
          <Input
            id="site-logo-url"
            type="url"
            className="mt-2"
            value={logoImageUrl}
            placeholder="https://example.com/logo.png"
            onChange={(e) => {
              setBroken(false);
              onChange({ logoImageUrl: e.target.value, logoImageAlt });
            }}
          />
        </div>
        <div>
          <Label htmlFor="site-logo-alt">Logo alt text</Label>
          <Input
            id="site-logo-alt"
            className="mt-2"
            value={logoImageAlt}
            placeholder="Your brand name"
            onChange={(e) =>
              onChange({ logoImageUrl, logoImageAlt: e.target.value })
            }
          />
        </div>
      </div>
    </div>
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

function NavLinksEditor({
  label,
  description,
  links,
  onChange,
}: {
  label: string;
  description: string;
  links: NavLinkItem[];
  onChange: (links: NavLinkItem[]) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-neutral-900">{label}</p>
        <p className="text-xs text-neutral-500">{description}</p>
      </div>
      {links.map((link, index) => (
        <div
          key={`${link.href}-${index}`}
          className="grid gap-3 rounded-xl border border-neutral-200 p-4 sm:grid-cols-[1fr_1fr_auto]"
        >
          <Field
            label="Label"
            value={link.label}
            onChange={(v) => {
              const next = [...links];
              next[index] = { ...link, label: v };
              onChange(next);
            }}
          />
          <Field
            label="Link"
            value={link.href}
            onChange={(v) => {
              const next = [...links];
              next[index] = { ...link, href: v };
              onChange(next);
            }}
            placeholder="/shop or https://…"
          />
          <div className="flex items-end">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Remove link ${index + 1}`}
              onClick={() => onChange(links.filter((_, i) => i !== index))}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...links, { label: "", href: "" }])}
      >
        <Plus className="mr-1 h-4 w-4" /> Add link
      </Button>
    </div>
  );
}

function HeaderEditor({
  data,
  onChange,
  saveButton,
  canEditHelloBarSettings = false,
}: {
  data: HeaderData;
  onChange: (d: HeaderData) => void;
  saveButton: ReactNode;
  canEditHelloBarSettings?: boolean;
}) {
  const set = (patch: Partial<HeaderData>) => onChange({ ...data, ...patch });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Header</CardTitle>
        <CardDescription>
          Promo hello bar and main navigation. Logo is configured on the Site tab.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <EditorSectionsAccordion
          defaultOpen={["hello-bar", "nav"]}
          sections={[
            {
              id: "hello-bar",
              title: "Promo hello bar",
              content: (
                <HelloBarEditor
                  data={data.helloBar}
                  onChange={(helloBar) => set({ helloBar })}
                  canEditSettings={canEditHelloBarSettings}
                />
              ),
            },
            {
              id: "nav",
              title: "Main navigation",
              content: (
                <NavLinksEditor
                  label="Menu links"
                  description="Desktop and mobile menu links."
                  links={data.navLinks}
                  onChange={(navLinks) => set({ navLinks })}
                />
              ),
            },
          ]}
        />
        {saveButton}
      </CardContent>
    </Card>
  );
}

function FooterEditor({
  data,
  onChange,
  saveButton,
}: {
  data: FooterData;
  onChange: (d: FooterData) => void;
  saveButton: ReactNode;
}) {
  const set = (patch: Partial<FooterData>) => onChange({ ...data, ...patch });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Footer</CardTitle>
        <CardDescription>
          Banner image, tagline, trust strip, and bottom links. Newsletter and contact email stay on their own tabs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <EditorSectionsAccordion
          sections={[
            {
              id: "banner",
              title: "Banner image",
              content: (
                <>
                  <ImageUrlField
                    label="Banner image URL"
                    value={data.bannerImageUrl}
                    onChange={(bannerImageUrl) => set({ bannerImageUrl })}
                    hint="Wide landscape photo works best."
                  />
                  <Field
                    label="Banner image alt text"
                    value={data.bannerImageAlt}
                    onChange={(bannerImageAlt) => set({ bannerImageAlt })}
                  />
                </>
              ),
            },
            {
              id: "tagline",
              title: "Tagline",
              content: (
                <Field
                  label="Tagline under site name"
                  value={data.tagline}
                  onChange={(tagline) => set({ tagline })}
                />
              ),
            },
            {
              id: "trust",
              title: "Trust strip",
              content: (
                <div className="space-y-3">
                  <p className="text-xs text-neutral-500">
                    Four columns shown above the copyright row.
                  </p>
                  {data.trustItems.map((item, index) => (
                    <div
                      key={`trust-${index}`}
                      className="grid gap-3 rounded-xl border border-neutral-200 p-4 sm:grid-cols-2"
                    >
                      <Field
                        label={`Column ${index + 1} title`}
                        value={item.title}
                        onChange={(title) => {
                          const trustItems = [...data.trustItems];
                          trustItems[index] = { ...item, title };
                          set({ trustItems });
                        }}
                      />
                      <Field
                        label={`Column ${index + 1} subtitle`}
                        value={item.subtitle}
                        onChange={(subtitle) => {
                          const trustItems = [...data.trustItems];
                          trustItems[index] = { ...item, subtitle };
                          set({ trustItems });
                        }}
                      />
                    </div>
                  ))}
                </div>
              ),
            },
            {
              id: "links",
              title: "Footer links",
              content: (
                <NavLinksEditor
                  label="Essential links"
                  description="Privacy, terms, FAQ, and other essentials."
                  links={data.essentialLinks}
                  onChange={(essentialLinks) => set({ essentialLinks })}
                />
              ),
            },
          ]}
        />
        {saveButton}
      </CardContent>
    </Card>
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
        <EditorSectionsAccordion
          sections={[
            {
              id: "intro",
              title: "Page intro",
              content: (
                <>
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
                </>
              ),
            },
            {
              id: "details",
              title: "Contact details",
              content: (
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
              ),
            },
            {
              id: "form",
              title: "Contact form",
              content: (
                <Field
                  label="Form title"
                  value={data.formTitle}
                  onChange={(v) => set("formTitle", v)}
                />
              ),
            },
          ]}
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
        <EditorSectionsAccordion
          sections={[
            {
              id: "copy",
              title: "Hero copy",
              content: (
                <>
                  <Field label="Brand label" value={data.brand} onChange={(v) => set({ brand: v })} />
                  <Field label="Headline" value={data.headline} onChange={(v) => set({ headline: v })} />
                  <Field
                    label="Supporting text"
                    value={data.subheadline}
                    onChange={(v) => set({ subheadline: v })}
                    multiline
                  />
                </>
              ),
            },
            {
              id: "media",
              title: "Hero media",
              content: (
                <>
                  <ImageUrlField
                    label="Poster / fallback image URL"
                    value={data.imageUrl}
                    onChange={(v) => set({ imageUrl: v })}
                  />
                  <Field
                    label="Hero video URL (optional)"
                    value={data.videoUrl ?? ""}
                    onChange={(v) => set({ videoUrl: v || undefined })}
                    placeholder="https://...mp4 — leave empty for parallax image"
                  />
                </>
              ),
            },
            {
              id: "buttons",
              title: "Buttons",
              content: (
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
              ),
            },
          ]}
        />
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
              Picking a preset reseeds the page layout list below. You can then
              drag, add, or remove blocks.
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
                Style defaults
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
                  No default saved yet — save from here or Site style.
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
              . Edit component content below.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <HomeSectionsBuilder
        sections={data.sections}
        template={data.template}
        content={contentSource}
        canManageLayout={canSelectTemplate}
        canEditComponentSettings={canSelectTemplate}
        onChange={(sections) => onChange({ ...data, sections })}
      />

      <div className={`${adminFixedSaveBar} md:px-6`}>
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
        <EditorSectionsAccordion
          defaultOpen={["intro", "story"]}
          sections={[
            {
              id: "intro",
              title: "Page intro",
              content: (
                <>
                  <Field label="Eyebrow" value={data.eyebrow} onChange={(v) => set({ eyebrow: v })} />
                  <Field label="Title" value={data.title} onChange={(v) => set({ title: v })} />
                  <Field label="Intro" value={data.intro} onChange={(v) => set({ intro: v })} multiline />
                </>
              ),
            },
            {
              id: "story",
              title: "Story",
              content: (
                <>
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
                </>
              ),
            },
            {
              id: "values-header",
              title: "Values section",
              content: (
                <>
                  <Field
                    label="Values title"
                    value={data.valuesTitle}
                    onChange={(v) => set({ valuesTitle: v })}
                  />
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
                </>
              ),
            },
            ...data.values.map((item, i) => ({
              id: `value-${i}`,
              title: item.title.trim() || `Value ${i + 1}`,
              content: (
                <>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        set({ values: data.values.filter((_, idx) => idx !== i) })
                      }
                    >
                      <Trash2 className="mr-1 h-4 w-4" /> Remove
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
                </>
              ),
            })),
            {
              id: "cta",
              title: "Call to action",
              content: (
                <>
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
                </>
              ),
            },
          ]}
        />
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
        <EditorSectionsAccordion
          defaultOpen={["header"]}
          sections={[
            {
              id: "header",
              title: "Section header",
              content: (
                <>
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
                </>
              ),
            },
            ...data.items.map((item, i) => ({
              id: item.id,
              title: item.name.trim() || `Testimonial ${i + 1}`,
              content: (
                <>
                  <div className="flex justify-end">
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
                      <Trash2 className="mr-1 h-4 w-4" /> Remove
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
                </>
              ),
            })),
          ]}
        />
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
        <EditorSectionsAccordion
          defaultOpen={["header"]}
          sections={[
            {
              id: "header",
              title: "Page header",
              content: (
                <>
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
                </>
              ),
            },
            ...data.items.map((item, i) => ({
              id: `faq-${i}`,
              title: item.question.trim() || `Question ${i + 1}`,
              content: (
                <>
                  <div className="flex justify-end">
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
                      <Trash2 className="mr-1 h-4 w-4" /> Remove
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
                </>
              ),
            })),
          ]}
        />
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
        <EditorSectionsAccordion
          defaultOpen={["header"]}
          sections={[
            {
              id: "header",
              title: "Section header",
              content: (
                <>
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
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onChange({ ...data, images: [...data.images, ""] })}
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add image
                  </Button>
                </>
              ),
            },
            ...data.images.map((url, i) => ({
              id: `image-${i}`,
              title: `Image ${i + 1}`,
              content: (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <ImageUrlField
                      label="Image URL"
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
                    className="mt-8 shrink-0"
                    aria-label={`Remove image ${i + 1}`}
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
              ),
            })),
          ]}
        />
        {saveButton}
      </CardContent>
    </Card>
  );
}
