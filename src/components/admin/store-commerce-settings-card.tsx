"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { StoreSettings } from "@/lib/store-settings";
import { ImageUrlField } from "@/components/admin/image-url-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  isSuperAdmin: boolean;
};

export function StoreCommerceSettingsCard({ isSuperAdmin }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/store-settings");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setSettings(data.settings);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    if (!settings || !isSuperAdmin) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/store-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipping: settings.shipping,
          tax: settings.tax,
          seo: settings.seo,
          announcement: settings.announcement,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setSettings(data.settings);
      toast.success("Commerce & SEO settings saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
      void load();
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <Card className="rounded-lg shadow-sm">
        <CardContent className="flex items-center gap-2 py-10 text-sm text-neutral-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading commerce settings…
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Shipping & tax</CardTitle>
          <p className="text-sm text-neutral-500">
            Rates used in cart, checkout, and the shipping page.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="free-shipping">Free shipping threshold (₹)</Label>
              <Input
                id="free-shipping"
                type="number"
                min={0}
                disabled={!isSuperAdmin}
                value={settings.shipping.freeShippingThreshold}
                onChange={(e) =>
                  setSettings((s) =>
                    s
                      ? {
                          ...s,
                          shipping: {
                            ...s.shipping,
                            freeShippingThreshold: Number(e.target.value) || 0,
                          },
                        }
                      : s
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gst-rate">GST rate (0.05 = 5%)</Label>
              <Input
                id="gst-rate"
                type="number"
                min={0}
                max={1}
                step={0.01}
                disabled={!isSuperAdmin}
                value={settings.tax.gstRate}
                onChange={(e) =>
                  setSettings((s) =>
                    s ? { ...s, tax: { gstRate: Number(e.target.value) || 0 } } : s
                  )
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pincode-days">Default delivery estimate (pincode checker)</Label>
            <Input
              id="pincode-days"
              disabled={!isSuperAdmin}
              value={settings.shipping.pincodeDeliveryDays}
              onChange={(e) =>
                setSettings((s) =>
                  s
                    ? {
                        ...s,
                        shipping: { ...s.shipping, pincodeDeliveryDays: e.target.value },
                      }
                    : s
                )
              }
            />
          </div>
          {settings.shipping.methods.map((method, index) => (
            <div key={method.id} className="grid gap-3 rounded border border-neutral-200 p-3 sm:grid-cols-4">
              <div className="space-y-1">
                <Label>Method</Label>
                <p className="text-sm font-medium capitalize">{method.id}</p>
              </div>
              <div className="space-y-1">
                <Label>Label</Label>
                <Input
                  disabled={!isSuperAdmin}
                  value={method.label}
                  onChange={(e) =>
                    setSettings((s) => {
                      if (!s) return s;
                      const methods = [...s.shipping.methods];
                      methods[index] = { ...methods[index], label: e.target.value };
                      return { ...s, shipping: { ...s.shipping, methods } };
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Price (₹)</Label>
                <Input
                  type="number"
                  min={0}
                  disabled={!isSuperAdmin}
                  value={method.price}
                  onChange={(e) =>
                    setSettings((s) => {
                      if (!s) return s;
                      const methods = [...s.shipping.methods];
                      methods[index] = { ...methods[index], price: Number(e.target.value) || 0 };
                      return { ...s, shipping: { ...s.shipping, methods } };
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Delivery time</Label>
                <Input
                  disabled={!isSuperAdmin}
                  value={method.days}
                  onChange={(e) =>
                    setSettings((s) => {
                      if (!s) return s;
                      const methods = [...s.shipping.methods];
                      methods[index] = { ...methods[index], days: e.target.value };
                      return { ...s, shipping: { ...s.shipping, methods } };
                    })
                  }
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">SEO & analytics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title-suffix">Default title suffix</Label>
            <Input
              id="title-suffix"
              disabled={!isSuperAdmin}
              value={settings.seo.titleSuffix}
              onChange={(e) =>
                setSettings((s) =>
                  s ? { ...s, seo: { ...s.seo, titleSuffix: e.target.value } } : s
                )
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="keywords">Keywords (comma-separated)</Label>
            <Input
              id="keywords"
              disabled={!isSuperAdmin}
              value={settings.seo.keywords.join(", ")}
              onChange={(e) =>
                setSettings((s) =>
                  s
                    ? {
                        ...s,
                        seo: {
                          ...s.seo,
                          keywords: e.target.value.split(",").map((k) => k.trim()).filter(Boolean),
                        },
                      }
                    : s
                )
              }
            />
          </div>
          {isSuperAdmin ? (
            <ImageUrlField
              label="Open Graph image URL"
              value={settings.seo.ogImageUrl}
              onChange={(url) =>
                setSettings((s) => (s ? { ...s, seo: { ...s.seo, ogImageUrl: url } } : s))
              }
            />
          ) : (
            <p className="text-sm text-neutral-500">{settings.seo.ogImageUrl || "Not set"}</p>
          )}
          <div className="space-y-2">
            <Label htmlFor="analytics-id">Google Analytics measurement ID</Label>
            <Input
              id="analytics-id"
              placeholder="G-XXXXXXXXXX"
              disabled={!isSuperAdmin}
              value={settings.seo.analyticsId}
              onChange={(e) =>
                setSettings((s) =>
                  s ? { ...s, seo: { ...s.seo, analyticsId: e.target.value } } : s
                )
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Site-wide announcement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="announcement-enabled"
              role="switch"
              aria-checked={settings.announcement.enabled}
              checked={settings.announcement.enabled}
              disabled={!isSuperAdmin || saving}
              onCheckedChange={(checked) =>
                setSettings((s) =>
                  s
                    ? {
                        ...s,
                        announcement: { ...s.announcement, enabled: checked === true },
                      }
                    : s
                )
              }
            />
            <Label htmlFor="announcement-enabled" className="cursor-pointer text-sm">
              Show announcement bar on all storefront pages
            </Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="announcement-message">Message</Label>
            <Textarea
              id="announcement-message"
              disabled={!isSuperAdmin}
              value={settings.announcement.message}
              onChange={(e) =>
                setSettings((s) =>
                  s
                    ? { ...s, announcement: { ...s.announcement, message: e.target.value } }
                    : s
                )
              }
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="announcement-link">Link URL (optional)</Label>
              <Input
                id="announcement-link"
                disabled={!isSuperAdmin}
                value={settings.announcement.linkHref}
                onChange={(e) =>
                  setSettings((s) =>
                    s
                      ? { ...s, announcement: { ...s.announcement, linkHref: e.target.value } }
                      : s
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="announcement-link-label">Link label</Label>
              <Input
                id="announcement-link-label"
                disabled={!isSuperAdmin}
                value={settings.announcement.linkLabel}
                onChange={(e) =>
                  setSettings((s) =>
                    s
                      ? { ...s, announcement: { ...s.announcement, linkLabel: e.target.value } }
                      : s
                  )
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {isSuperAdmin && (
        <Button type="button" onClick={() => void save()} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save commerce & SEO settings
        </Button>
      )}
    </div>
  );
}
