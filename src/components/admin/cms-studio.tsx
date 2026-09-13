"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ExternalLink,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { AllCmsContent, CmsKey } from "@/lib/cms-content";
import type { CmsPageRecord } from "@/lib/cms-pages";
import type { SectionContentSource } from "@/lib/home-sections";
import type { HomeTemplateId } from "@/lib/home-templates";
import { HOME_TEMPLATES } from "@/lib/home-templates";
import {
  adminCreatePagePanel,
  adminFixedSaveBar,
  adminTabsList,
} from "@/lib/admin-ui-classes";
import { pageKindForSlug, pagePathForSlug } from "@/lib/page-catalog";
import type { AllSiteContent, ContentKey } from "@/lib/site-content";
import { CmsExtraEditor } from "@/components/admin/cms-extra-editor";
import { HomeSectionsBuilder } from "@/components/admin/home-sections-builder";
import { PageBannerEditor } from "@/components/admin/page-banner-editor";
import {
  PageLegacyEditor,
  cmsSaveKeyForPageSlug,
  siteSaveKeyForPageSlug,
} from "@/components/admin/page-legacy-editor";
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
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
type MainTab = "site" | "header" | "footer" | "pages" | "global-copy";

type CmsStudioProps = {
  initialPages: CmsPageRecord[];
  initialSiteContent: AllSiteContent;
  initialCmsContent: AllCmsContent;
  contentSource: SectionContentSource;
  canSelectHomeTemplate: boolean;
  initialMainTab?: MainTab;
  initialGlobalCopyTab?: CmsKey;
};

export function parseCmsMainTab(value: string | null | undefined): MainTab {
  if (value && MAIN_TABS.some((tab) => tab.key === value)) {
    return value as MainTab;
  }
  return "site";
}

export function parseCmsGlobalCopyTab(value: string | null | undefined): CmsKey {
  if (value && GLOBAL_COPY_SUBTABS.some((tab) => tab.key === value)) {
    return value as CmsKey;
  }
  return "storeCopy";
}

const MAIN_TABS: { key: MainTab; label: string }[] = [
  { key: "site", label: "Site" },
  { key: "header", label: "Header" },
  { key: "footer", label: "Footer" },
  { key: "pages", label: "Pages" },
  { key: "global-copy", label: "Global copy" },
];

function pageUsesSectionBuilder(page: CmsPageRecord): boolean {
  if (page.slug === "home") return true;
  if (!page.isSystem) return true;
  return pageKindForSlug(page.slug) === "sections";
}

const GLOBAL_COPY_SUBTABS: { key: CmsKey; label: string }[] = [
  { key: "storeCopy", label: "404 & messages" },
  { key: "sizeGuide", label: "Size guide" },
  { key: "auth", label: "Auth pages" },
];

