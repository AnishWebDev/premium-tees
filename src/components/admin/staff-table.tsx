"use client";

import { useState } from "react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
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

type StaffUser = {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "ADMIN" | "SUPERADMIN";
  createdAt: string;
  _count: { orders: number };
};

type StaffTableProps = {
  initialStaff: StaffUser[];
  initialCustomers: StaffUser[];
};

const ROLES = ["USER", "ADMIN", "SUPERADMIN"] as const;

export function StaffTable({ initialStaff, initialCustomers }: StaffTableProps) {
  const [staff, setStaff] = useState(initialStaff);
  const [customers, setCustomers] = useState(initialCustomers);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const updateRole = async (userId: string, role: StaffUser["role"]) => {
    setUpdatingId(userId);
    try {
      const res = await fetch("/api/admin/staff", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to update role");
        return;
      }

      setStaff((prev) => {
        const without = prev.filter((u) => u.id !== userId);
        if (role === "ADMIN" || role === "SUPERADMIN") {
          return [data, ...without];
        }
        return without;
      });
      setCustomers((prev) => {
        const without = prev.filter((u) => u.id !== userId);
        if (role === "USER") {
          return [data, ...without];
        }
        return without;
      });
      toast.success(`Updated to ${role.toLowerCase()}`);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setUpdatingId(null);
    }
  };

  const renderRows = (users: StaffUser[]) =>
    users.map((user) => (
      <TableRow key={user.id}>
        <TableCell>
          <p className="font-medium">{user.name ?? "—"}</p>
          <p className="text-xs text-neutral-500">{user.email}</p>
        </TableCell>
        <TableCell>
          <Badge variant="secondary" className="capitalize">
            {user.role.toLowerCase()}
          </Badge>
        </TableCell>
        <TableCell className="text-neutral-500">
          {formatDate(user.createdAt, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </TableCell>
        <TableCell className="tabular-nums">{user._count.orders}</TableCell>
        <TableCell>
          <Select
            value={user.role}
            disabled={updatingId === user.id}
            onValueChange={(v) => void updateRole(user.id, v as StaffUser["role"])}
          >
            <SelectTrigger className="h-8 w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {role.charAt(0) + role.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TableCell>
      </TableRow>
    ));

  return (
    <div className="space-y-6">
      <Card className="rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Staff</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Change role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-neutral-500">
                    No staff yet
                  </TableCell>
                </TableRow>
              ) : (
                renderRows(staff)
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="rounded-lg shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Customers (promote to staff)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Change role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-neutral-500">
                    No customers listed
                  </TableCell>
                </TableRow>
              ) : (
                renderRows(customers)
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
