"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { AudienceSettings } from "@/lib/audience";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type StoreSettingsCardProps = {
  isSuperAdmin: boolean;
};

type StoreSettingsResponse = {
  settings: {
    paymentsEnabled: boolean;
    audiencesEnabled: AudienceSettings;
    updatedAt: string;
  };
  sheetsConfigured: boolean;
  sheetsUrl: string | null;
};

export function StoreSettingsCard({ isSuperAdmin }: StoreSettingsCardProps) {
  const [loading, setLoading] = useState(true);
  const [savingPayments, setSavingPayments] = useState(false);
  const [savingAudiences, setSavingAudiences] = useState(false);
  const [paymentsEnabled, setPaymentsEnabled] = useState(false);
  const [audiencesEnabled, setAudiencesEnabled] = useState<AudienceSettings>({
    women: false,
    girl: false,
    boy: false,
  });
  const [sheetsConfigured, setSheetsConfigured] = useState(false);
  const [sheetsUrl, setSheetsUrl] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/store-settings");
      const data = (await res.json()) as StoreSettingsResponse & { error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to load settings");
      setPaymentsEnabled(data.settings.paymentsEnabled);
      setAudiencesEnabled(data.settings.audiencesEnabled);
      setSheetsConfigured(data.sheetsConfigured);
      setSheetsUrl(data.sheetsUrl);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const savePayments = async (nextPaymentsEnabled: boolean) => {
    setSavingPayments(true);
    try {
      const res = await fetch("/api/admin/store-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentsEnabled: nextPaymentsEnabled }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setPaymentsEnabled(nextPaymentsEnabled);
      toast.success(
        nextPaymentsEnabled
          ? "Payment checkout enabled for customers"
          : "Lead capture mode enabled — no payment UI for customers"
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
      void load();
    } finally {
      setSavingPayments(false);
    }
  };

  const saveAudiences = async (next: AudienceSettings) => {
    setSavingAudiences(true);
    try {
      const res = await fetch("/api/admin/store-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audiencesEnabled: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setAudiencesEnabled(next);
      toast.success("Shop audience filters updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
      void load();
    } finally {
      setSavingAudiences(false);
    }
  };

  const toggleAudience = (key: keyof AudienceSettings, checked: boolean) => {
    const next = { ...audiencesEnabled, [key]: checked };
    setAudiencesEnabled(next);
    void saveAudiences(next);
  };

  if (loading) {
    return (
      <Card className="rounded-lg shadow-sm">
        <CardContent className="flex items-center gap-2 py-10 text-sm text-neutral-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading store settings…
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Checkout mode</CardTitle>
          <p className="text-sm text-neutral-500">
            {isSuperAdmin
              ? "Toggle payment UI for customers. When off, checkout collects address and order details only — ideal for testing demand."
              : "Current checkout mode and customer interest sheet."}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-sm font-medium text-neutral-900">
              {paymentsEnabled ? "Payment checkout" : "Lead capture (no payment)"}
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              {paymentsEnabled
                ? "Customers pay via Razorpay at checkout."
                : "Customers submit their cart, shipping address, and contact info. Orders are saved as leads."}
            </p>

            {isSuperAdmin && (
              <div className="mt-4 flex items-start gap-3">
                <Checkbox
                  id="payments-enabled"
                  role="switch"
                  aria-checked={paymentsEnabled}
                  checked={paymentsEnabled}
                  disabled={savingPayments}
                  onCheckedChange={(checked) => {
                    const next = checked === true;
                    setPaymentsEnabled(next);
                    void savePayments(next);
                  }}
                />
                <div className="grid gap-1">
                  <Label htmlFor="payments-enabled" className="cursor-pointer text-sm">
                    Enable payment UI for customers
                  </Label>
                  <p className="text-xs text-neutral-500">
                    SuperAdmin only. Requires Razorpay to be configured for live payments.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-neutral-100 pt-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-neutral-900">Customer interest sheet</p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {sheetsConfigured
                    ? "Orders sync to the Orders tab; Contact form submissions go to the Contact tab."
                    : "Set GOOGLE_SHEETS_* env vars and share the sheet with the service account."}
                </p>
              </div>
              <span
                className={
                  sheetsConfigured
                    ? "text-xs font-medium uppercase tracking-wider text-emerald-700"
                    : "text-xs font-medium uppercase tracking-wider text-amber-700"
                }
              >
                {sheetsConfigured ? "Connected" : "Not set up"}
              </span>
            </div>

            {sheetsUrl && (
              <Button asChild variant="outline" size="sm" className="mt-4">
                <a href={sheetsUrl} target="_blank" rel="noopener noreferrer">
                  Open Google Sheet
                  <ExternalLink className="ml-2 h-3.5 w-3.5" />
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Shop audience filters</CardTitle>
          <p className="text-sm text-neutral-500">
            The shop filter bar always includes <strong>Men</strong>. Additional
            audience options can be enabled when needed.
          </p>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-sm font-medium text-neutral-900">Men</p>
            <p className="mt-1 text-xs text-neutral-500">Always visible in the shop filter.</p>

            {isSuperAdmin ? (
              <div className="mt-4 space-y-3">
                {(
                  [
                    ["women", "Women"],
                    ["girl", "Girls"],
                    ["boy", "Boys"],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key} className="flex items-start gap-3">
                    <Checkbox
                      id={`audience-${key}`}
                      role="switch"
                      aria-checked={audiencesEnabled[key]}
                      checked={audiencesEnabled[key]}
                      disabled={savingAudiences}
                      onCheckedChange={(checked) =>
                        toggleAudience(key, checked === true)
                      }
                    />
                    <Label htmlFor={`audience-${key}`} className="cursor-pointer text-sm">
                      Show {label} in shop filters
                    </Label>
                  </div>
                ))}
              </div>
            ) : (
              <ul className="mt-3 space-y-1 text-xs text-neutral-600">
                <li>Women: {audiencesEnabled.women ? "Enabled" : "Hidden"}</li>
                <li>Girls: {audiencesEnabled.girl ? "Enabled" : "Hidden"}</li>
                <li>Boys: {audiencesEnabled.boy ? "Enabled" : "Hidden"}</li>
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