export function CmsStudio({
  initialPages,
  initialSiteContent,
  initialCmsContent,
  contentSource,
  canSelectHomeTemplate,
  initialMainTab = "site",
  initialGlobalCopyTab = "storeCopy",
}: CmsStudioProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mainTab, setMainTab] = useState<MainTab>(initialMainTab);
  const [globalCopyTab, setGlobalCopyTab] = useState<CmsKey>(initialGlobalCopyTab);
  const [siteContent, setSiteContent] = useState(initialSiteContent);
  const [cmsContent, setCmsContent] = useState(initialCmsContent);
  const [pages, setPages] = useState(initialPages);
  const [selectedPageId, setSelectedPageId] = useState(
    initialPages.find((p) => p.slug === "home")?.id ?? initialPages[0]?.id ?? ""
  );
  const [pageDraft, setPageDraft] = useState<CmsPageRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [creatingPage, setCreatingPage] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");

  const sortedPages = useMemo(
    () => [...pages].sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title)),
    [pages]
  );
  const systemPages = useMemo(
    () => sortedPages.filter((p) => p.isSystem),
    [sortedPages]
  );
  const customPages = useMemo(
    () => sortedPages.filter((p) => !p.isSystem),
    [sortedPages]
  );

  const selectedPage = pages.find((p) => p.id === selectedPageId) ?? null;

  const syncTabUrl = useCallback(
    (tab: MainTab, sub: CmsKey) => {
      const params = new URLSearchParams();
      if (tab !== "site") params.set("tab", tab);
      if (tab === "global-copy" && sub !== "storeCopy") {
        params.set("sub", sub);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router]
  );

  const handleMainTabChange = useCallback(
    (value: string) => {
      const tab = value as MainTab;
      setMainTab(tab);
      syncTabUrl(tab, globalCopyTab);
    },
    [globalCopyTab, syncTabUrl]
  );

  const handleGlobalCopyTabChange = useCallback(
    (value: string) => {
      const sub = value as CmsKey;
      setGlobalCopyTab(sub);
      syncTabUrl(mainTab, sub);
    },
    [mainTab, syncTabUrl]
  );

  useEffect(() => {
    setPageDraft(selectedPage);
  }, [selectedPage]);

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

    const res = await fetch(`/api/admin/pages/${pageDraft.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: pageDraft.title,
        slug: pageDraft.slug,
        description: pageDraft.description,
        published: pageDraft.published,
        banner: pageDraft.banner,
        ...(pageUsesSectionBuilder(pageDraft)
          ? {
              template: pageDraft.template,
              sections: pageDraft.sections,
            }
          : {}),
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || "Save failed");
    setPages((prev) =>
      prev.map((p) => (p.id === pageDraft.id ? body.page : p))
    );
    setPageDraft(body.page);

    if (pageUsesSectionBuilder(pageDraft)) return;

    const siteKey = siteSaveKeyForPageSlug(pageDraft.slug);
    if (siteKey) {
      await saveSiteKey(siteKey);
      return;
    }

    const cmsKey = cmsSaveKeyForPageSlug(pageDraft.slug);
    if (cmsKey) {
      const cmsRes = await fetch("/api/admin/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: cmsKey, data: cmsContent[cmsKey] }),
      });
      const cmsBody = await cmsRes.json().catch(() => ({}));
      if (!cmsRes.ok) throw new Error(cmsBody.error || "Save failed");
    }
  };

  const saveGlobalCopyTab = async () => {
    const res = await fetch("/api/admin/cms", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: globalCopyTab,
        data: cmsContent[globalCopyTab],
      }),
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
        case "global-copy":
          await saveGlobalCopyTab();
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

  const deletePage = async (id: string, title: string) => {
    if (
      !confirm(
        `Delete "${title}"? This page and all of its components will be removed permanently.`
      )
    ) {
      return;
    }
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

  const usesSectionBuilder = pageDraft
    ? pageUsesSectionBuilder(pageDraft)
    : false;

  return (
    <div data-admin-flush className="pb-28">
      <div className="px-4 pt-4 md:px-6 md:pt-6">
        <h1 className="font-display text-2xl font-semibold text-neutral-950">
          Page content
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-neutral-500">
          Create pages, add components like the homepage, and edit site-wide copy.
        </p>
      </div>

      <Tabs value={mainTab} onValueChange={handleMainTabChange}>
        <div className="sticky top-0 z-20 border-b border-neutral-200 bg-[var(--background)] px-4 py-2 md:px-6">
          <TabsList className={adminTabsList}>
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
              canSelectHomeTemplate={canSelectHomeTemplate}
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
            <Card className={adminCreatePagePanel}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Create a new page</CardTitle>
                <CardDescription>
                  e.g. About us or a lookbook — then add hero blocks, image grids,
                  and more below, just like the homepage.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
                  <div className="space-y-2">
                    <Label htmlFor="new-page-title">Page title</Label>
                    <Input
                      id="new-page-title"
                      className="h-11"
                      value={newTitle}
                      placeholder="About us"
                      onChange={(e) => {
                        setNewTitle(e.target.value);
                        setNewSlug(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/^-+|-+$/g, "")
                        );
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-page-slug">URL slug</Label>
                    <Input
                      id="new-page-slug"
                      className="h-11"
                      value={newSlug}
                      placeholder="about-us"
                      onChange={(e) => setNewSlug(e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    className="h-11 w-full shrink-0 md:w-auto"
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
                    Create page
                  </Button>
                </div>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Live at /{newSlug || "your-slug"} when published
                </p>
              </CardContent>
            </Card>

            {pageDraft ? (
              <>
                <Card>
                  <CardHeader>
                    <div className="space-y-2">
                      <Label htmlFor="page-picker">Page</Label>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Select
                          value={pageDraft.id}
                          onValueChange={setSelectedPageId}
                        >
                          <SelectTrigger id="page-picker" className="h-11 sm:flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {systemPages.map((page) => (
                                <SelectItem key={page.id} value={page.id}>
                                  {page.title}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                            {customPages.length > 0 ? (
                              <SelectGroup>
                                {customPages.map((page) => (
                                  <SelectItem key={page.id} value={page.id}>
                                    {page.title}
                                    {!page.published ? " (draft)" : ""}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            ) : null}
                          </SelectContent>
                        </Select>
                        <div className="flex shrink-0 items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-11"
                            asChild
                          >
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
                              className="h-11 text-red-600"
                              onClick={() =>
                                void deletePage(pageDraft.id, pageDraft.title)
                              }
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          ) : null}
                        </div>
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
                  </CardHeader>
                  {usesSectionBuilder ? (
                    <CardContent className="space-y-4 border-t border-[var(--border)] pt-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input
                            className="h-11"
                            value={pageDraft.title}
                            onChange={(e) =>
                              setPageDraft({
                                ...pageDraft,
                                title: e.target.value,
                              })
                            }
                          />
                        </div>
                        {!pageDraft.isSystem ? (
                          <div className="space-y-2">
                            <Label>Slug</Label>
                            <Input
                              className="h-11"
                              value={pageDraft.slug}
                              onChange={(e) =>
                                setPageDraft({
                                  ...pageDraft,
                                  slug: e.target.value,
                                })
                              }
                            />
                          </div>
                        ) : null}
                        {pageDraft.slug === "home" && canSelectHomeTemplate ? (
                          <div className="flex items-end gap-2 sm:col-span-2">
                            <div className="space-y-2">
                              <Label>Home template</Label>
                              <Select
                                value={
                                  (pageDraft.template as HomeTemplateId) ??
                                  "editorial"
                                }
                                onValueChange={(v) =>
                                  setPageDraft({ ...pageDraft, template: v })
                                }
                              >
                                <SelectTrigger className="h-11 w-[200px]">
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
                          </div>
                        ) : null}
                        {!pageDraft.isSystem ? (
                          <>
                            <div className="space-y-2 sm:col-span-2">
                              <Label>Description (optional)</Label>
                              <Textarea
                                rows={2}
                                value={pageDraft.description ?? ""}
                                onChange={(e) =>
                                  setPageDraft({
                                    ...pageDraft,
                                    description: e.target.value || null,
                                  })
                                }
                              />
                            </div>
                            <label className="flex items-center gap-2 text-sm sm:col-span-2">
                              <Checkbox
                                checked={pageDraft.published}
                                onCheckedChange={(v) =>
                                  setPageDraft({
                                    ...pageDraft,
                                    published: v === true,
                                  })
                                }
                              />
                              Published — visible at{" "}
                              {pagePathForSlug(pageDraft.slug)}
                            </label>
                          </>
                        ) : null}
                      </div>
                    </CardContent>
                  ) : null}
                </Card>

                <PageBannerEditor
                  banner={pageDraft.banner}
                  pageTitle={pageDraft.title}
                  canEditComponentSettings={canSelectHomeTemplate}
                  onChange={(banner) =>
                    setPageDraft({ ...pageDraft, banner })
                  }
                />

                {usesSectionBuilder ? (
                  <HomeSectionsBuilder
                    sections={pageDraft.sections ?? []}
                    template={
                      (pageDraft.template as HomeTemplateId) ?? "editorial"
                    }
                    content={contentSource}
                    canManageLayout
                    canEditComponentSettings={canSelectHomeTemplate}
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
              </>
            ) : (
              <Card>
                <CardContent className="py-10 text-center text-sm text-neutral-500">
                  No pages available.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="global-copy" className="mt-0 space-y-4">
            <p className="text-sm text-[var(--muted-foreground)]">
              Site-wide strings that are not tied to a single page — 404 screen,
              cart empty state, checkout messages, size guide, and login/register
              copy. Page-specific content (Collections, Legal, Shop empty catalog)
              is under <strong>Pages</strong>.
            </p>
            <Tabs value={globalCopyTab} onValueChange={handleGlobalCopyTabChange}>
              <TabsList className={`mb-4 ${adminTabsList}`}>
                {GLOBAL_COPY_SUBTABS.map((tab) => (
                  <TabsTrigger key={tab.key} value={tab.key}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <CmsExtraEditor
              key={globalCopyTab}
              initialContent={cmsContent}
              content={cmsContent}
              onContentChange={setCmsContent}
              hideSave
              hideHeader
              singleTab={globalCopyTab}
              canEditComponentSettings={canSelectHomeTemplate}
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
    <div className={adminFixedSaveBar}>
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
