"use client";

import { useState } from "react";
import { ChevronDown, GripVertical, Link2, Plus, Trash2 } from "lucide-react";
import {
  HOME_SECTION_CATALOG,
  componentSettingsFieldsForType,
  defaultPropsForSection,
  defaultSectionsForTemplate,
  editableFieldsForType,
  resolveContentCards,
  sectionLabel,
  type ContentCardItem,
  type HomeSectionFieldKey,
  type HomeSectionItem,
  type HomeSectionProps,
  type HomeSectionType,
  type SectionContentSource,
} from "@/lib/home-sections";
import type { HomeTemplateId } from "@/lib/home-templates";
import { SectionFieldGrid } from "@/components/admin/section-field-grid";
import { cn } from "@/lib/utils";
import { ImageUrlField } from "@/components/admin/image-url-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type LibraryComponentRef = {
  id: string;
  name: string;
  type: HomeSectionType;
};

type HomeSectionsBuilderProps = {
  sections: HomeSectionItem[];
  template: HomeTemplateId;
  content: SectionContentSource;
  onChange: (sections: HomeSectionItem[]) => void;
  /** SuperAdmin: reorder / add / remove. Admin: edit fields only. */
  canManageLayout?: boolean;
  /** Reusable components from the library */
  libraryComponents?: LibraryComponentRef[];
  onEditLibraryComponent?: (id: string) => void;
  pageLabel?: string;
};

