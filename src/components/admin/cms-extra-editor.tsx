"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  AUTH_COPY_LABELS,
  NOT_FOUND_COPY_FIELDS,
  STORE_COPY_LABELS,
  type AllCmsContent,
  type CmsKey,
  type LegalSection,
  type SizeGuideRow,
  type StoreCopyData,
} from "@/lib/cms-content";
import { ImageUrlField } from "@/components/admin/image-url-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type CmsExtraEditorProps = {
  initialContent: AllCmsContent;
  hideSave?: boolean;
  hideHeader?: boolean;
  content?: AllCmsContent;
  onContentChange?: (content: AllCmsContent) => void;
  defaultTab?: CmsKey;
  /** Show only one section (no inner tab list). */
  singleTab?: CmsKey;
};

const TABS: { key: CmsKey; label: string }[] = [
  { key: "collections", label: "Collections" },
  { key: "legal", label: "Legal" },
  { key: "storeCopy", label: "Store copy" },
  { key: "sizeGuide", label: "Size guide" },
  { key: "auth", label: "Auth pages" },
];

export function CmsExtraEditor({
  initialContent,
  hideSave = false,
  hideHeader = false,
  content: controlledContent,
  onContentChange,
  defaultTab = "collections",
  singleTab,
}: CmsExtraEditorProps) {
  const [internalContent, setInternalContent] = useState(initialContent);
  const content = controlledContent ?? internalContent;
  const setContent = (
    updater: AllCmsContent | ((prev: AllCmsContent) => AllCmsContent)
  ) => {
    const prev = controlledContent ?? internalContent;
    const next =
      typeof updater === "function" ? updater(prev) : updater;
    if (onContentChange) onContentChange(next);
    else setInternalContent(next);
  };
  const [saving, setSaving] = useState<CmsKey | null>(null);

  const save = async (key: CmsKey) => {
    setSaving(key);
    try {
      const res = await fetch("/api/admin/cms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, data: content[key] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      toast.success(`${TABS.find((t) => t.key === key)?.label} saved`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(null);
    }
  };

  const updateLegalSection = (
    page: "terms" | "privacy",
    index: number,
    field: keyof LegalSection,
    value: string | string[]
  ) => {
    setContent((prev) => ({
      ...prev,
      legal: {
        ...prev.legal,
        [page]: {
          ...prev.legal[page],
          sections: prev.legal[page].sections.map((s, i) =>
            i === index ? { ...s, [field]: value } : s
          ),
        },
      },
    }));
  };

  const activeTab = singleTab ?? defaultTab;

  const inner = (
        <Tabs value={activeTab} defaultValue={defaultTab}>
          {!singleTab ? (
          <TabsList className="mb-6 flex h-auto flex-wrap gap-1">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.key} value={tab.key}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          ) : null}

          <TabsContent value="collections" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="collections-title">Page title</Label>
              <Input
                id="collections-title"
                value={content.collections.title}
                onChange={(e) =>
                  setContent((p) => ({
                    ...p,
                    collections: { ...p.collections, title: e.target.value },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="collections-subtitle">Subtitle</Label>
              <Textarea
                id="collections-subtitle"
                value={content.collections.subtitle}
                onChange={(e) =>
                  setContent((p) => ({
                    ...p,
                    collections: { ...p.collections, subtitle: e.target.value },
                  }))
                }
              />
            </div>
            {!hideSave ? (
              <SaveButton saving={saving === "collections"} onClick={() => save("collections")} />
            ) : null}
          </TabsContent>

          <TabsContent value="legal" className="space-y-6">
            {(["terms", "privacy"] as const).map((pageKey) => (
              <div key={pageKey} className="rounded-lg border border-neutral-200 p-4 space-y-3">
                <h3 className="font-medium capitalize">{pageKey}</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={content.legal[pageKey].title}
                      onChange={(e) =>
                        setContent((p) => ({
                          ...p,
                          legal: {
                            ...p.legal,
                            [pageKey]: { ...p.legal[pageKey], title: e.target.value },
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last updated</Label>
                    <Input
                      value={content.legal[pageKey].lastUpdated}
                      onChange={(e) =>
                        setContent((p) => ({
                          ...p,
                          legal: {
                            ...p.legal,
                            [pageKey]: { ...p.legal[pageKey], lastUpdated: e.target.value },
                          },
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Contact email</Label>
                  <Input
                    value={content.legal[pageKey].contactEmail}
                    onChange={(e) =>
                      setContent((p) => ({
                        ...p,
                        legal: {
                          ...p.legal,
                          [pageKey]: { ...p.legal[pageKey], contactEmail: e.target.value },
                        },
                      }))
                    }
                  />
                </div>
                {content.legal[pageKey].sections.map((section, index) => (
                  <div key={index} className="space-y-2 rounded border border-neutral-100 p-3">
                    <Input
                      value={section.heading}
                      placeholder="Section heading"
                      onChange={(e) => updateLegalSection(pageKey, index, "heading", e.target.value)}
                    />
                    <Textarea
                      value={section.paragraphs.join("\n\n")}
                      placeholder="Paragraphs (blank line between)"
                      rows={4}
                      onChange={(e) =>
                        updateLegalSection(
                          pageKey,
                          index,
                          "paragraphs",
                          e.target.value.split(/\n\n+/).filter(Boolean)
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            ))}
            <div className="space-y-2">
              <Label>Shipping page intro</Label>
              <Textarea
                value={content.legal.shippingIntro}
                onChange={(e) =>
                  setContent((p) => ({
                    ...p,
                    legal: { ...p.legal, shippingIntro: e.target.value },
                  }))
                }
              />
            </div>
            {!hideSave ? (
              <SaveButton saving={saving === "legal"} onClick={() => save("legal")} />
            ) : null}
          </TabsContent>

          <TabsContent value="storeCopy" className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">404 page</CardTitle>
                <p className="text-sm text-neutral-500">
                  Shown when a visitor opens a URL that does not exist. Add an
                  optional image above the text and a background image.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {NOT_FOUND_COPY_FIELDS.map((key) => (
                  <StoreCopyField
                    key={key}
                    fieldKey={key}
                    value={content.storeCopy[key]}
                    onChange={(value) =>
                      setContent((p) => ({
                        ...p,
                        storeCopy: { ...p.storeCopy, [key]: value },
                      }))
                    }
                  />
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Empty states & checkout</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(
                  Object.keys(content.storeCopy) as (keyof StoreCopyData)[]
                )
                  .filter(
                    (key) =>
                      !NOT_FOUND_COPY_FIELDS.includes(
                        key as (typeof NOT_FOUND_COPY_FIELDS)[number]
                      )
                  )
                  .map((key) => (
                    <StoreCopyField
                      key={key}
                      fieldKey={key}
                      value={content.storeCopy[key]}
                      onChange={(value) =>
                        setContent((p) => ({
                          ...p,
                          storeCopy: { ...p.storeCopy, [key]: value },
                        }))
                      }
                    />
                  ))}
              </CardContent>
            </Card>

            {!hideSave ? (
              <SaveButton saving={saving === "storeCopy"} onClick={() => save("storeCopy")} />
            ) : null}
          </TabsContent>

          <TabsContent value="sizeGuide" className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={content.sizeGuide.title}
                onChange={(e) =>
                  setContent((p) => ({
                    ...p,
                    sizeGuide: { ...p.sizeGuide, title: e.target.value },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Intro</Label>
              <Textarea
                value={content.sizeGuide.intro}
                onChange={(e) =>
                  setContent((p) => ({
                    ...p,
                    sizeGuide: { ...p.sizeGuide, intro: e.target.value },
                  }))
                }
              />
            </div>
            {content.sizeGuide.rows.map((row, index) => (
              <div key={index} className="grid grid-cols-3 gap-2">
                {(["size", "chest", "length"] as (keyof SizeGuideRow)[]).map((field) => (
                  <Input
                    key={field}
                    value={row[field]}
                    placeholder={field}
                    onChange={(e) =>
                      setContent((p) => ({
                        ...p,
                        sizeGuide: {
                          ...p.sizeGuide,
                          rows: p.sizeGuide.rows.map((r, i) =>
                            i === index ? { ...r, [field]: e.target.value } : r
                          ),
                        },
                      }))
                    }
                  />
                ))}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setContent((p) => ({
                  ...p,
                  sizeGuide: {
                    ...p.sizeGuide,
                    rows: [...p.sizeGuide.rows, { size: "", chest: "", length: "" }],
                  },
                }))
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add row
            </Button>
            <div className="space-y-2">
              <Label>Fit note</Label>
              <Input
                value={content.sizeGuide.fitNote}
                onChange={(e) =>
                  setContent((p) => ({
                    ...p,
                    sizeGuide: { ...p.sizeGuide, fitNote: e.target.value },
                  }))
                }
              />
            </div>
            {!hideSave ? (
              <SaveButton saving={saving === "sizeGuide"} onClick={() => save("sizeGuide")} />
            ) : null}
          </TabsContent>

          <TabsContent value="auth" className="space-y-4">
            {(Object.keys(content.auth) as (keyof typeof content.auth)[]).map((key) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={`auth-${key}`}>{AUTH_COPY_LABELS[key]}</Label>
                <Input
                  id={`auth-${key}`}
                  value={content.auth[key]}
                  onChange={(e) =>
                    setContent((p) => ({
                      ...p,
                      auth: { ...p.auth, [key]: e.target.value },
                    }))
                  }
                />
              </div>
            ))}
            {!hideSave ? (
              <SaveButton saving={saving === "auth"} onClick={() => save("auth")} />
            ) : null}
          </TabsContent>
        </Tabs>
  );

  if (hideHeader) return inner;

  return (
    <Card className="rounded-lg shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Store copy</CardTitle>
        <p className="text-sm text-neutral-500">
          Size guide, empty states, login copy, and other storefront strings.
        </p>
      </CardHeader>
      <CardContent>{inner}</CardContent>
    </Card>
  );
}

/** Save all CMS blocks (used by unified Page content save bar). */
export async function saveAllCmsContent(content: AllCmsContent) {
  for (const key of TABS.map((t) => t.key)) {
    const res = await fetch("/api/admin/cms", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, data: content[key] }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Failed to save ${key}`);
    }
  }
}

function StoreCopyField({
  fieldKey,
  value,
  onChange,
}: {
  fieldKey: keyof StoreCopyData;
  value: string;
  onChange: (value: string) => void;
}) {
  const label = STORE_COPY_LABELS[fieldKey];
  const isImageUrl =
    fieldKey === "notFoundImageUrl" ||
    fieldKey === "notFoundBackgroundImageUrl";
  const isDescription =
    fieldKey.endsWith("Description") || fieldKey === "notFoundDescription";

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

  if (isDescription) {
    return (
      <div className="space-y-2">
        <Label htmlFor={`copy-${fieldKey}`}>{label}</Label>
        <Textarea
          id={`copy-${fieldKey}`}
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={`copy-${fieldKey}`}>{label}</Label>
      <Input
        id={`copy-${fieldKey}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function SaveButton({ saving, onClick }: { saving: boolean; onClick: () => void }) {
  return (
    <Button type="button" onClick={onClick} disabled={saving}>
      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Save changes
    </Button>
  );
}
