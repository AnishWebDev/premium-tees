"use client";

import {
  PAGE_BANNER_ALIGN_OPTIONS,
  PAGE_BANNER_FIELD_LABELS,
  PAGE_BANNER_SPACING_OPTIONS,
  type PageBannerData,
} from "@/lib/page-banner";
import { adminComponentSettingsDivider } from "@/lib/admin-ui-classes";
import { ImageUrlField } from "@/components/admin/image-url-field";
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

type PageBannerEditorProps = {
  banner: PageBannerData;
  pageTitle: string;
  onChange: (banner: PageBannerData) => void;
  canEditComponentSettings?: boolean;
};

export function PageBannerEditor({
  banner,
  pageTitle,
  onChange,
  canEditComponentSettings = false,
}: PageBannerEditorProps) {
  const set = <K extends keyof PageBannerData>(
    key: K,
    value: PageBannerData[K]
  ) => onChange({ ...banner, [key]: value });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Page banner</CardTitle>
        <CardDescription>
          Top-of-page heading shown on the live storefront for this page.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={banner.enabled}
            onCheckedChange={(v) => set("enabled", v === true)}
          />
          {PAGE_BANNER_FIELD_LABELS.enabled}
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="page-banner-title">
              {PAGE_BANNER_FIELD_LABELS.title}
            </Label>
            <Input
              id="page-banner-title"
              value={banner.title}
              placeholder={pageTitle}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="page-banner-description">
              {PAGE_BANNER_FIELD_LABELS.description}
            </Label>
            <Textarea
              id="page-banner-description"
              rows={3}
              value={banner.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
        </div>

        {canEditComponentSettings ? (
          <Accordion type="single" collapsible className={adminComponentSettingsDivider}>
            <AccordionItem value="settings" className="border-none">
              <AccordionTrigger className="py-2 text-xs font-medium text-[var(--foreground)] hover:no-underline">
                Component settings
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pb-1 pt-2">
                <p className="text-xs text-[var(--muted-foreground)]">
                  Background, alignment, and spacing for this banner.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <ImageUrlField
                      label={PAGE_BANNER_FIELD_LABELS.backgroundImageUrl}
                      value={banner.backgroundImageUrl}
                      onChange={(v) => set("backgroundImageUrl", v)}
                      inputClassName="mt-1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{PAGE_BANNER_FIELD_LABELS.backgroundColor}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        className="h-10 w-14 cursor-pointer p-1"
                        value={
                          /^#[0-9a-fA-F]{6}$/.test(banner.backgroundColor)
                            ? banner.backgroundColor
                            : "#f4f4f5"
                        }
                        onChange={(e) => set("backgroundColor", e.target.value)}
                      />
                      <Input
                        value={banner.backgroundColor}
                        placeholder="#ffffff or leave blank"
                        onChange={(e) => set("backgroundColor", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{PAGE_BANNER_FIELD_LABELS.textAlign}</Label>
                    <Select
                      value={banner.textAlign}
                      onValueChange={(v) =>
                        set("textAlign", v as PageBannerData["textAlign"])
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAGE_BANNER_ALIGN_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {(
                    [
                      "paddingTop",
                      "paddingBottom",
                      "paddingLeft",
                      "paddingRight",
                    ] as const
                  ).map((key) => (
                    <div key={key} className="space-y-2">
                      <Label>{PAGE_BANNER_FIELD_LABELS[key]}</Label>
                      <Select
                        value={banner[key]}
                        onValueChange={(v) =>
                          set(key, v as PageBannerData[typeof key])
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PAGE_BANNER_SPACING_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : null}
      </CardContent>
    </Card>
  );
}