export function HomeSectionsBuilder({
  sections,
  template,
  content,
  onChange,
  canManageLayout = false,
  libraryComponents = [],
  onEditLibraryComponent,
  pageLabel = "page",
}: HomeSectionsBuilderProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [addType, setAddType] = useState<HomeSectionType | "">("");
  const [libraryPick, setLibraryPick] = useState<string>("");
  const [openId, setOpenId] = useState<string | null>(null);

  const libraryById = new Map(libraryComponents.map((c) => [c.id, c]));

  /** Admins only edit enabled blocks that are on the live page. */
  const visibleSections = canManageLayout
    ? sections
    : sections.filter((s) => s.enabled);

  const move = (from: number, to: number) => {
    if (!canManageLayout) return;
    if (to < 0 || to >= sections.length || from === to) return;
    const next = [...sections];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const update = (id: string, patch: Partial<HomeSectionItem>) => {
    onChange(sections.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const setProp = (
    id: string,
    key: HomeSectionFieldKey,
    value: string | number | undefined
  ) => {
    const section = sections.find((s) => s.id === id);
    if (!section) return;
    const props: HomeSectionProps = { ...(section.props ?? {}) };
    if (value === undefined || value === "") {
      delete props[key];
    } else if (key === "productLimit") {
      const n = Number(value);
      if (!n) delete props.productLimit;
      else props.productLimit = n;
    } else {
      (props as Record<string, string>)[key] = String(value);
    }
    update(id, {
      props: Object.keys(props).length > 0 ? props : undefined,
    });
  };

  const remove = (id: string) => {
    if (!canManageLayout) return;
    onChange(sections.filter((s) => s.id !== id));
    if (openId === id) setOpenId(null);
  };

  const add = () => {
    if (!canManageLayout || !addType) return;
    const id = `${addType}-${Date.now().toString(36)}`;
    const seeded = defaultPropsForSection(addType, content);
    onChange([
      ...sections,
      { id, type: addType, enabled: true, props: seeded },
    ]);
    setOpenId(id);
    setAddType("");
  };

  const insertFromLibrary = () => {
    if (!canManageLayout || !libraryPick) return;
    const comp = libraryById.get(libraryPick);
    if (!comp) return;
    const id = `ref-${comp.id}-${Date.now().toString(36)}`;
    onChange([
      ...sections,
      {
        id,
        type: comp.type,
        enabled: true,
        componentRefId: comp.id,
      },
    ]);
    setOpenId(id);
    setLibraryPick("");
  };

  const unlinkComponent = (id: string) => {
    const section = sections.find((s) => s.id === id);
    if (!section?.componentRefId) return;
    update(id, { componentRefId: undefined });
  };

  const openEditor = (section: HomeSectionItem) => {
    const defaults = defaultPropsForSection(section.type, content);
    if (openId === section.id) {
      setOpenId(null);
      return;
    }
    if (!section.props || Object.keys(section.props).length === 0) {
      update(section.id, { props: { ...defaults } });
    }
    setOpenId(section.id);
  };

  const addComponentBar = canManageLayout ? (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50/80 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Label className="text-xs font-medium text-neutral-600">
            Component type
          </Label>
          <Select
            value={addType || undefined}
            onValueChange={(v) => setAddType(v as HomeSectionType)}
          >
            <SelectTrigger className="mt-1.5 bg-white">
              <SelectValue placeholder="Select a component" />
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
        <Button
          type="button"
          onClick={add}
          disabled={!addType}
          className="h-11 shrink-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add component
        </Button>
        {template ? (
          <Button
            type="button"
            variant="outline"
            className="h-11 shrink-0"
            onClick={() => onChange(defaultSectionsForTemplate(template))}
          >
            Reset to {template} preset
          </Button>
        ) : null}
      </div>
    </div>
  ) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {canManageLayout ? "Page components" : `${pageLabel} components`}
        </CardTitle>
        <CardDescription>
          {canManageLayout
            ? "Add components, drag to reorder, hide without deleting, and edit each block’s content — same as the homepage."
            : `Edit content for components on this ${pageLabel.toLowerCase()}.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {addComponentBar}
        {visibleSections.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No components on this {pageLabel.toLowerCase()} yet.
            {canManageLayout
              ? " Choose a type above and click Add component."
              : ""}
          </p>
        ) : (
          <ul className="space-y-2">
            {visibleSections.map((section) => {
              const index = sections.findIndex((s) => s.id === section.id);
              const linked = section.componentRefId
                ? libraryById.get(section.componentRefId)
                : undefined;
              const contentFields = editableFieldsForType(section.type);
              const settingsFields = canManageLayout
                ? componentSettingsFieldsForType(section.type)
                : [];
              const defaults = defaultPropsForSection(section.type, content);
              const open = openId === section.id;

              const handleSetProp = (
                key: HomeSectionFieldKey,
                value: string | number | undefined
              ) => setProp(section.id, key, value);

              return (
                <li
                  key={section.id}
                  draggable={canManageLayout && !open}
                  onDragStart={() => {
                    if (canManageLayout) setDragIndex(index);
                  }}
                  onDragOver={(e) => {
                    if (canManageLayout) e.preventDefault();
                  }}
                  onDrop={() => {
                    if (!canManageLayout || dragIndex === null) return;
                    move(dragIndex, index);
                    setDragIndex(null);
                  }}
                  onDragEnd={() => setDragIndex(null)}
                  className={cn(
                    "rounded-xl border bg-white",
                    dragIndex === index
                      ? "border-neutral-950 bg-neutral-50 opacity-60"
                      : "border-neutral-200"
                  )}
                >
                  <div className="flex items-center gap-3 px-3 py-2">
                    {canManageLayout && (
                      <span
                        className="cursor-grab text-neutral-400 active:cursor-grabbing"
                        aria-hidden
                        title="Drag to reorder"
                      >
                        <GripVertical className="h-4 w-4" />
                      </span>
                    )}
                    {canManageLayout ? (
                      <label className="flex min-w-0 flex-1 items-center gap-2 text-sm">
                        <Checkbox
                          checked={section.enabled}
                          onCheckedChange={(v) =>
                            update(section.id, { enabled: v === true })
                          }
                        />
                        <span className="truncate font-medium text-neutral-950">
                          {linked ? linked.name : sectionLabel(section.type)}
                        </span>
                        {linked ? (
                          <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-medium text-violet-800">
                            <Link2 className="h-2.5 w-2.5" />
                            Library
                          </span>
                        ) : null}
                      </label>
                    ) : (
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-neutral-950">
                        {linked ? linked.name : sectionLabel(section.type)}
                        {linked ? (
                          <span className="ml-2 inline-flex items-center gap-0.5 rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-medium text-violet-800">
                            Library
                          </span>
                        ) : null}
                      </span>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1 px-2 text-xs"
                      onClick={() => openEditor(section)}
                    >
                      Edit
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 transition-transform",
                          open && "rotate-180"
                        )}
                      />
                    </Button>
                    {canManageLayout && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-neutral-500"
                        aria-label={`Remove ${sectionLabel(section.type)}`}
                        onClick={() => remove(section.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {open && (
                    <div className="space-y-3 border-t border-neutral-100 px-3 py-3">
                      {linked ? (
                        <div className="rounded-lg border border-violet-200 bg-violet-50/60 px-3 py-2 text-xs text-violet-900">
                          <p>
                            Linked to library component{" "}
                            <strong>{linked.name}</strong>. Fields below override
                            the shared component on this page only.
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {onEditLibraryComponent ? (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 border-violet-300 bg-white text-xs"
                                onClick={() =>
                                  onEditLibraryComponent(linked.id)
                                }
                              >
                                Edit shared component
                              </Button>
                            ) : null}
                            {canManageLayout ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-violet-800"
                                onClick={() => unlinkComponent(section.id)}
                              >
                                Unlink (keep as inline copy)
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      ) : null}
                      {contentFields.length === 0 ? (
                        <p className="text-xs text-neutral-500">
                          No direct fields for this block.
                        </p>
                      ) : (
                        <SectionFieldGrid
                          section={section}
                          fields={contentFields}
                          defaults={defaults}
                          onSetProp={handleSetProp}
                        />
                      )}

                      {canManageLayout && settingsFields.length > 0 && (
                        <Accordion type="single" collapsible className="border-t border-neutral-100 pt-2">
                          <AccordionItem value="settings" className="border-none">
                            <AccordionTrigger className="py-2 text-xs font-medium text-neutral-700 hover:no-underline">
                              Component settings
                            </AccordionTrigger>
                            <AccordionContent className="pb-1 pt-2 text-neutral-950">
                              <p className="mb-3 text-xs text-neutral-500">
                                Section padding and spacing — SuperAdmin only.
                              </p>
                              <SectionFieldGrid
                                section={section}
                                fields={settingsFields}
                                defaults={defaults}
                                onSetProp={handleSetProp}
                              />
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      )}

                      {section.type === "contentCard" && (
                        <ContentCardsEditor
                          cards={resolveContentCards(section.props)}
                          onChange={(cards) =>
                            setProp(
                              section.id,
                              "cardsJson",
                              JSON.stringify(cards)
                            )
                          }
                        />
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {libraryComponents.length > 0 && canManageLayout ? (
          <div className="flex flex-col gap-3 border-t border-neutral-100 pt-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Label className="text-xs font-medium text-neutral-600">
                Insert shared component
              </Label>
              <Select value={libraryPick} onValueChange={setLibraryPick}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Pick a saved component…" />
                </SelectTrigger>
                <SelectContent>
                  {libraryComponents.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} ({sectionLabel(item.type)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="secondary"
              className="h-11 shrink-0"
              disabled={!libraryPick}
              onClick={insertFromLibrary}
            >
              <Link2 className="mr-2 h-4 w-4" />
              Insert
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

const EMPTY_CARD: ContentCardItem = {
  eyebrow: "",
  title: "",
  body: "",
  imageUrl: "",
  videoUrl: "",
  ctaLabel: "",
  ctaHref: "",
};

function ContentCardsEditor({
  cards,
  onChange,
}: {
  cards: ContentCardItem[];
  onChange: (cards: ContentCardItem[]) => void;
}) {
  const list = cards.length > 0 ? cards : [{ ...EMPTY_CARD }];

  const updateCard = (index: number, patch: Partial<ContentCardItem>) => {
    onChange(list.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  };

  return (
    <div className="space-y-3 border-t border-neutral-100 pt-3 sm:col-span-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-neutral-700">Cards in this row</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8"
          onClick={() => onChange([...list, { ...EMPTY_CARD, title: `Card ${list.length + 1}` }])}
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add card
        </Button>
      </div>
      <p className="text-xs text-neutral-500">
        Use “Cards per row” above to control the grid. Add multiple cards for columns.
      </p>
      <ul className="space-y-3">
        {list.map((card, index) => (
          <li
            key={index}
            className="space-y-2 rounded-xl border border-neutral-200 bg-neutral-50/80 p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-neutral-800">
                Card {index + 1}
              </p>
              {list.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-neutral-500"
                  onClick={() => onChange(list.filter((_, i) => i !== index))}
                >
                  Remove
                </Button>
              ) : null}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <Label className="text-xs">Eyebrow</Label>
                <Input
                  className="mt-1"
                  value={card.eyebrow ?? ""}
                  onChange={(e) =>
                    updateCard(index, { eyebrow: e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="text-xs">Title</Label>
                <Input
                  className="mt-1"
                  value={card.title ?? ""}
                  onChange={(e) => updateCard(index, { title: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs">Body</Label>
                <Textarea
                  className="mt-1"
                  rows={3}
                  value={card.body ?? ""}
                  onChange={(e) => updateCard(index, { body: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <ImageUrlField
                  label="Image / GIF URL"
                  value={card.imageUrl ?? ""}
                  onChange={(imageUrl) => updateCard(index, { imageUrl })}
                  inputClassName="mt-1"
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs">Video URL (.mp4 / .webm)</Label>
                <Input
                  className="mt-1"
                  value={card.videoUrl ?? ""}
                  onChange={(e) =>
                    updateCard(index, { videoUrl: e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="text-xs">CTA label</Label>
                <Input
                  className="mt-1"
                  value={card.ctaLabel ?? ""}
                  onChange={(e) =>
                    updateCard(index, { ctaLabel: e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="text-xs">CTA link</Label>
                <Input
                  className="mt-1"
                  value={card.ctaHref ?? ""}
                  onChange={(e) =>
                    updateCard(index, { ctaHref: e.target.value })
                  }
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
