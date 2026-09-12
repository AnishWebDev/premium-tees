"use client";

import type { SizeGuideData } from "@/lib/cms-content";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Ruler } from "lucide-react";

type SizeGuideModalProps = {
  data: SizeGuideData;
};

export function SizeGuideModal({ data }: SizeGuideModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="link" className="h-auto p-0 text-sm font-normal">
          <Ruler className="mr-1.5 h-3.5 w-3.5" aria-hidden />
          Size guide
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">{data.title}</DialogTitle>
          <DialogDescription>{data.intro}</DialogDescription>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Size</TableHead>
              <TableHead>Chest</TableHead>
              <TableHead>Length</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.rows.map((row) => (
              <TableRow key={row.size}>
                <TableCell className="font-medium">{row.size}</TableCell>
                <TableCell>{row.chest}&quot;</TableCell>
                <TableCell>{row.length}&quot;</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {data.fitNote && (
          <p className="text-sm text-[var(--muted-foreground)]">{data.fitNote}</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
