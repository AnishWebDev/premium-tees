"use client";

import type { AllCmsContent, CmsKey, LegalSection } from "@/lib/cms-content";
import { STORE_COPY_LABELS } from "@/lib/cms-content";
import type { ContentKey } from "@/lib/site-content";
import { pageKindForSlug } from "@/lib/page-catalog";
import { SiteContentEditor } from "@/components/admin/site-content-editor";
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

type PageLegacyEditorProps = {
  pageSlug: string;
  siteContent: import("@/lib/site-content").AllSiteContent;
  onSiteContentChange: (content: import("@/lib/site-content").AllSiteContent) => void;
  cmsContent: AllCmsContent;
  onCmsContentChange: (content: AllCmsContent) => void;
};

const SITE_TAB_FOR_KIND: Partial<Record<string, ContentKey>> = {
  "site-about": "about",
  "site-contact": "contact",
  "site-faq": "faq",
};

export function PageLegacyEditor({
  pageSlug,
  siteContent,
  onSiteContentChange,
  cmsContent,
  onCmsContentChange,
}: PageLegacyEditorProps) {
  const kind = pageKindForSlug(pageSlug);
  const siteTab = SITE_TAB_FOR_KIND[kind];

  if (siteTab) {
    return (
      <SiteContentEditor
        initialContent={siteContent}
        content={siteContent}
        onContentChange={onSiteContentChange}
        embedMode
        activeTab={siteTab}
        hideSave
      />
    );
  }

  if (kind === "cms-collections") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Collections page copy</CardTitle>
          <CardDescription>Heading shown on /collections</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Page title</Label>
            <Input
              value={cmsContent.collections.title}
              onChange={(e) =>
                onCmsContentChange({
                  ...cmsContent,
                  collections: {
                    ...cmsContent.collections,
                    title: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Subtitle</Label>
            <Textarea
              value={cmsContent.collections.subtitle}
              onChange={(e) =>
                onCmsContentChange({
                  ...cmsContent,
                  collections: {
                    ...cmsContent.collections,
                    subtitle: e.target.value,
                  },
                })
              }
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (kind === "cms-store-shop") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Shop page copy</CardTitle>
          <CardDescription>
            Empty states and labels for the product catalog at /shop
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(["shopEmptyTitle", "shopEmptyDescription"] as const).map((key) => (
            <div key={key} className="space-y-2">
              <Label>{STORE_COPY_LABELS[key]}</Label>
              <Input
                value={cmsContent.storeCopy[key]}
                onChange={(e) =>
                  onCmsContentChange({
                    ...cmsContent,
                    storeCopy: {
                      ...cmsContent.storeCopy,
                      [key]: e.target.value,
                    },
                  })
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (kind === "cms-legal-terms" || kind === "cms-legal-privacy") {
    const pageKey = kind === "cms-legal-terms" ? "terms" : "privacy";
    const page = cmsContent.legal[pageKey];
    return (
      <LegalPageEditor
        title={pageKey === "terms" ? "Terms of service" : "Privacy policy"}
        page={page}
        onChange={(next) =>
          onCmsContentChange({
            ...cmsContent,
            legal: { ...cmsContent.legal, [pageKey]: next },
          })
        }
      />
    );
  }

  if (kind === "cms-legal-shipping") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Shipping information</CardTitle>
          <CardDescription>Content for /shipping</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Intro</Label>
            <Textarea
              rows={4}
              value={cmsContent.legal.shippingIntro}
              onChange={(e) =>
                onCmsContentChange({
                  ...cmsContent,
                  legal: {
                    ...cmsContent.legal,
                    shippingIntro: e.target.value,
                  },
                })
              }
            />
          </div>
          {cmsContent.legal.shippingSections.map((section, index) => (
            <LegalSectionFields
              key={index}
              section={section}
              onChange={(next) =>
                onCmsContentChange({
                  ...cmsContent,
                  legal: {
                    ...cmsContent.legal,
                    shippingSections: cmsContent.legal.shippingSections.map(
                      (s, i) => (i === index ? next : s)
                    ),
                  },
                })
              }
            />
          ))}
        </CardContent>
      </Card>
    );
  }

  return null;
}

function LegalPageEditor({
  title,
  page,
  onChange,
}: {
  title: string;
  page: import("@/lib/cms-content").LegalPageData;
  onChange: (page: import("@/lib/cms-content").LegalPageData) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={page.title}
              onChange={(e) => onChange({ ...page, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Last updated</Label>
            <Input
              value={page.lastUpdated}
              onChange={(e) =>
                onChange({ ...page, lastUpdated: e.target.value })
              }
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Contact email</Label>
          <Input
            value={page.contactEmail}
            onChange={(e) =>
              onChange({ ...page, contactEmail: e.target.value })
            }
          />
        </div>
        {page.sections.map((section, index) => (
          <LegalSectionFields
            key={index}
            section={section}
            onChange={(next) =>
              onChange({
                ...page,
                sections: page.sections.map((s, i) => (i === index ? next : s)),
              })
            }
          />
        ))}
      </CardContent>
    </Card>
  );
}

function LegalSectionFields({
  section,
  onChange,
}: {
  section: LegalSection;
  onChange: (section: LegalSection) => void;
}) {
  return (
    <div className="space-y-2 rounded-lg border border-neutral-200 p-3">
      <Input
        value={section.heading}
        placeholder="Section heading"
        onChange={(e) => onChange({ ...section, heading: e.target.value })}
      />
      <Textarea
        value={section.paragraphs.join("\n\n")}
        placeholder="Paragraphs (blank line between)"
        rows={4}
        onChange={(e) =>
          onChange({
            ...section,
            paragraphs: e.target.value.split(/\n\n+/).filter(Boolean),
          })
        }
      />
    </div>
  );
}

/** Which CMS key to save when editing a legacy page slug. */
export function cmsSaveKeyForPageSlug(slug: string): CmsKey | null {
  const kind = pageKindForSlug(slug);
  if (kind === "cms-collections") return "collections";
  if (kind === "cms-store-shop") return "storeCopy";
  if (
    kind === "cms-legal-terms" ||
    kind === "cms-legal-privacy" ||
    kind === "cms-legal-shipping"
  ) {
    return "legal";
  }
  return null;
}

export function siteSaveKeyForPageSlug(slug: string): ContentKey | null {
  const kind = pageKindForSlug(slug);
  const map: Partial<Record<string, ContentKey>> = {
    "site-about": "about",
    "site-contact": "contact",
    "site-faq": "faq",
  };
  return map[kind] ?? null;
}
