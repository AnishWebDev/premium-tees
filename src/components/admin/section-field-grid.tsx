"use client";

import {
  SECTION_FIELD_LABELS,
  SECTION_FIELD_OPTIONS,
  effectiveSectionProp,
  type HomeSectionFieldKey,
  type HomeSectionItem,
  type HomeSectionProps,
} from "@/lib/home-sections";
import { ImageUrlField } from "@/components/admin/image-url-field";
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

const MULTILINE: HomeSectionFieldKey[] = [
  "body",
  "subtitle",
  "subheadline",
  "marqueeItems",
];

type SectionFieldGridProps = {
  section: HomeSectionItem;
  fields: HomeSectionFieldKey[];
  defaults: HomeSectionProps;
  onSetProp: (
    key: HomeSectionFieldKey,
    value: string | number | undefined
  ) => void;
};

export function SectionFieldGrid({
  section,
  fields,
  defaults,
  onSetProp,
}: SectionFieldGridProps) {
  if (fields.length === 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {fields.map((key) => {
        const multiline = MULTILINE.includes(key);
        const options = SECTION_FIELD_OPTIONS[key];
        const isColor = key === "backgroundColor" || key === "textColor";
        const value = effectiveSectionProp(section, key, defaults);

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
            {key !== "imageUrl" ? (
              <Label className="text-xs">{SECTION_FIELD_LABELS[key]}</Label>
            ) : null}
            {options ? (
              <Select
                value={value || options[0]?.value}
                onValueChange={(v) => onSetProp(key, v)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : multiline ? (
              <Textarea
                className="mt-1.5"
                rows={
                  key === "body" ? 5 : key === "marqueeItems" ? 2 : 3
                }
                value={value}
                onChange={(e) => onSetProp(key, e.target.value)}
              />
            ) : isColor ? (
              <div className="mt-1.5 flex items-center gap-2">
                <Input
                  type="color"
                  className="h-10 w-14 cursor-pointer p-1"
                  value={
                    /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#f4f4f5"
                  }
                  onChange={(e) => onSetProp(key, e.target.value)}
                />
                <Input
                  value={value}
                  placeholder="#000000 or leave blank"
                  onChange={(e) => onSetProp(key, e.target.value)}
                />
              </div>
            ) : key === "imageUrl" ? (
              <ImageUrlField
                label={SECTION_FIELD_LABELS[key]}
                value={value}
                onChange={(v) => onSetProp(key, v)}
                className="mt-0"
                inputClassName="mt-1.5"
              />
            ) : (
              <Input
                className="mt-1.5"
                type={key === "productLimit" ? "number" : "text"}
                min={key === "productLimit" ? 1 : undefined}
                max={key === "productLimit" ? 24 : undefined}
                value={value}
                onChange={(e) =>
                  onSetProp(
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
  );
}
