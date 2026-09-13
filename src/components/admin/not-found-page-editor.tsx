"use client";

import {
  NOT_FOUND_CONTENT_FIELDS,
  STORE_COPY_LABELS,
  type StoreCopyData,
} from "@/lib/cms-content";
import { NOT_FOUND_FONT_SIZE_OPTIONS } from "@/lib/not-found-styles";
import { FONT_OPTIONS } from "@/lib/theme";
import {
  adminComponentSettingsDivider,
  adminPanelMuted,
} from "@/lib/admin-ui-classes";
import { ImageUrlField } from "@/components/admin/image-url-field";
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

type NotFoundPageEditorProps = {
  storeCopy: StoreCopyData;
  onChange: (copy: StoreCopyData) => void;
};

const TYPO_GROUPS: {
  title: string;
  color: keyof StoreCopyData;
  fontSize: keyof StoreCopyData;
  fontFamily: keyof StoreCopyData;
}[] = [
  {
    title: "Error code",
    color: "notFoundCodeColor",
    fontSize: "notFoundCodeFontSize",
    fontFamily: "notFoundCodeFontFamily",
  },
  {
    title: "Title",
    color: "notFoundTitleColor",
    fontSize: "notFoundTitleFontSize",
    fontFamily: "notFoundTitleFontFamily",
  },
  {
    title: "Description",
    color: "notFoundDescriptionColor",
    fontSize: "notFoundDescriptionFontSize",
    fontFamily: "notFoundDescriptionFontFamily",
  },
];

export function NotFoundPageEditor({
  storeCopy,
  onChange,
}: NotFoundPageEditorProps) {
  const set = <K extends keyof StoreCopyData>(key: K, value: StoreCopyData[K]) =>
    onChange({ ...storeCopy, [key]: value });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">404 page</CardTitle>
        <CardDescription>
          Shown when a URL does not exist. Customize copy, images, button labels,
          and typography.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <p className="text-xs font-medium text-[var(--foreground)]">Content</p>
          {NOT_FOUND_CONTENT_FIELDS.map((key) => (
            <NotFoundField
              key={key}
              fieldKey={key}
              value={storeCopy[key]}
              onChange={(value) => set(key, value)}
            />
          ))}
        </div>

        <Accordion type="single" collapsible className={adminComponentSettingsDivider}>
          <AccordionItem value="typography" className="border-none">
            <AccordionTrigger className="py-2 text-xs font-medium text-[var(--foreground)] hover:no-underline">
              Typography
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pb-1 pt-2">
              <p className="text-xs text-[var(--muted-foreground)]">
                Leave colors and fonts blank to use your theme defaults.
              </p>
              {TYPO_GROUPS.map((group) => (
                <div key={group.title} className={`space-y-3 ${adminPanelMuted}`}>
                  <p className="text-xs font-semibold text-[var(--foreground)]">
                    {group.title}
                  </p>
                  <ColorField
                    label={STORE_COPY_LABELS[group.color]}
                    value={storeCopy[group.color]}
                    onChange={(v) => set(group.color, v)}
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs">
                        {STORE_COPY_LABELS[group.fontSize]}
                      </Label>
                      <Select
                        value={storeCopy[group.fontSize] || "__default"}
                        onValueChange={(v) =>
                          set(group.fontSize, v === "__default" ? "" : v)
                        }
                      >
                        <SelectTrigger className="bg-[var(--background)]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {NOT_FOUND_FONT_SIZE_OPTIONS.map((opt) => (
                            <SelectItem
                              key={opt.value || "default"}
                              value={opt.value || "__default"}
                            >
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">
                        {STORE_COPY_LABELS[group.fontFamily]}
                      </Label>
                      <Select
                        value={storeCopy[group.fontFamily] || "__default"}
                        onValueChange={(v) =>
                          set(group.fontFamily, v === "__default" ? "" : v)
                        }
                      >
                        <SelectTrigger className="bg-[var(--background)]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__default">Theme default</SelectItem>
                          {FONT_OPTIONS.map((font) => (
                            <SelectItem key={font} value={font}>
                              {font}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}

function NotFoundField({
  fieldKey,
  value,
  onChange,
}: {
  fieldKey: (typeof NOT_FOUND_CONTENT_FIELDS)[number];
  value: string;
  onChange: (value: string) => void;
}) {
  const label = STORE_COPY_LABELS[fieldKey];
  const isImageUrl =
    fieldKey === "notFoundImageUrl" ||
    fieldKey === "notFoundBackgroundImageUrl";

  if (isImageUrl) {
    return (
      <ImageUrlField
        label={label}
        value={value}
        onChange={onChange}
        inputClassName="mt-1"
      />
    );
  }

  if (fieldKey === "notFoundDescription") {
    return (
      <div className="space-y-2">
        <Label htmlFor={`nf-${fieldKey}`}>{label}</Label>
        <Textarea
          id={`nf-${fieldKey}`}
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={`nf-${fieldKey}`}>{label}</Label>
      <Input
        id={`nf-${fieldKey}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          type="color"
          className="h-10 w-14 cursor-pointer p-1"
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#71717a"}
          onChange={(e) => onChange(e.target.value)}
        />
        <Input
          value={value}
          placeholder="#000000 or leave blank"
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}
