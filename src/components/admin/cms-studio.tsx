"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ExternalLink,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { AllCmsContent, CmsKey } from "@/lib/cms-content";
import type { CmsComponentRecord } from "@/lib/cms-components";
import type { CmsPageRecord } from "@/lib/cms-pages";
import {
  HOME_SECTION_CATALOG,
  componentSettingsFieldsForType,
  defaultPropsForSection,
  editableFieldsForType,
  sectionLabel,
  type HomeSectionProps,
  type HomeSectionType,
  type SectionContentSource,
} from "@/lib/home-sections";
import type { HomeTemplateId } from "@/lib/home-templates";
import { HOME_TEMPLATES } from "@/lib/home-templates";
import { pageKindForSlug, pagePathForSlug } from "@/lib/page-catalog";
import type { AllSiteContent, ContentKey } from "@/lib/site-content";
import { CmsExtraEditor } from "@/components/admin/cms-extra-editor";
import { HomeSectionsBuilder } from "@/components/admin/home-sections-builder";
import {
  PageLegacyEditor,
  cmsSaveKeyForPageSlug,
  siteSaveKeyForPageSlug,
} from "@/components/admin/page-legacy-editor";
import { SectionFieldGrid } from "@/components/admin/section-field-grid";
import { SiteContentEditor } from "@/components/admin/site-content-editor";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type MainTab =
  | "site"
  | "header"
  | "footer"
  | "pages"
  | "components"
  | "store-copy";

type CmsStudioProps = {
  initialPages: CmsPageRecord[];
  initialComponents: CmsComponentRecord[];
  initialSiteContent: AllSiteContent;
  initialCmsContent: AllCmsContent;
  contentSource: SectionContentSource;
  canSelectHomeTemplate: boolean;
};

const MAIN_TABS: { key: MainTab; label: string }[] = [
  { key: "site", label: "Site" },
  { key: "header", label: "Header" },
  { key: "footer", label: "Footer" },
  { key: "pages", label: "Pages" },
  { key: "components", label: "Components" },
  { key: "store-copy", label: "Store copy" },
];

const STORE_COPY_SUBTABS: { key: CmsKey; label: string }[] = [
  { key: "collections", label: "Collections" },
  { key: "legal", label: "Legal" },
  { key: "storeCopy", label: "Empty states" },
  { key: "sizeGuide", label: "Size guide" },
  { key: "auth", label: "Auth pages" },
];

