"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ReturnRequestFormProps = {
  orderId: string;
  existing?: {
    status: string;
    reason: string;
    adminNote?: string | null;
  } | null;
};

export function ReturnRequestForm({ orderId, existing }: ReturnRequestFormProps) {
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [request, setRequest] = useState(existing);

  if (request && request.status !== "REJECTED") {
    return (
      <div className="rounded-2xl border border-[var(--border)] p-5">
        <h3 className="text-sm font-medium text-[var(--foreground)]">Return request</h3>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Status:{" "}
          <span className="font-medium capitalize text-[var(--foreground)]">
            {request.status.toLowerCase()}
          </span>
        </p>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">{request.reason}</p>
        {request.adminNote ? (
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            Note from us: {request.adminNote}
          </p>
        ) : null}
      </div>
    );
  }

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, notes: notes || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not submit return request");
        return;
      }
      setRequest(data);
      toast.success("Return request submitted");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-[var(--border)] p-5 space-y-4"
    >
      <div>
        <h3 className="text-sm font-medium text-[var(--foreground)]">Request a return</h3>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Unworn items with tags can be returned within 30 days of delivery.
        </p>
      </div>
      <div>
        <Label htmlFor="return-reason">Reason</Label>
        <Input
          id="return-reason"
          className="mt-2"
          required
          minLength={3}
          placeholder="Wrong size, changed mind…"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="return-notes">Details (optional)</Label>
        <Textarea
          id="return-notes"
          className="mt-2"
          placeholder="Anything that helps us process your return"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Submitting…" : "Submit return request"}
      </Button>
    </form>
  );
}
