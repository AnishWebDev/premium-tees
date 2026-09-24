"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatDate, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  minOrder: number | null;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
  startsAt: string;
  expiresAt: string | null;
};

type CouponFormState = {
  code: string;
  description: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: string;
  minOrder: string;
  maxUses: string;
  active: boolean;
  expiresAt: string;
};

const emptyForm = (): CouponFormState => ({
  code: "",
  description: "",
  discountType: "PERCENT",
  discountValue: "",
  minOrder: "",
  maxUses: "",
  active: true,
  expiresAt: "",
});

function couponToForm(coupon: Coupon): CouponFormState {
  return {
    code: coupon.code,
    description: coupon.description ?? "",
    discountType: coupon.discountType,
    discountValue: String(coupon.discountValue),
    minOrder: coupon.minOrder != null ? String(coupon.minOrder) : "",
    maxUses: coupon.maxUses != null ? String(coupon.maxUses) : "",
    active: coupon.active,
    expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : "",
  };
}

function formToPayload(form: CouponFormState) {
  return {
    code: form.code,
    description: form.description || undefined,
    discountType: form.discountType,
    discountValue: parseFloat(form.discountValue),
    minOrder: form.minOrder ? parseFloat(form.minOrder) : null,
    maxUses: form.maxUses ? parseInt(form.maxUses, 10) : null,
    active: form.active,
    expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
  };
}

type CouponsManagerProps = {
  initialCoupons: Coupon[];
  canDelete?: boolean;
};

export function CouponsManager({
  initialCoupons,
  canDelete = false,
}: CouponsManagerProps) {
  const router = useRouter();
  const [coupons, setCoupons] = useState(initialCoupons);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [editForm, setEditForm] = useState<CouponFormState>(emptyForm());
  const [editLoading, setEditLoading] = useState(false);
  const [form, setForm] = useState<CouponFormState>(emptyForm());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formToPayload(form)),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Failed to create coupon");
        return;
      }

      toast.success("Coupon created");
      setCoupons((prev) => [data, ...prev]);
      setForm(emptyForm());
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setEditForm(couponToForm(coupon));
  };

  const saveEdit = async () => {
    if (!editingCoupon) return;
    setEditLoading(true);
    try {
      const res = await fetch(`/api/admin/coupons/${editingCoupon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formToPayload(editForm)),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to update coupon");
        return;
      }
      toast.success("Coupon updated");
      setCoupons((prev) =>
        prev.map((c) => (c.id === editingCoupon.id ? { ...c, ...data } : c))
      );
      setEditingCoupon(null);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setEditLoading(false);
    }
  };

  const formatDiscount = (coupon: Coupon) =>
    coupon.discountType === "PERCENT"
      ? `${coupon.discountValue}%`
      : formatPrice(coupon.discountValue);

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete coupon "${code}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "Failed to delete coupon");
        return;
      }
      toast.success("Coupon deleted");
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDeletingId(null);
    }
  };

  const renderFormFields = (
    values: CouponFormState,
    setValues: React.Dispatch<React.SetStateAction<CouponFormState>>,
    idPrefix: string
  ) => (
    <>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-code`}>Code</Label>
        <Input
          id={`${idPrefix}-code`}
          value={values.code}
          onChange={(e) => setValues((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
          placeholder="SAVE20"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-description`}>Description</Label>
        <Input
          id={`${idPrefix}-description`}
          value={values.description}
          onChange={(e) => setValues((f) => ({ ...f, description: e.target.value }))}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select
            value={values.discountType}
            onValueChange={(v) =>
              setValues((f) => ({ ...f, discountType: v as "PERCENT" | "FIXED" }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PERCENT">Percent</SelectItem>
              <SelectItem value="FIXED">Fixed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-discountValue`}>Value</Label>
          <Input
            id={`${idPrefix}-discountValue`}
            type="number"
            step="0.01"
            min="0"
            value={values.discountValue}
            onChange={(e) => setValues((f) => ({ ...f, discountValue: e.target.value }))}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-minOrder`}>Min order (optional)</Label>
        <Input
          id={`${idPrefix}-minOrder`}
          type="number"
          step="0.01"
          min="0"
          value={values.minOrder}
          onChange={(e) => setValues((f) => ({ ...f, minOrder: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-maxUses`}>Max uses (optional)</Label>
        <Input
          id={`${idPrefix}-maxUses`}
          type="number"
          min="1"
          value={values.maxUses}
          onChange={(e) => setValues((f) => ({ ...f, maxUses: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-expiresAt`}>Expires (optional)</Label>
        <Input
          id={`${idPrefix}-expiresAt`}
          type="date"
          value={values.expiresAt}
          onChange={(e) => setValues((f) => ({ ...f, expiresAt: e.target.value }))}
        />
      </div>
      <label className="flex cursor-pointer items-center gap-2">
        <Checkbox
          checked={values.active}
          onCheckedChange={(checked) =>
            setValues((f) => ({ ...f, active: checked === true }))
          }
        />
        <span className="text-sm">Active</span>
      </label>
    </>
  );

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-lg shadow-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">All coupons</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Min order</TableHead>
                  <TableHead>Uses</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-neutral-500">
                      No coupons yet
                    </TableCell>
                  </TableRow>
                ) : (
                  coupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell>
                        <div>
                          <p className="font-mono font-medium">{coupon.code}</p>
                          {coupon.description && (
                            <p className="text-xs text-neutral-500">{coupon.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatDiscount(coupon)}</TableCell>
                      <TableCell>
                        {coupon.minOrder ? formatPrice(coupon.minOrder) : "—"}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {coupon.usedCount}
                        {coupon.maxUses ? ` / ${coupon.maxUses}` : ""}
                      </TableCell>
                      <TableCell className="text-neutral-500">
                        {coupon.expiresAt
                          ? formatDate(coupon.expiresAt, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Never"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={coupon.active ? "success" : "secondary"}>
                          {coupon.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label={`Edit ${coupon.code}`}
                            onClick={() => openEdit(coupon)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {canDelete && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-neutral-500 hover:text-red-600"
                              aria-label={`Delete ${coupon.code}`}
                              disabled={deletingId === coupon.id}
                              onClick={() => handleDelete(coupon.id, coupon.code)}
                            >
                              {deletingId === coupon.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="rounded-lg shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Create coupon</CardTitle>
            <p className="text-xs text-neutral-500">
              Each customer (email or account) can use a code once; Admin and SuperAdmin accounts are exempt. Optional max
              uses caps total redemptions store-wide.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {renderFormFields(form, setForm, "create")}
              <Button type="submit" disabled={loading} className="w-full rounded-md">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Create coupon
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={editingCoupon !== null}
        onOpenChange={(open) => {
          if (!open) setEditingCoupon(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit coupon</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">{renderFormFields(editForm, setEditForm, "edit")}</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCoupon(null)}>
              Cancel
            </Button>
            <Button disabled={editLoading} onClick={() => void saveEdit()}>
              {editLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
