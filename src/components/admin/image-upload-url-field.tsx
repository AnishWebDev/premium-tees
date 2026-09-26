"use client";

import { useId, useRef, useState } from "react";
import { ImageIcon, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type ImageUploadUrlFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  placeholder?: string;
  uploadFolder?: string;
  accept?: string;
  previewContain?: boolean;
  previewSize?: "sm" | "md" | "lg";
};

export function ImageUploadUrlField({
  label,
  value,
  onChange,
  hint,
  placeholder = "https://example.com/image.png",
  uploadFolder = "premium-tees/site",
  accept = "image/jpeg,image/png,image/webp,image/gif,image/svg+xml",
  previewContain = true,
  previewSize = "md",
}: ImageUploadUrlFieldProps) {
  const id = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [broken, setBroken] = useState(false);
  const [uploading, setUploading] = useState(false);
  const trimmed = value.trim();
  const showPreview = trimmed.length > 0 && !broken;

  const previewBox =
    previewSize === "lg"
      ? "min-h-[10rem] sm:min-h-[12rem]"
      : previewSize === "sm"
        ? "h-16 w-16"
        : "h-20 w-20";

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", uploadFolder);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || "Upload failed");
      }
      if (typeof body.url !== "string") {
        throw new Error("Upload did not return a URL");
      }
      setBroken(false);
      onChange(body.url);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor={id}>{label}</Label>
        {hint ? <p className="mt-1 text-xs text-neutral-500">{hint}</p> : null}
      </div>

      {previewSize === "lg" ? (
        <div
          className={cn(
            "flex items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-8",
            previewBox
          )}
        >
          {showPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={trimmed}
              alt=""
              className={cn(
                "max-h-32 max-w-full sm:max-h-40",
                previewContain ? "object-contain" : "object-cover"
              )}
              onError={() => setBroken(true)}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-neutral-400">
              <ImageIcon className="h-12 w-12" aria-hidden />
              <span className="text-sm">No image yet</span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-3">
          <div
            className={cn(
              "relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100",
              previewBox
            )}
          >
            {showPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={trimmed}
                alt=""
                className={cn("h-full w-full", previewContain ? "object-contain" : "object-cover")}
                onError={() => setBroken(true)}
              />
            ) : (
              <ImageIcon className="h-5 w-5 text-neutral-400" aria-hidden />
            )}
          </div>
        </div>
      )}

      {trimmed && broken ? (
        <p className="text-xs text-amber-700" role="alert">
          Preview unavailable — check the URL or upload again.
        </p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          id={id}
          type="url"
          value={value}
          placeholder={placeholder}
          className="flex-1"
          onChange={(e) => {
            setBroken(false);
            onChange(e.target.value);
          }}
        />
        <input
          ref={fileRef}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void uploadFile(file);
          }}
        />
        <Button
          type="button"
          variant="outline"
          className="shrink-0"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          Upload
        </Button>
      </div>
    </div>
  );
}
