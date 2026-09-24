"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, ExternalLink, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Subscriber = {
  id: string;
  email: string;
  active: boolean;
  createdAt: string;
};

type NewsletterSubscribersTableProps = {
  initialSubscribers: Subscriber[];
  canDelete?: boolean;
  sheetsConfigured?: boolean;
  sheetsUrl?: string | null;
};

export function NewsletterSubscribersTable({
  initialSubscribers,
  canDelete = false,
  sheetsConfigured = false,
  sheetsUrl,
}: NewsletterSubscribersTableProps) {
  const router = useRouter();
  const [subscribers, setSubscribers] = useState(initialSubscribers);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const handleSyncSheets = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/admin/newsletter", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "Failed to sync Google Sheet");
        return;
      }
      toast.success(
        `Synced ${data.synced ?? 0} subscriber(s)${
          data.removedFromSheet ? ` · removed ${data.removedFromSheet} orphan row(s) from sheet` : ""
        }`
      );
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Remove subscriber "${email}" from the site and Google Sheet?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/newsletter/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "Failed to delete subscriber");
        return;
      }
      toast.success("Subscriber removed");
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Newsletter</h1>
          <p className="text-sm text-neutral-500">{subscribers.length} subscribers total</p>
          {sheetsConfigured ? (
            <p className="mt-1 text-xs text-neutral-500">
              Google Sheets sync enabled
              {sheetsUrl ? (
                <>
                  {" · "}
                  <a
                    href={sheetsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-neutral-700 underline-offset-2 hover:underline"
                  >
                    Open spreadsheet
                    <ExternalLink className="ml-0.5 inline h-3 w-3" aria-hidden />
                  </a>
                </>
              ) : null}
            </p>
          ) : (
            <p className="mt-1 text-xs text-amber-700">
              Google Sheets not configured — subscribers save in the database only.
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {sheetsConfigured && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-md"
              disabled={syncing}
              onClick={() => void handleSyncSheets()}
            >
              {syncing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Match Google Sheet
            </Button>
          )}
          <Button variant="outline" size="sm" className="rounded-md" asChild>
            <Link href="/api/admin/newsletter?format=csv">
              <Download className="h-4 w-4" />
              Export CSV
            </Link>
          </Button>
        </div>
      </div>

      <Card className="rounded-lg shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subscribed</TableHead>
                {canDelete && (
                  <TableHead className="w-[72px]">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={canDelete ? 4 : 3}
                    className="py-8 text-center text-neutral-500"
                  >
                    No subscribers yet
                  </TableCell>
                </TableRow>
              ) : (
                subscribers.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell className="font-medium">{subscriber.email}</TableCell>
                    <TableCell>
                      {subscriber.active ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-neutral-500">
                      {formatDate(subscriber.createdAt, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    {canDelete && (
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700"
                          aria-label={`Delete ${subscriber.email}`}
                          disabled={deletingId === subscriber.id}
                          onClick={() => void handleDelete(subscriber.id, subscriber.email)}
                        >
                          {deletingId === subscriber.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
