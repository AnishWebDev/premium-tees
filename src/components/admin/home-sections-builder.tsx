"use client";

import { useState } from "react";
import { ChevronDown, GripVertical, Plus, Trash2 } from "lucide-react";
import {
  HOME_SECTION_CATALOG,
  SECTION_FIELD_LABELS,
  SECTION_FIELD_OPTIONS,
  defaultPropsForSection,
  defaultSectionsForTemplate,
  editableFieldsForType,
  effectiveSectionProp,
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
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

type HomeSectionsBuilderProps = {
  sections: HomeSectionItem[];
  template: HomeTemplateId;
  content: SectionContentSource;
  onChange: (sections: HomeSectionItem[]) => void;
  /** SuperAdmin: reorder / add / remove. Admin: edit fields only. */
  canManageLayout?: boolean;
};

const MULTILINE: HomeSectionFieldKey[] = [
  "body",
  "subtitle",
  "subheadline",
  "marqueeItems",
];

export function HomeSectionsBuilder({
  sections,
  template,
  content,
  onChange,
  canManageLayout = false,
}: HomeSectionsBuilderProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [addType, setAddType] = useState<HomeSectionType>("embedFrame");
  const [openId, setOpenId] = useState<string | null>(null);

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
    if (!canManageLayout) return;
    const id = `${addType}-${Date.now().toString(36)}`;
    const seeded = defaultPropsForSection(addType, content);
    onChange([
      ...sections,
      { id, type: addType, enabled: true, props: seeded },
    ]);
    setOpenId(id);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {canManageLayout ? "Page layout" : "Homepage sections"}
        </CardTitle>
        <CardDescription>
          {canManageLayout
            ? "Drag to reorder, add or remove blocks, and edit each block’s fields. Admins can edit these same blocks but cannot change the layout."
            : "Edit copy for each block currently on the homepage. Layout (order / add / remove) is managed by SuperAdmin."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {visibleSections.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No homepage sections yet.
            {canManageLayout
              ? " Add a block below or pick a template preset."
              : " Ask a SuperAdmin to add sections to the layout."}
          </p>
        ) : (
          <ul className="space-y-2">
            {visibleSections.map((section) => {
              const index = sections.findIndex((s) => s.id === section.id);
              const fields = editableFieldsForType(section.type);
              const defaults = defaultPropsForSection(section.type, content);
              const open = openId === section.id;

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
                          {sectionLabel(section.type)}
                        </span>
                      </label>
                    ) : (
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-neutral-950">
                        {sectionLabel(section.type)}
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
                      {fields.length === 0 ? (
                        <p className="text-xs text-neutral-500">
                          No direct fields for this block.
                        </p>
                      ) : (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {fields.map((key) => {
                            const multiline = MULTILINE.includes(key);
                            const options = SECTION_FIELD_OPTIONS[key];
                            const isColor =
                              key === "backgroundColor" || key === "textColor";
                            const value = effectiveSectionProp(
                              section,
                              key,
                              defaults
                            );
                            return (
                              <div
                                key={key}
                                className={
                                  multiline ||
                                  key === "embedUrl" ||
                                  key === "imageUrl" ||
                                  key === "videoUrl" ||
                                  key === "body"
                                    ? "sm:col-span-2"
                                    : undefined
                                }
                              >
                                <Label className="text-xs">
                                  {SECTION_FIELD_LABELS[key]}
                                </Label>
                                {options ? (
                                  <Select
                                    value={value || options[0]?.value}
                                    onValueChange={(v) =>
                                      setProp(section.id, key, v)
                                    }
                                  >
                                    <SelectTrigger className="mt-1.5">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {options.map((opt) => (
                                        <SelectItem
                                          key={opt.value}
                                          value={opt.value}
                                        >
                                          {opt.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : multiline ? (
                                  <Textarea
                                    className="mt-1.5"
                                    rows={
                                      key === "body"
                                        ? 5
                                        : key === "marqueeItems"
                                          ? 2
                                          : 3
                                    }
                                    value={value}
                                    onChange={(e) =>
                                      setProp(section.id, key, e.target.value)
                                    }
                                  />
                                ) : isColor ? (
                                  <div className="mt-1.5 flex items-center gap-2">
                                    <Input
                                      type="color"
                                      className="h-10 w-14 cursor-pointer p-1"
                                      value={
                                        /^#[0-9a-fA-F]{6}$/.test(value)
                                          ? value
                                          : "#f4f4f5"
                                      }
                                      onChange={(e) =>
                                        setProp(section.id, key, e.target.value)
                                      }
                                    />
                                    <Input
                                      value={value}
                                      placeholder="#000000 or leave blank"
                                      onChange={(e) =>
                                        setProp(section.id, key, e.target.value)
                                      }
                                    />
                                  </div>
                                ) : (
                                  <Input
                                    className="mt-1.5"
                                    type={
                                      key === "productLimit" ? "number" : "text"
                                    }
                                    min={
                                      key === "productLimit" ? 1 : undefined
                                    }
                                    max={
                                      key === "productLimit" ? 24 : undefined
                                    }
                                    value={value}
                                    onChange={(e) =>
                                      setProp(
                                        section.id,
                                        key,
                                        key === "productLimit"
                                          ? e.target.value
                                            ? Number(e.target.value)
                                            : undefined
                                          : e.target.value
                                      )
                                    }
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
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

        {canManageLayout && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <p className="mb-2 text-xs font-medium text-neutral-500">
                Add block
              </p>
              <Select
                value={addType}
                onValueChange={(v) => setAddType(v as HomeSectionType)}
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
            </div>
            <Button type="button" variant="secondary" onClick={add}>
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onChange(defaultSectionsForTemplate(template))}
            >
              Reset to {template} preset
            </Button>
          </div>
        )}
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
                <Label className="text-xs">Image / GIF URL</Label>
                <Input
                  className="mt-1"
                  value={card.imageUrl ?? ""}
                  onChange={(e) =>
                    updateCard(index, { imageUrl: e.target.value })
                  }
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
