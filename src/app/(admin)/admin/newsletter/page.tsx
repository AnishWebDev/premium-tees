import Link from "next/link";
import { Download } from "lucide-react";
import { adminFetch } from "@/lib/admin-api";
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
  const { subscribers, total } = await adminFetch<NewsletterResponse>("/api/admin/newsletter");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Newsletter</h1>
          <p className="text-sm text-neutral-500">{total} subscribers total</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-md" asChild>
          <Link href="/api/admin/newsletter?format=csv">
            <Download className="h-4 w-4" />
            Export CSV
          </Link>
        </Button>
      </div>

      <Card className="rounded-lg shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subscribed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-neutral-500">
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
