"use client";

import { ImageUploadUrlField } from "@/components/admin/image-upload-url-field";

type ImageUrlFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  className?: string;
  inputClassName?: string;
  /** Cloudinary folder for Upload (requires CLOUDINARY_* env). */
  uploadFolder?: string;
  previewSize?: "sm" | "md" | "lg";
  accept?: string;
};

export function ImageUrlField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  className,
  inputClassName,
  uploadFolder = "premium-tees/content",
  previewSize = "md",
  accept,
}: ImageUrlFieldProps) {
  const uploadHint =
    hint ??
    "Paste a public https URL or use Upload (Cloudinary).";

  return (
    <ImageUploadUrlField
      label={label}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      hint={uploadHint}
      uploadFolder={uploadFolder}
      className={className}
      inputClassName={inputClassName}
      previewSize={previewSize}
      accept={accept}
    />
  );
}
