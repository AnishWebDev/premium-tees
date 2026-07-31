"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { formatDate, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const RETURN_STATUSES = ["REQUESTED", "APPROVED", "REJECTED", "REFUNDED"] as const;
type ReturnStatus = (typeof RETURN_STATUSES)[number];

type ReturnRow = {
  id: string;
  status: ReturnStatus;
  reason: string;
  notes: string | null;
  adminNote: string | null;
  createdAt: string;
  user: { name: string | null; email: string | null };
  order: {
    id: string;
    orderNumber: string;
    total: number;
    status: string;
  };
};

type ReturnsTableProps = {
  initialReturns: ReturnRow[];
};

export function ReturnsTable({ initialReturns }: ReturnsTableProps) {
  const [returns, setReturns] = useState(initialReturns);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const updateReturn = async (returnId: string, status: ReturnStatus) => {
    setUpdatingId(returnId);
    try {
      const res = await fetch("/api/admin/returns", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          returnId,
          status,
          adminNote: notes[returnId]?.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to update return");
        return;
      }
      setReturns((prev) =>
        prev.map((item) =>
          item.id === returnId
            ? {
                ...item,
                status: data.status,
                adminNote: data.adminNote,
              }
            : item
        )
      );
      toast.success("Return updated — customer notified");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Card className="rounded-lg shadow-sm">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Admin note</TableHead>
              <TableHead className="text-right">Update</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {returns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-neutral-500">
                  No return requests yet
                </TableCell>
              </TableRow>
            ) : (
              returns.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Link
                      href={`/admin/orders/${item.order.id}/print`}
                      className="font-medium hover:underline"
                    >
                      {item.order.orderNumber}
                    </Link>
                    <p className="text-xs text-neutral-500">
                      {formatPrice(item.order.total)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{item.user.name ?? "Customer"}</p>
                    <p className="text-xs text-neutral-500">{item.user.email}</p>
                  </TableCell>
                  <TableCell className="max-w-[220px]">
                    <p className="text-sm text-neutral-700">{item.reason}</p>
                    {item.notes ? (
                      <p className="mt-1 text-xs text-neutral-500">{item.notes}</p>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-neutral-500">
                    {formatDate(item.createdAt, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {item.status.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Input
                      className="h-8 w-40"
                      placeholder="Note to customer"
                      defaultValue={item.adminNote ?? ""}
                      onChange={(e) =>
                        setNotes((prev) => ({ ...prev, [item.id]: e.target.value }))
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Select
                        value={item.status}
                        disabled={updatingId === item.id}
                        onValueChange={(v) =>
                          void updateReturn(item.id, v as ReturnStatus)
                        }
                      >
                        <SelectTrigger className="h-8 w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RETURN_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.charAt(0) + status.slice(1).toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        disabled={updatingId === item.id}
                        onClick={() => void updateReturn(item.id, item.status)}
                      >
                        Save note
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
