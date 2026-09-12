"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import type { AllCmsContent, CmsKey, LegalSection, SizeGuideRow } from "@/lib/cms-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type CmsExtraEditorProps = {
  initialContent: AllCmsContent;
};

const TABS: { key: CmsKey; label: string }[] = [
  { key: "collections", label: "Collections" },
  { key: "legal", label: "Legal" },
  { key: "storeCopy", label: "Store copy" },
  { key: "sizeGuide", label: "Size guide" },
  { key: "auth", label: "Auth pages" },
];

export function CmsExtraEditor({ initialContent }: CmsExtraEditorProps) {
  const [content, setContent] = useState(initialContent);
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

  return (
    <Card className="rounded-lg shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Pages & store copy</CardTitle>
        <p className="text-sm text-neutral-500">
          Legal pages, collections heading, size guide, empty states, and login copy.
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="collections">
          <TabsList className="mb-6 flex h-auto flex-wrap gap-1">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.key} value={tab.key}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

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
            <SaveButton saving={saving === "collections"} onClick={() => save("collections")} />
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
            <SaveButton saving={saving === "legal"} onClick={() => save("legal")} />
          </TabsContent>

          <TabsContent value="storeCopy" className="space-y-4">
            {(Object.keys(content.storeCopy) as (keyof typeof content.storeCopy)[]).map((key) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={`copy-${key}`}>{key.replace(/([A-Z])/g, " $1")}</Label>
                <Input
                  id={`copy-${key}`}
                  value={content.storeCopy[key]}
                  onChange={(e) =>
                    setContent((p) => ({
                      ...p,
                      storeCopy: { ...p.storeCopy, [key]: e.target.value },
                    }))
                  }
                />
              </div>
            ))}
            <SaveButton saving={saving === "storeCopy"} onClick={() => save("storeCopy")} />
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
            <SaveButton saving={saving === "sizeGuide"} onClick={() => save("sizeGuide")} />
          </TabsContent>

          <TabsContent value="auth" className="space-y-4">
            {(Object.keys(content.auth) as (keyof typeof content.auth)[]).map((key) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={`auth-${key}`}>{key.replace(/([A-Z])/g, " $1")}</Label>
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
            <SaveButton saving={saving === "auth"} onClick={() => save("auth")} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
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
