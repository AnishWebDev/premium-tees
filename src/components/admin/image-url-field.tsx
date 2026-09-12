"use client";

import { useId, useState } from "react";
import { ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type ImageUrlFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  className?: string;
  inputClassName?: string;
};

export function ImageUrlField({
  label,
  value,
  onChange,
  placeholder = "https://example.com/photo.jpg",
  hint,
  className,
  inputClassName,
}: ImageUrlFieldProps) {
  const id = useId();
  const [broken, setBroken] = useState(false);
  const trimmed = value.trim();
  const showPreview = trimmed.length > 0 && !broken;

  return (
    <div className={className}>
      <Label htmlFor={id}>{label}</Label>
      <div className="mt-2 flex gap-3">
        <div
          className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100"
          aria-hidden={!showPreview}
        >
          {showPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={trimmed}
              alt=""
              className="h-full w-full object-cover"
              onError={() => setBroken(true)}
            />
          ) : (
            <ImageIcon className="h-5 w-5 text-neutral-400" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <Input
            id={id}
            type="url"
            value={value}
            placeholder={placeholder}
            className={cn(inputClassName)}
            onChange={(e) => {
              setBroken(false);
              onChange(e.target.value);
            }}
          />
          {hint ? <p className="mt-1 text-xs text-neutral-500">{hint}</p> : null}
          {trimmed && broken ? (
            <p className="mt-1 text-xs text-amber-700">
              Preview unavailable — check the URL is public and direct.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
