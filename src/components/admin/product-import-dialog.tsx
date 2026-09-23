"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, FileUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type ImportResult = {
  dryRun: boolean;
  total: number;
  valid?: number;
  created: number;
  skipped: number;
  errors: Array<{ row: number; name?: string; message: string }>;
  preview?: Array<{
    row: number;
    name: string;
    slug: string;
    price: number;
    variants: number;
    images: number;
  }>;
};

type Category = { id: string; name: string; slug: string };

export function ProductImportDialog() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dryRun, setDryRun] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (!res.ok) return;
      const data = await res.json();
      setCategories(data.categories ?? []);
    } catch {
      // Non-blocking
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadCategories();
      setResult(null);
      setFile(null);
      setDryRun(true);
    }
  }, [open, loadCategories]);

  const handleImport = async () => {
    if (!file) {
      toast.error("Choose a CSV file first");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("dryRun", dryRun ? "true" : "false");

      const res = await fetch("/api/admin/products/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Import failed");
        return;
      }

      setResult(data as ImportResult);

      if (dryRun) {
        if (data.skipped === 0) {
          toast.success(`${data.valid} product(s) ready to import`);
        } else {
          toast.message("Validation complete", {
            description: `${data.valid} valid, ${data.skipped} with issues`,
          });
        }
      } else if (data.created > 0) {
        toast.success(`Imported ${data.created} product(s)`);
        if (data.skipped === 0) {
          setOpen(false);
          window.location.reload();
        }
      } else {
        toast.error("No products were imported");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-md">
          <FileUp className="h-4 w-4" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Import products from CSV</DialogTitle>
          <DialogDescription>
            One row per product. Put multiple URLs in{" "}
            <strong className="font-medium text-neutral-800">image_urls</strong>, comma-separated
            (the whole cell must be quoted in Excel/Sheets). Or add{" "}
            <strong className="font-medium text-neutral-800">image_url_2</strong>,{" "}
            <strong className="font-medium text-neutral-800">image_url_3</strong>, etc. Optional{" "}
            <strong className="font-medium text-neutral-800">image_alts</strong> — same order,
            comma-separated. Sizes, colors, and tags use{" "}
            <strong className="font-medium text-neutral-800">|</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="/api/admin/products/import" download="product-import-template.csv">
                <Download className="h-4 w-4" />
                Download template
              </a>
            </Button>
          </div>

          {categories.length > 0 && (
            <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
              <p className="mb-1 font-medium text-neutral-800">Available categories</p>
              <p className="text-neutral-600">
                {categories.map((c) => c.slug).join(", ")}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="csv-file">CSV file</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv,text/csv"
              className="cursor-pointer file:mr-3 file:rounded-md file:border-0 file:bg-neutral-100 file:px-3 file:py-1 file:text-sm file:font-medium"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                setResult(null);
              }}
            />
            {file && <p className="text-xs text-neutral-500">{file.name}</p>}
          </div>

          <label className="flex cursor-pointer items-start gap-2">
            <input
              type="checkbox"
              checked={dryRun}
              onChange={(e) => setDryRun(e.target.checked)}
              className="mt-1"
            />
            <span>
              <span className="font-medium text-neutral-900">Validate only</span>
              <span className="block text-neutral-500">
                Check the file first without creating products
              </span>
            </span>
          </label>

          {result && (
            <div className="space-y-2 rounded-md border border-neutral-200 p-3">
              <p className="font-medium text-neutral-900">
                {result.dryRun ? "Validation results" : "Import results"}
              </p>
              <p className="text-neutral-600">
                {result.dryRun
                  ? `${result.valid ?? 0} valid · ${result.skipped} issue(s)`
                  : `${result.created} created · ${result.skipped} skipped`}
              </p>

              {result.preview && result.preview.length > 0 && (
                <ul className="max-h-32 space-y-1 overflow-y-auto text-xs text-neutral-600">
                  {result.preview.map((row) => (
                    <li key={row.row}>
                      Row {row.row}: {row.name} — {row.variants} variants, {row.images} image(s)
                    </li>
                  ))}
                </ul>
              )}

              {result.errors.length > 0 && (
                <ul className="max-h-40 space-y-1 overflow-y-auto text-xs text-red-700">
                  {result.errors.map((err, i) => (
                    <li key={`${err.row}-${i}`}>
                      Row {err.row}
                      {err.name ? ` (${err.name})` : ""}: {err.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={loading || !file}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {dryRun ? "Validate" : "Import products"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
