"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { formatDate, formatPrice, getInitials } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Customer = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  createdAt: string;
  orderCount: number;
  reviewCount: number;
  totalSpent: number;
};

type CustomersTableProps = {
  customers: Customer[];
};

export function CustomersTable({ customers }: CustomersTableProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.includes(q)
    );
  }, [customers, search]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <Input
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card className="rounded-lg shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Reviews</TableHead>
                <TableHead>Total spent</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-neutral-500">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-xs font-medium">
                          {getInitials(customer.name ?? customer.email)}
                        </div>
                        <div>
                          <p className="font-medium">{customer.name ?? "—"}</p>
                          <p className="text-xs text-neutral-500">{customer.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-neutral-600">{customer.phone ?? "—"}</TableCell>
                    <TableCell className="tabular-nums">{customer.orderCount}</TableCell>
                    <TableCell className="tabular-nums">{customer.reviewCount}</TableCell>
                    <TableCell className="font-medium tabular-nums">
                      {formatPrice(customer.totalSpent)}
                    </TableCell>
                    <TableCell className="text-neutral-500">
                      {formatDate(customer.createdAt, { month: "short", day: "numeric", year: "numeric" })}
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
