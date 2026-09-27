"use client";

import { useId, useRef, useState } from "react";
import { ImageIcon, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  IMAGE_UPLOAD_GUIDES,
  type ImageUploadGuide,
  type ImageUploadGuideKey,
} from "@/lib/image-upload-guides";

function resolveGuide(
  guide?: ImageUploadGuide | ImageUploadGuideKey
): ImageUploadGuide | null {
  if (!guide) return null;
  if (typeof guide === "string") return IMAGE_UPLOAD_GUIDES[guide];
  return guide;
}

function ImageUploadGuideBlock({ guide }: { guide: ImageUploadGuide }) {
  const maxDiagramWidth = 88;
  const diagramHeight = Math.round(maxDiagramWidth / guide.aspectRatio);

  return (
    <div className="flex gap-3 rounded-lg border border-dashed border-neutral-200 bg-neutral-50/80 p-3">
      <div
        className="flex shrink-0 items-center justify-center rounded border border-neutral-300 bg-white text-[10px] font-medium uppercase tracking-wide text-neutral-400"
        style={{ width: maxDiagramWidth, height: Math.min(diagramHeight, 56), maxHeight: 56 }}
        aria-hidden
      >
        {guide.ratioLabel.split(" ")[0]}
      </div>
      <div className="min-w-0 text-xs text-neutral-600">
        <p className="font-medium text-neutral-800">Recommended</p>
        <p className="mt-0.5">
          <span className="text-neutral-500">Ratio:</span> {guide.ratioLabel}
        </p>
        <p>
          <span className="text-neutral-500">Size:</span> {guide.sizeLabel}
        </p>
        {guide.note ? <p className="mt-1 text-neutral-500">{guide.note}</p> : null}
      </div>
    </div>
  );
}

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
  className?: string;
  inputClassName?: string;
  guide?: ImageUploadGuide | ImageUploadGuideKey;
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
  className,
  inputClassName,
  guide,
}: ImageUploadUrlFieldProps) {
  const resolvedGuide = resolveGuide(guide);
  const id = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [broken, setBroken] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const trimmed = value.trim();
  const showPreview = trimmed.length > 0 && !broken;

  const previewBox =
    previewSize === "lg"
      ? "min-h-[10rem] sm:min-h-[12rem]"
      : previewSize === "sm"
        ? "h-16 w-16"
        : "h-20 w-20";

  const openPreview = () => {
    if (showPreview) setPreviewOpen(true);
  };

  const previewImage = (className: string) =>
    showPreview ? (
      <button
        type="button"
        onClick={openPreview}
        className={cn(
          "cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2",
          className
        )}
        aria-label={`Preview ${label}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={trimmed}
          alt=""
          className={cn(
            previewSize === "lg"
              ? "max-h-32 max-w-full sm:max-h-40"
              : "h-full w-full",
            previewContain ? "object-contain" : "object-cover"
          )}
          onError={() => setBroken(true)}
        />
      </button>
    ) : null;

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
    <div className={cn("space-y-3", className)}>
      <div>
        <Label htmlFor={id}>{label}</Label>
        {hint ? <p className="mt-1 text-xs text-neutral-500">{hint}</p> : null}
      </div>

      {resolvedGuide ? <ImageUploadGuideBlock guide={resolvedGuide} /> : null}

      {previewSize === "lg" ? (
        <div
          className={cn(
            "flex items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-8",
            previewBox
          )}
        >
          {previewImage("inline-block max-w-full") ?? (
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
            {previewImage("block h-full w-full") ?? (
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
          className={cn("flex-1", inputClassName)}
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

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-[min(96vw,56rem)] gap-3 p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
            <DialogDescription>Full-size preview</DialogDescription>
          </DialogHeader>
          <div className="flex max-h-[min(80vh,720px)] items-center justify-center overflow-auto rounded-lg bg-neutral-100 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={trimmed}
              alt={label}
              className="max-h-[min(78vh,700px)] w-full object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
