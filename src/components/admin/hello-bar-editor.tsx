"use client";

import type { HelloBarData } from "@/lib/hello-bar";
import { toDateTimeLocalValue } from "@/lib/promo-schedule";
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
import { adminComponentSettingsDivider } from "@/lib/admin-ui-classes";

const BG_STYLE_OPTIONS = [
  { value: "theme", label: "Page background" },
  { value: "muted", label: "Muted surface" },
  { value: "accent", label: "Accent" },
  { value: "custom", label: "Custom color" },
];

const YES_NO = [
  { value: "no", label: "No" },
  { value: "yes", label: "Yes" },
];

type HelloBarEditorProps = {
  data: HelloBarData;
  onChange: (data: HelloBarData) => void;
  canEditSettings?: boolean;
};

export function HelloBarEditor({
  data,
  onChange,
  canEditSettings = false,
}: HelloBarEditorProps) {
  const set = (patch: Partial<HelloBarData>) => onChange({ ...data, ...patch });

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <Checkbox
          id="hello-bar-enabled"
          checked={data.enabled}
          onCheckedChange={(v) => set({ enabled: v === true })}
        />
        <Label htmlFor="hello-bar-enabled" className="cursor-pointer text-sm">
          Show promo hello bar above the site header
        </Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="hello-bar-message">Promo message</Label>
        <Textarea
          id="hello-bar-message"
          rows={2}
          value={data.message}
          onChange={(e) => set({ message: e.target.value })}
          placeholder="Free shipping this week — shop the edit"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="hello-bar-link">Link URL (optional)</Label>
          <Input
            id="hello-bar-link"
            value={data.linkHref}
            onChange={(e) => set({ linkHref: e.target.value })}
            placeholder="/shop"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hello-bar-link-label">Link label</Label>
          <Input
            id="hello-bar-link-label"
            value={data.linkLabel}
            onChange={(e) => set({ linkLabel: e.target.value })}
            placeholder="Shop now"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="hello-bar-start">Show from (optional)</Label>
          <Input
            id="hello-bar-start"
            type="datetime-local"
            value={toDateTimeLocalValue(data.scheduleStartAt)}
            onChange={(e) => set({ scheduleStartAt: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hello-bar-end">Show until (optional)</Label>
          <Input
            id="hello-bar-end"
            type="datetime-local"
            value={toDateTimeLocalValue(data.scheduleEndAt)}
            onChange={(e) => set({ scheduleEndAt: e.target.value })}
          />
        </div>
      </div>

      {canEditSettings ? (
        <Accordion type="single" collapsible className={adminComponentSettingsDivider}>
          <AccordionItem value="hello-settings" className="border-none">
            <AccordionTrigger className="py-2 text-xs font-medium text-[var(--foreground)] hover:no-underline">
              Hello bar settings
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pb-1 pt-2 text-[var(--foreground)]">
              <p className="text-xs text-[var(--muted-foreground)]">
                Background, colors, sticky behavior, and dismiss options for the
                promo bar.
              </p>
              <div className="space-y-2">
                <Label>Background</Label>
                <Select
                  value={data.bgStyle}
                  onValueChange={(v) => set({ bgStyle: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BG_STYLE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Custom background color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      className="h-10 w-14 cursor-pointer p-1"
                      value={
                        /^#[0-9a-fA-F]{6}$/.test(data.backgroundColor)
                          ? data.backgroundColor
                          : "#18181b"
                      }
                      onChange={(e) => set({ backgroundColor: e.target.value })}
                    />
                    <Input
                      value={data.backgroundColor}
                      placeholder="#000000 or leave blank"
                      onChange={(e) => set({ backgroundColor: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Text color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      className="h-10 w-14 cursor-pointer p-1"
                      value={
                        /^#[0-9a-fA-F]{6}$/.test(data.textColor)
                          ? data.textColor
                          : "#fafafa"
                      }
                      onChange={(e) => set({ textColor: e.target.value })}
                    />
                    <Input
                      value={data.textColor}
                      placeholder="#ffffff or leave blank"
                      onChange={(e) => set({ textColor: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Stick to top while scrolling</Label>
                  <Select
                    value={data.settingSticky}
                    onValueChange={(v) => set({ settingSticky: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {YES_NO.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Allow visitors to dismiss</Label>
                  <Select
                    value={data.settingDismissible}
                    onValueChange={(v) => set({ settingDismissible: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {YES_NO.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ) : null}
    </div>
  );
}