export function CmsStudio({
  initialPages,
  initialComponents,
  initialSiteContent,
  initialCmsContent,
  contentSource,
  canSelectHomeTemplate,
}: CmsStudioProps) {
  const [mainTab, setMainTab] = useState<MainTab>("pages");
  const [storeCopyTab, setStoreCopyTab] = useState<CmsKey>("collections");
  const [siteContent, setSiteContent] = useState(initialSiteContent);
  const [cmsContent, setCmsContent] = useState(initialCmsContent);
  const [pages, setPages] = useState(initialPages);
  const [components, setComponents] = useState(initialComponents);
  const [selectedPageId, setSelectedPageId] = useState(
    initialPages.find((p) => p.slug === "home")?.id ?? initialPages[0]?.id ?? ""
  );
  const [selectedComponentId, setSelectedComponentId] = useState(
    initialComponents[0]?.id ?? ""
  );
  const [pageDraft, setPageDraft] = useState<CmsPageRecord | null>(null);
  const [componentDraft, setComponentDraft] = useState<CmsComponentRecord | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const [creatingPage, setCreatingPage] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");

  const sortedPages = useMemo(
    () => [...pages].sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title)),
    [pages]
  );

  const selectedPage = pages.find((p) => p.id === selectedPageId) ?? null;
  const selectedComponent =
    components.find((c) => c.id === selectedComponentId) ?? null;

  const libraryRefs = useMemo(
    () => components.map((c) => ({ id: c.id, name: c.name, type: c.type })),
    [components]
  );

  useEffect(() => {
    setPageDraft(selectedPage);
  }, [selectedPage]);

  useEffect(() => {
    setComponentDraft(selectedComponent);
  }, [selectedComponent]);

  const focusComponent = useCallback((id: string) => {
    setMainTab("components");
    setSelectedComponentId(id);
  }, []);

  const saveSiteKey = async (key: ContentKey, data?: unknown) => {
    const payload = data ?? siteContent[key];
    const res = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, data: payload }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Save failed");
    }
  };

  const saveSiteTab = async () => {
    await saveSiteKey("site");
    await saveSiteKey("header", {
      ...siteContent.header,
      logoImageUrl: siteContent.header.logoImageUrl,
      logoImageAlt: siteContent.header.logoImageAlt,
    });
  };

  const savePage = async () => {
    if (!pageDraft) return;
    const kind = pageKindForSlug(pageDraft.slug);

    if (kind === "sections") {
      const res = await fetch(`/api/admin/pages/${pageDraft.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: pageDraft.title,
          slug: pageDraft.slug,
          description: pageDraft.description,
          published: pageDraft.published,
          template: pageDraft.template,
          sections: pageDraft.sections,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Save failed");
      setPages((prev) =>
        prev.map((p) => (p.id === pageDraft.id ? body.page : p))
      );
      setPageDraft(body.page);
      return;
    }

    const siteKey = siteSaveKeyForPageSlug(pageDraft.slug);
    if (siteKey) {
      await saveSiteKey(siteKey);
      return;
    }

    const cmsKey = cmsSaveKeyForPageSlug(pageDraft.slug);
    if (cmsKey) {
      const res = await fetch("/api/admin/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: cmsKey, data: cmsContent[cmsKey] }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Save failed");
    }
  };

  const saveComponent = async () => {
    if (!componentDraft) return;
    const res = await fetch(`/api/admin/components/${componentDraft.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: componentDraft.name,
        type: componentDraft.type,
        description: componentDraft.description,
        props: componentDraft.props,
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || "Save failed");
    setComponents((prev) =>
      prev.map((c) => (c.id === componentDraft.id ? body.component : c))
    );
    setComponentDraft(body.component);
  };

  const saveStoreCopyTab = async () => {
    const res = await fetch("/api/admin/cms", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: storeCopyTab, data: cmsContent[storeCopyTab] }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || "Save failed");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      switch (mainTab) {
        case "site":
          await saveSiteTab();
          break;
        case "header":
          await saveSiteKey("header");
          break;
        case "footer":
          await saveSiteKey("footer");
          break;
        case "pages":
          await savePage();
          break;
        case "components":
          await saveComponent();
          break;
        case "store-copy":
          await saveStoreCopyTab();
          break;
      }
      toast.success("Saved — live site updates within about a minute");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  const createPage = async () => {
    setCreatingPage(true);
    try {
      const res = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          slug: newSlug.trim(),
          published: false,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Create failed");
      const refresh = await fetch("/api/admin/pages");
      const data = await refresh.json();
      setPages(data.pages);
      setSelectedPageId(body.page.id);
      setNewTitle("");
      setNewSlug("");
      toast.success("Page created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create page");
    } finally {
      setCreatingPage(false);
    }
  };

  const deletePage = async (id: string) => {
    if (!confirm("Delete this page? This cannot be undone.")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/pages/${id}`, { method: "DELETE" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Delete failed");
      const next = pages.filter((p) => p.id !== id);
      setPages(next);
      setSelectedPageId(next[0]?.id ?? "");
      toast.success("Page deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete page");
    } finally {
      setSaving(false);
    }
  };

  const createComponent = async (name: string, type: HomeSectionType) => {
    setSaving(true);
    try {
      const props = defaultPropsForSection(type, contentSource);
      const res = await fetch("/api/admin/components", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type, props }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Create failed");
      const refresh = await fetch("/api/admin/components");
      const data = await refresh.json();
      setComponents(data.components);
      setSelectedComponentId(body.component.id);
      setMainTab("components");
      toast.success("Component created");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not create component"
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteComponent = async (id: string) => {
    if (!confirm("Delete this component from the library?")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/components/${id}`, { method: "DELETE" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Delete failed");
      const next = components.filter((c) => c.id !== id);
      setComponents(next);
      setSelectedComponentId(next[0]?.id ?? "");
      toast.success("Component deleted");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not delete component"
      );
    } finally {
      setSaving(false);
    }
  };

  const pageKind = pageDraft ? pageKindForSlug(pageDraft.slug) : "sections";
  const usesSections = pageKind === "sections";

  return (
    <div data-admin-flush className="pb-24">
      <div className="px-4 pt-4 md:px-6 md:pt-6">
        <h1 className="font-display text-2xl font-semibold text-neutral-950">
          Page content
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-neutral-500">
          Site identity, page layouts, reusable components, and storefront copy —
          all in one place.
        </p>
      </div>

      <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as MainTab)}>
        <div className="sticky top-0 z-20 border-b border-neutral-200 bg-[var(--background)] px-4 py-2 md:px-6">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-xl bg-[var(--muted)] p-1">
            {MAIN_TABS.map((tab) => (
              <TabsTrigger key={tab.key} value={tab.key}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="space-y-6 px-4 py-6 md:px-6">
          <TabsContent value="site" className="mt-0">
            <SiteContentEditor
              initialContent={siteContent}
              content={siteContent}
              onContentChange={setSiteContent}
              embedMode
              activeTab="site"
              hideSave
            />
          </TabsContent>

          <TabsContent value="header" className="mt-0">
            <SiteContentEditor
              initialContent={siteContent}
              content={siteContent}
              onContentChange={setSiteContent}
              embedMode
              activeTab="header"
              hideSave
            />
          </TabsContent>

          <TabsContent value="footer" className="mt-0">
            <SiteContentEditor
              initialContent={siteContent}
              content={siteContent}
              onContentChange={setSiteContent}
              embedMode
              activeTab="footer"
              hideSave
            />
          </TabsContent>

          <TabsContent value="pages" className="mt-0 space-y-6">
            {pageDraft ? (
              <>
                <Card>
                  <CardHeader className="gap-4 space-y-0 sm:flex-row sm:items-end sm:justify-between">
                    <div className="min-w-0 flex-1 space-y-3">
                      <div>
                        <Label htmlFor="page-picker">Page</Label>
                        <Select
                          value={pageDraft.id}
                          onValueChange={setSelectedPageId}
                        >
                          <SelectTrigger id="page-picker" className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {sortedPages.map((page) => (
                              <SelectItem key={page.id} value={page.id}>
                                {page.title}
                                {!page.isSystem && !page.published
                                  ? " (draft)"
                                  : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <p className="text-xs text-neutral-500">
                        Live at{" "}
                        <a
                          href={pagePathForSlug(pageDraft.slug)}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-neutral-800 underline-offset-2 hover:underline"
                        >
                          {pagePathForSlug(pageDraft.slug)}
                        </a>
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={pagePathForSlug(pageDraft.slug)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Preview
                        </a>
                      </Button>
                      {!pageDraft.isSystem ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          onClick={() => void deletePage(pageDraft.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      ) : null}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {usesSections ? (
                      <>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <Label>Title</Label>
                            <Input
                              className="mt-1"
                              value={pageDraft.title}
                              onChange={(e) =>
                                setPageDraft({ ...pageDraft, title: e.target.value })
                              }
                            />
                          </div>
                          {!pageDraft.isSystem ? (
                            <div>
                              <Label>Slug</Label>
                              <Input
                                className="mt-1"
                                value={pageDraft.slug}
                                onChange={(e) =>
                                  setPageDraft({ ...pageDraft, slug: e.target.value })
                                }
                              />
                            </div>
                          ) : null}
                        </div>
                        {pageDraft.slug === "home" &&
                        canSelectHomeTemplate ? (
                          <div className="flex items-center gap-2">
                            <Label className="text-sm">Home template</Label>
                            <Select
                              value={
                                (pageDraft.template as HomeTemplateId) ??
                                "editorial"
                              }
                              onValueChange={(v) =>
                                setPageDraft({ ...pageDraft, template: v })
                              }
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {HOME_TEMPLATES.map((t) => (
                                  <SelectItem key={t.id} value={t.id}>
                                    {t.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ) : null}
                        {!pageDraft.isSystem ? (
                          <label className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={pageDraft.published}
                              onCheckedChange={(v) =>
                                setPageDraft({
                                  ...pageDraft,
                                  published: v === true,
                                })
                              }
                            />
                            Published
                          </label>
                        ) : null}
                      </>
                    ) : null}
                  </CardContent>
                </Card>

                {usesSections ? (
                  <HomeSectionsBuilder
                    sections={pageDraft.sections}
                    template={
                      (pageDraft.template as HomeTemplateId) ?? "editorial"
                    }
                    content={contentSource}
                    canManageLayout
                    libraryComponents={libraryRefs}
                    onEditLibraryComponent={focusComponent}
                    pageLabel={pageDraft.title}
                    onChange={(sections) =>
                      setPageDraft({ ...pageDraft, sections })
                    }
                  />
                ) : (
                  <PageLegacyEditor
                    pageSlug={pageDraft.slug}
                    siteContent={siteContent}
                    onSiteContentChange={setSiteContent}
                    cmsContent={cmsContent}
                    onCmsContentChange={setCmsContent}
                  />
                )}

                {!pageDraft.isSystem ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Add custom page</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
                      <div className="flex-1 space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={newTitle}
                          placeholder="Landing page title"
                          onChange={(e) => {
                            setNewTitle(e.target.value);
                            if (!newSlug) {
                              setNewSlug(
                                e.target.value
                                  .toLowerCase()
                                  .replace(/[^a-z0-9]+/g, "-")
                                  .replace(/^-+|-+$/g, "")
                              );
                            }
                          }}
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <Label>Slug</Label>
                        <Input
                          value={newSlug}
                          placeholder="my-page"
                          onChange={(e) => setNewSlug(e.target.value)}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={
                          creatingPage || !newTitle.trim() || !newSlug.trim()
                        }
                        onClick={() => void createPage()}
                      >
                        {creatingPage ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="mr-2 h-4 w-4" />
                        )}
                        Create
                      </Button>
                    </CardContent>
                  </Card>
                ) : null}
              </>
            ) : (
              <Card>
                <CardContent className="py-10 text-center text-sm text-neutral-500">
                  No pages available.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="components" className="mt-0">
            <ComponentsPanel
              components={components}
              draft={componentDraft}
              onSelect={setSelectedComponentId}
              onDraftChange={setComponentDraft}
              onCreate={createComponent}
              onDelete={deleteComponent}
              contentSource={contentSource}
            />
          </TabsContent>

          <TabsContent value="store-copy" className="mt-0 space-y-4">
            <p className="text-sm text-neutral-500">
              Global storefront strings — size guide, empty states, login copy, and
              more. Legal page bodies are edited under Pages → Privacy / Terms /
              Shipping.
            </p>
            <Tabs
              value={storeCopyTab}
              onValueChange={(v) => setStoreCopyTab(v as CmsKey)}
            >
              <TabsList className="mb-4 flex h-auto flex-wrap gap-1">
                {STORE_COPY_SUBTABS.map((tab) => (
                  <TabsTrigger key={tab.key} value={tab.key}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <CmsExtraEditor
              key={storeCopyTab}
              initialContent={cmsContent}
              content={cmsContent}
              onContentChange={setCmsContent}
              hideSave
              hideHeader
              singleTab={storeCopyTab}
            />
          </TabsContent>
        </div>
      </Tabs>

      <FixedSaveBar saving={saving} onSave={() => void handleSave()} />
    </div>
  );
}

function FixedSaveBar({
  saving,
  onSave,
}: {
  saving: boolean;
  onSave: () => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-neutral-200 bg-[var(--background)]/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/80 lg:left-64">
      <div className="flex justify-end">
        <Button onClick={onSave} disabled={saving} size="lg">
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save changes
        </Button>
      </div>
    </div>
  );
}

function ComponentsPanel({
  components,
  draft,
  onSelect,
  onDraftChange,
  onCreate,
  onDelete,
  contentSource,
}: {
  components: CmsComponentRecord[];
  draft: CmsComponentRecord | null;
  onSelect: (id: string) => void;
  onDraftChange: (c: CmsComponentRecord | null) => void;
  onCreate: (name: string, type: HomeSectionType) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  contentSource: SectionContentSource;
}) {
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<HomeSectionType>("heroStatic");

  const setProp = (
    key: keyof HomeSectionProps,
    value: string | number | undefined
  ) => {
    if (!draft) return;
    const props: HomeSectionProps = { ...(draft.props ?? {}) };
    if (value === undefined || value === "") {
      delete props[key];
    } else if (key === "productLimit") {
      const n = Number(value);
      if (!n) delete props.productLimit;
      else props.productLimit = n;
    } else {
      (props as Record<string, string>)[key] = String(value);
    }
    onDraftChange({
      ...draft,
      props: Object.keys(props).length > 0 ? props : {},
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
      <Card className="h-fit lg:sticky lg:top-24">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Component library</CardTitle>
          <CardDescription>
            Reusable blocks — edit once, use on any page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {components.length === 0 ? (
            <p className="text-sm text-neutral-500">No components yet.</p>
          ) : (
            <ul className="space-y-1">
              {components.map((component) => (
                <li key={component.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(component.id)}
                    className={`flex w-full flex-col rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      component.id === draft?.id
                        ? "bg-neutral-950 text-white"
                        : "text-neutral-700 hover:bg-neutral-100"
                    }`}
                  >
                    <span className="truncate font-medium">{component.name}</span>
                    <span
                      className={`text-xs ${
                        component.id === draft?.id
                          ? "text-neutral-300"
                          : "text-neutral-500"
                      }`}
                    >
                      {sectionLabel(component.type)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="space-y-2 border-t border-neutral-100 pt-3">
            <Label className="text-xs">New component</Label>
            <Input
              placeholder="Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Select
              value={newType}
              onValueChange={(v) => setNewType(v as HomeSectionType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HOME_SECTION_CATALOG.map((item) => (
                  <SelectItem key={item.type} value={item.type}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              disabled={!newName.trim()}
              onClick={() =>
                void onCreate(newName.trim(), newType).then(() => setNewName(""))
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Create
            </Button>
          </div>
        </CardContent>
      </Card>

      {!draft ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-neutral-500">
            Select or create a component.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>{draft.name}</CardTitle>
              <CardDescription>
                {sectionLabel(draft.type)} — updates every page using this block.
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600"
              onClick={() => void onDelete(draft.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Name</Label>
                <Input
                  className="mt-1"
                  value={draft.name}
                  onChange={(e) =>
                    onDraftChange({ ...draft, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Block type</Label>
                <Select
                  value={draft.type}
                  onValueChange={(v) =>
                    onDraftChange({ ...draft, type: v as HomeSectionType })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HOME_SECTION_CATALOG.map((item) => (
                      <SelectItem key={item.type} value={item.type}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <ComponentFieldsEditor
              type={draft.type}
              props={draft.props}
              contentSource={contentSource}
              onSetProp={setProp}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ComponentFieldsEditor({
  type,
  props,
  contentSource,
  onSetProp,
}: {
  type: HomeSectionType;
  props: HomeSectionProps;
  contentSource: SectionContentSource;
  onSetProp: (
    key: keyof HomeSectionProps,
    value: string | number | undefined
  ) => void;
}) {
  const contentFields = editableFieldsForType(type);
  const settingsFields = componentSettingsFieldsForType(type);
  const defaults = defaultPropsForSection(type, contentSource);
  const section = { id: "library", type, enabled: true, props };

  return (
    <div className="space-y-4 border-t border-neutral-100 pt-4">
      {contentFields.length > 0 ? (
        <SectionFieldGrid
          section={section}
          fields={contentFields}
          defaults={defaults}
          onSetProp={onSetProp}
        />
      ) : (
        <p className="text-sm text-neutral-500">No editable fields.</p>
      )}
      {settingsFields.length > 0 ? (
        <Accordion type="single" collapsible>
          <AccordionItem value="settings" className="border-none">
            <AccordionTrigger className="py-2 text-xs font-medium text-neutral-700 hover:no-underline">
              Spacing & layout
            </AccordionTrigger>
            <AccordionContent className="pb-1 pt-2">
              <SectionFieldGrid
                section={section}
                fields={settingsFields}
                defaults={defaults}
                onSetProp={onSetProp}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ) : null}
    </div>
  );
}
