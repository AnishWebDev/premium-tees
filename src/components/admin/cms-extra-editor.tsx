"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  AUTH_COPY_LABELS,
  GLOBAL_CMS_TAB_KEYS,
  GLOBAL_MISC_COPY_FIELDS,
  STORE_COPY_LABELS,
  type AllCmsContent,
  type CmsKey,
  type SizeGuideRow,
} from "@/lib/cms-content";
import { NotFoundPageEditor } from "@/components/admin/not-found-page-editor";
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
  { key: "storeCopy", label: "404 & messages" },
  { key: "sizeGuide", label: "Size guide" },
  { key: "auth", label: "Auth pages" },
];

export function CmsExtraEditor({
  initialContent,
  hideSave = false,
  hideHeader = false,
  content: controlledContent,
  onContentChange,
  defaultTab = "storeCopy",
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

          <TabsContent value="storeCopy" className="space-y-6">
            <NotFoundPageEditor
              storeCopy={content.storeCopy}
              onChange={(storeCopy) =>
                setContent((p) => ({ ...p, storeCopy }))
              }
            />

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Cart & checkout messages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {GLOBAL_MISC_COPY_FIELDS.map((key) => (
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
        <CardTitle className="text-base">Global copy</CardTitle>
        <p className="text-sm text-neutral-500">
          404 screen, cart empty state, checkout messages, size guide, and login
          copy. Page-specific content is under Pages.
        </p>
      </CardHeader>
      <CardContent>{inner}</CardContent>
    </Card>
  );
}

/** Save global CMS blocks (404, size guide, auth). */
export async function saveAllCmsContent(content: AllCmsContent) {
  for (const key of GLOBAL_CMS_TAB_KEYS) {
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
  fieldKey: (typeof GLOBAL_MISC_COPY_FIELDS)[number];
  value: string;
  onChange: (value: string) => void;
}) {
  const label = STORE_COPY_LABELS[fieldKey];
  const isDescription = fieldKey.endsWith("Description");

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
