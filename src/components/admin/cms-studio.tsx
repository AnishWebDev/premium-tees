"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  FileText,
  Layers,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
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
import { HomeSectionsBuilder } from "@/components/admin/home-sections-builder";
import { SectionFieldGrid } from "@/components/admin/section-field-grid";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

type CmsStudioProps = {
  initialPages: CmsPageRecord[];
  initialComponents: CmsComponentRecord[];
  contentSource: SectionContentSource;
  canManageLayout: boolean;
  canSelectHomeTemplate: boolean;
};

export function CmsStudio({
  initialPages,
  initialComponents,
  contentSource,
  canManageLayout,
  canSelectHomeTemplate,
}: CmsStudioProps) {
  const [studioTab, setStudioTab] = useState<"pages" | "components">("pages");
  const [pages, setPages] = useState(initialPages);
  const [components, setComponents] = useState(initialComponents);
  const [selectedPageId, setSelectedPageId] = useState(
    initialPages.find((p) => p.slug === "home")?.id ?? initialPages[0]?.id ?? ""
  );
  const [selectedComponentId, setSelectedComponentId] = useState(
    initialComponents[0]?.id ?? ""
  );
  const [pageBusy, setPageBusy] = useState(false);
  const [componentBusy, setComponentBusy] = useState(false);
  const [creatingPage, setCreatingPage] = useState(false);

  const selectedPage = pages.find((p) => p.id === selectedPageId) ?? null;
  const selectedComponent =
    components.find((c) => c.id === selectedComponentId) ?? null;

  const libraryRefs = useMemo(
    () =>
      components.map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type,
      })),
    [components]
  );

  const focusComponent = useCallback((id: string) => {
    setStudioTab("components");
    setSelectedComponentId(id);
  }, []);

  const refreshPages = async () => {
    const res = await fetch("/api/admin/pages");
    if (!res.ok) throw new Error("Failed to refresh pages");
    const data = await res.json();
    setPages(data.pages);
  };

  const refreshComponents = async () => {
    const res = await fetch("/api/admin/components");
    if (!res.ok) throw new Error("Failed to refresh components");
    const data = await res.json();
    setComponents(data.components);
  };

  const savePage = async (patch: Partial<CmsPageRecord>) => {
    if (!selectedPage) return;
    setPageBusy(true);
    try {
      const res = await fetch(`/api/admin/pages/${selectedPage.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Save failed");
      setPages((prev) =>
        prev.map((p) => (p.id === selectedPage.id ? body.page : p))
      );
      toast.success("Page saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save page");
    } finally {
      setPageBusy(false);
    }
  };

  const createPage = async (input: {
    title: string;
    slug: string;
    description?: string;
  }) => {
    setCreatingPage(true);
    try {
      const res = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, published: false }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Create failed");
      await refreshPages();
      setSelectedPageId(body.page.id);
      toast.success("Page created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create page");
    } finally {
      setCreatingPage(false);
    }
  };

  const deletePage = async (id: string) => {
    if (!confirm("Delete this page? This cannot be undone.")) return;
    setPageBusy(true);
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
      setPageBusy(false);
    }
  };

  const saveComponent = async (patch: Partial<CmsComponentRecord>) => {
    if (!selectedComponent) return;
    setComponentBusy(true);
    try {
      const res = await fetch(`/api/admin/components/${selectedComponent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Save failed");
      setComponents((prev) =>
        prev.map((c) => (c.id === selectedComponent.id ? body.component : c))
      );
      toast.success("Component saved — updates every page that uses it");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not save component"
      );
    } finally {
      setComponentBusy(false);
    }
  };

  const createComponent = async (input: {
    name: string;
    type: HomeSectionType;
  }) => {
    setComponentBusy(true);
    try {
      const props = defaultPropsForSection(input.type, contentSource);
      const res = await fetch("/api/admin/components", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, props }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Create failed");
      await refreshComponents();
      setSelectedComponentId(body.component.id);
      setStudioTab("components");
      toast.success("Component created");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not create component"
      );
    } finally {
      setComponentBusy(false);
    }
  };

  const deleteComponent = async (id: string) => {
    if (
      !confirm(
        "Delete this component from the library? Pages that reference it will show the block without library content."
      )
    ) {
      return;
    }
    setComponentBusy(true);
    try {
      const res = await fetch(`/api/admin/components/${id}`, {
        method: "DELETE",
      });
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
      setComponentBusy(false);
    }
  };

  return (
    <div data-admin-flush>
      <div className="px-4 pt-4 md:px-6 md:pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-neutral-950">
              Pages & components
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-neutral-500">
              Build pages by arranging sections. Save sections to the component
              library once and reuse them across pages.
            </p>
          </div>
          <Button variant="outline" size="sm" asChild className="shrink-0">
            <Link href="/admin/site-global">
              Site logo, header & footer →
            </Link>
          </Button>
        </div>
      </div>

      <Tabs
        value={studioTab}
        onValueChange={(v) => setStudioTab(v as "pages" | "components")}
      >
        <div className="sticky top-0 z-20 border-b border-neutral-200 bg-[var(--background)] px-4 py-2 md:px-6">
          <TabsList className="grid h-auto w-full max-w-md grid-cols-2 gap-1 rounded-xl bg-[var(--muted)] p-1">
            <TabsTrigger value="pages" className="gap-2">
              <FileText className="h-4 w-4" />
              Pages
            </TabsTrigger>
            <TabsTrigger value="components" className="gap-2">
              <Layers className="h-4 w-4" />
              Components
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="px-4 py-6 md:px-6">
          <TabsContent value="pages" className="mt-0">
            <PagesPanel
              pages={pages}
              selectedPage={selectedPage}
              onSelect={setSelectedPageId}
              onSave={savePage}
              onCreate={createPage}
              onDelete={deletePage}
              busy={pageBusy}
              creating={creatingPage}
              contentSource={contentSource}
              canManageLayout={canManageLayout}
              canSelectHomeTemplate={canSelectHomeTemplate}
              libraryComponents={libraryRefs}
              onEditLibraryComponent={focusComponent}
            />
          </TabsContent>

          <TabsContent value="components" className="mt-0">
            <ComponentsPanel
              components={components}
              selected={selectedComponent}
              onSelect={setSelectedComponentId}
              onSave={saveComponent}
              onCreate={createComponent}
              onDelete={deleteComponent}
              busy={componentBusy}
              contentSource={contentSource}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function PagesPanel({
  pages,
  selectedPage,
  onSelect,
  onSave,
  onCreate,
  onDelete,
  busy,
  creating,
  contentSource,
  canManageLayout,
  canSelectHomeTemplate,
  libraryComponents,
  onEditLibraryComponent,
}: {
  pages: CmsPageRecord[];
  selectedPage: CmsPageRecord | null;
  onSelect: (id: string) => void;
  onSave: (patch: Partial<CmsPageRecord>) => Promise<void>;
  onCreate: (input: {
    title: string;
    slug: string;
    description?: string;
  }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  busy: boolean;
  creating: boolean;
  contentSource: SectionContentSource;
  canManageLayout: boolean;
  canSelectHomeTemplate: boolean;
  libraryComponents: { id: string; name: string; type: HomeSectionType }[];
  onEditLibraryComponent: (id: string) => void;
}) {
  const [draft, setDraft] = useState<CmsPageRecord | null>(selectedPage);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");

  useEffect(() => {
    setDraft(selectedPage);
  }, [selectedPage]);

  if (!draft) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-neutral-500">
          No pages yet. Create one to get started.
        </CardContent>
      </Card>
    );
  }

  const pageUrl =
    draft.slug === "home" ? "/" : `/pages/${draft.slug}`;

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
      <Card className="h-fit lg:sticky lg:top-24">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All pages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="space-y-1">
            {pages.map((page) => (
              <li key={page.id}>
                <button
                  type="button"
                  onClick={() => onSelect(page.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    page.id === draft.id
                      ? "bg-neutral-950 text-white"
                      : "text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  <span className="truncate font-medium">{page.title}</span>
                  {!page.published && page.slug !== "home" ? (
                    <span className="ml-2 shrink-0 text-[10px] uppercase tracking-wide opacity-70">
                      Draft
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>

          <div className="space-y-2 border-t border-neutral-100 pt-3">
            <Label className="text-xs">New page</Label>
            <Input
              placeholder="Title"
              value={newTitle}
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
            <Input
              placeholder="slug"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
            />
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              disabled={creating || !newTitle.trim() || !newSlug.trim()}
              onClick={() => {
                void onCreate({
                  title: newTitle.trim(),
                  slug: newSlug.trim(),
                }).then(() => {
                  setNewTitle("");
                  setNewSlug("");
                });
              }}
            >
              {creating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Create page
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>{draft.title}</CardTitle>
              <CardDescription>
                {draft.slug === "home"
                  ? "Your storefront homepage at /"
                  : `Published at /pages/${draft.slug}`}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={pageUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Preview
                </a>
              </Button>
              {!draft.isSystem ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600"
                  disabled={busy}
                  onClick={() => void onDelete(draft.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Title</Label>
                <Input
                  className="mt-1"
                  value={draft.title}
                  onChange={(e) =>
                    setDraft({ ...draft, title: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input
                  className="mt-1"
                  value={draft.slug}
                  disabled={draft.isSystem}
                  onChange={(e) =>
                    setDraft({ ...draft, slug: e.target.value })
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Description (optional)</Label>
                <Textarea
                  className="mt-1"
                  rows={2}
                  value={draft.description ?? ""}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      description: e.target.value || null,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {draft.slug !== "home" ? (
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={draft.published}
                    onCheckedChange={(v) =>
                      setDraft({ ...draft, published: v === true })
                    }
                  />
                  Published
                </label>
              ) : null}
              {canSelectHomeTemplate && draft.slug === "home" ? (
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Home template</Label>
                  <Select
                    value={(draft.template as HomeTemplateId) ?? "editorial"}
                    onValueChange={(v) =>
                      setDraft({ ...draft, template: v })
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
            </div>

            <Button
              disabled={busy}
              onClick={() =>
                void onSave({
                  title: draft.title,
                  slug: draft.slug,
                  description: draft.description,
                  published: draft.published,
                  template: draft.template,
                  sections: draft.sections,
                })
              }
            >
              {busy ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save page
            </Button>
          </CardContent>
        </Card>

        <HomeSectionsBuilder
          sections={draft.sections}
          template={(draft.template as HomeTemplateId) ?? "editorial"}
          content={contentSource}
          canManageLayout={canManageLayout}
          libraryComponents={libraryComponents}
          onEditLibraryComponent={onEditLibraryComponent}
          pageLabel={draft.title}
          onChange={(sections) => setDraft({ ...draft, sections })}
        />

        <div className="flex justify-end">
          <Button
            disabled={busy}
            onClick={() =>
              void onSave({
                title: draft.title,
                slug: draft.slug,
                description: draft.description,
                published: draft.published,
                template: draft.template,
                sections: draft.sections,
              })
            }
          >
            {busy ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save page
          </Button>
        </div>
      </div>
    </div>
  );
}

function ComponentsPanel({
  components,
  selected,
  onSelect,
  onSave,
  onCreate,
  onDelete,
  busy,
  contentSource,
}: {
  components: CmsComponentRecord[];
  selected: CmsComponentRecord | null;
  onSelect: (id: string) => void;
  onSave: (patch: Partial<CmsComponentRecord>) => Promise<void>;
  onCreate: (input: {
    name: string;
    type: HomeSectionType;
  }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  busy: boolean;
  contentSource: SectionContentSource;
}) {
  const [draft, setDraft] = useState<CmsComponentRecord | null>(selected);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<HomeSectionType>("heroStatic");

  useEffect(() => {
    setDraft(selected);
  }, [selected]);

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
    setDraft({
      ...draft,
      props: Object.keys(props).length > 0 ? props : {},
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
      <Card className="h-fit lg:sticky lg:top-24">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Library</CardTitle>
          <CardDescription>
            Reusable blocks you can drop onto any page.
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
                    <span className="truncate font-medium">
                      {component.name}
                    </span>
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
              placeholder="Name (e.g. Summer hero)"
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
              disabled={busy || !newName.trim()}
              onClick={() =>
                void onCreate({ name: newName.trim(), type: newType }).then(
                  () => setNewName("")
                )
              }
            >
              {busy ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Create component
            </Button>
          </div>
        </CardContent>
      </Card>

      {!draft ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-neutral-500">
            Select or create a component to edit its shared content.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>{draft.name}</CardTitle>
                <CardDescription>
                  {sectionLabel(draft.type)} — edits apply everywhere this
                  component is used.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600"
                disabled={busy}
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
                      setDraft({ ...draft, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Block type</Label>
                  <Select
                    value={draft.type}
                    onValueChange={(v) =>
                      setDraft({ ...draft, type: v as HomeSectionType })
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
                <div className="sm:col-span-2">
                  <Label>Notes (optional)</Label>
                  <Textarea
                    className="mt-1"
                    rows={2}
                    value={draft.description ?? ""}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        description: e.target.value || null,
                      })
                    }
                  />
                </div>
              </div>

              <ComponentFieldsEditor
                type={draft.type}
                props={draft.props}
                contentSource={contentSource}
                onSetProp={setProp}
              />

              <Button
                disabled={busy}
                onClick={() =>
                  void onSave({
                    name: draft.name,
                    type: draft.type,
                    description: draft.description,
                    props: draft.props,
                  })
                }
              >
                {busy ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save component
              </Button>
            </CardContent>
          </Card>
        </div>
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
  const section = {
    id: "library",
    type,
    enabled: true,
    props,
  };

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
        <p className="text-sm text-neutral-500">
          This block type has no editable content fields.
        </p>
      )}

      {settingsFields.length > 0 ? (
        <Accordion type="single" collapsible>
          <AccordionItem value="settings" className="border-none">
            <AccordionTrigger className="py-2 text-xs font-medium text-neutral-700 hover:no-underline">
              Spacing & layout defaults
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
