import { auth } from "@/lib/auth";
import { adminFetch } from "@/lib/admin-api";
import { getGoogleSheetsUrl, isGoogleSheetsConfigured } from "@/lib/google-sheets";
import { isSuperAdmin } from "@/lib/roles";
import { NewsletterSubscribersTable } from "@/components/admin/newsletter-subscribers-table";

type NewsletterResponse = {
  subscribers: Array<{
    id: string;
    email: string;
    active: boolean;
    createdAt: string;
  }>;
  total: number;
};

export default async function AdminNewsletterPage() {
  const session = await auth();
  const { subscribers } = await adminFetch<NewsletterResponse>("/api/admin/newsletter");

  return (
    <NewsletterSubscribersTable
      initialSubscribers={subscribers}
      canDelete={isSuperAdmin(session?.user?.role)}
      sheetsConfigured={isGoogleSheetsConfigured()}
      sheetsUrl={getGoogleSheetsUrl()}
    />
  );
}
