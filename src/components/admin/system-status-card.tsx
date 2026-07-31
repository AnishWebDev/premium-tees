import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SystemStatusCardProps = {
  status: {
    demoCheckout: boolean;
    razorpayConfigured: boolean;
    emailConfigured: boolean;
    orderNotifyEmail: boolean;
    appUrl: string | null;
  };
};

function StatusRow({ label, ok, detail }: { label: string; ok: boolean; detail: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-neutral-100 py-3 last:border-0">
      <div>
        <p className="text-sm font-medium text-neutral-900">{label}</p>
        <p className="mt-0.5 text-xs text-neutral-500">{detail}</p>
      </div>
      <span
        className={
          ok
            ? "text-xs font-medium uppercase tracking-wider text-emerald-700"
            : "text-xs font-medium uppercase tracking-wider text-amber-700"
        }
      >
        {ok ? "Ready" : "Off"}
      </span>
    </div>
  );
}

export function SystemStatusCard({ status }: SystemStatusCardProps) {
  return (
    <Card className="rounded-lg shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">System status</CardTitle>
        <p className="text-sm text-neutral-500">
          SuperAdmin view — configuration health (no secrets shown).
        </p>
      </CardHeader>
      <CardContent>
        <StatusRow
          label="Payments"
          ok={status.razorpayConfigured || status.demoCheckout}
          detail={
            status.razorpayConfigured
              ? "Razorpay keys configured"
              : status.demoCheckout
                ? "Staff-only demo checkout (guests blocked until Razorpay)"
                : "Neither Razorpay nor demo checkout enabled"
          }
        />
        <StatusRow
          label="Order emails"
          ok={status.emailConfigured}
          detail={
            status.emailConfigured
              ? "Resend configured"
              : "Set RESEND_API_KEY + EMAIL_FROM"
          }
        />
        <StatusRow
          label="Owner BCC"
          ok={status.orderNotifyEmail}
          detail={
            status.orderNotifyEmail
              ? "ORDER_NOTIFY_EMAIL is set"
              : "Add ORDER_NOTIFY_EMAIL for your copy"
          }
        />
        <StatusRow
          label="App URL"
          ok={Boolean(status.appUrl)}
          detail={status.appUrl ?? "Set NEXT_PUBLIC_APP_URL / AUTH_URL"}
        />
      </CardContent>
    </Card>
  );
}
