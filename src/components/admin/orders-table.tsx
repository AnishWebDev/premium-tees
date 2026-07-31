"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Printer } from "lucide-react";
import { toast } from "sonner";
import { formatDate, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const ORDER_STATUSES = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;

type OrderStatus = (typeof ORDER_STATUSES)[number];

type Order = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  guestEmail?: string | null;
  trackingNumber?: string | null;
  carrier?: string | null;
  user: { name: string | null; email: string | null } | null;
  items: Array<{ name: string; quantity: number }>;
};

type OrdersTableProps = {
  initialOrders: Order[];
  initialStatus?: OrderStatus;
};

const statusVariant: Record<
  OrderStatus,
  "default" | "secondary" | "success" | "warning" | "destructive" | "outline"
> = {
  PENDING: "warning",
  PAID: "success",
  PROCESSING: "secondary",
  SHIPPED: "default",
  DELIVERED: "success",
  CANCELLED: "destructive",
  REFUNDED: "outline",
};

export function OrdersTable({ initialOrders, initialStatus }: OrdersTableProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus ?? "all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shipOrder, setShipOrder] = useState<Order | null>(null);
  const [carrier, setCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  const filtered = useMemo(() => {
    if (statusFilter === "all") return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  const fetchOrders = async (status?: string) => {
    setLoading(true);
    try {
      const params = status && status !== "all" ? `?status=${status}` : "";
      const res = await fetch(`/api/admin/orders${params}`);
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to load orders");
        return;
      }
      setOrders(data.orders);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    fetchOrders(value);
  };

  const patchOrder = async (
    orderId: string,
    payload: {
      status: OrderStatus;
      trackingNumber?: string;
      carrier?: string;
    }
  ) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, ...payload }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to update order");
        return false;
      }
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...data } : o)));
      toast.success(
        payload.status === "SHIPPED"
          ? "Order marked shipped — customer notified"
          : "Order status updated"
      );
      return true;
    } catch {
      toast.error("Something went wrong");
      return false;
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusChange = (order: Order, status: OrderStatus) => {
    if (status === "SHIPPED") {
      setShipOrder(order);
      setCarrier(order.carrier ?? "");
      setTrackingNumber(order.trackingNumber ?? "");
      return;
    }
    void patchOrder(order.id, { status });
  };

  const confirmShip = async () => {
    if (!shipOrder) return;
    const ok = await patchOrder(shipOrder.id, {
      status: "SHIPPED",
      carrier: carrier.trim() || undefined,
      trackingNumber: trackingNumber.trim() || undefined,
    });
    if (ok) setShipOrder(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {ORDER_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {loading && <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />}
      </div>

      <Card className="rounded-lg shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-neutral-500">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <p className="font-medium">{order.orderNumber}</p>
                      {(order.trackingNumber || order.carrier) && (
                        <p className="mt-1 text-xs text-neutral-500">
                          {[order.carrier, order.trackingNumber].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{order.user?.name ?? "Guest"}</p>
                        <p className="text-xs text-neutral-500">
                          {order.user?.email ?? order.guestEmail ?? "—"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <p className="truncate text-sm text-neutral-600">
                        {order.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
                      </p>
                    </TableCell>
                    <TableCell className="text-neutral-500">
                      {formatDate(order.createdAt, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="font-medium tabular-nums">
                      {formatPrice(order.total)}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onValueChange={(v) =>
                          handleStatusChange(order, v as OrderStatus)
                        }
                      >
                        <SelectTrigger className="h-8 w-36">
                          <SelectValue>
                            <Badge
                              variant={statusVariant[order.status]}
                              className="font-normal"
                            >
                              {order.status.toLowerCase()}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {ORDER_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.charAt(0) + status.slice(1).toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/orders/${order.id}/print`}>
                          <Printer className="mr-1.5 h-3.5 w-3.5" />
                          Pack
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(shipOrder)}
        onOpenChange={(open) => {
          if (!open) setShipOrder(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as shipped</DialogTitle>
            <DialogDescription>
              Add carrier and tracking for{" "}
              <span className="font-medium text-neutral-950">
                {shipOrder?.orderNumber}
              </span>
              . The customer gets a shipped email.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label htmlFor="carrier">Carrier</Label>
              <Input
                id="carrier"
                className="mt-2"
                placeholder="e.g. Delhivery, BlueDart, India Post"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="trackingNumber">Tracking number</Label>
              <Input
                id="trackingNumber"
                className="mt-2"
                placeholder="Tracking ID"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShipOrder(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => void confirmShip()}
              disabled={updatingId === shipOrder?.id}
            >
              {updatingId === shipOrder?.id ? "Saving…" : "Ship & notify"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
