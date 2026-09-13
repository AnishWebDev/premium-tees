"use client";

import { Plus } from "lucide-react";
import type {
  GalleryImageItem,
  MosaicCellItem,
} from "@/lib/home-sections";
import { ImageUrlField } from "@/components/admin/image-url-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EMPTY_MOSAIC_CELL: MosaicCellItem = {
  imageUrl: "",
  title: "",
  linkHref: "",
  imageAlt: "",
  span: "square",
};

const EMPTY_GALLERY_IMAGE: GalleryImageItem = {
  imageUrl: "",
  title: "",
  caption: "",
  linkHref: "",
  imageAlt: "",
};

export function MosaicCellsEditor({
  cells,
  onChange,
}: {
  cells: MosaicCellItem[];
  onChange: (cells: MosaicCellItem[]) => void;
}) {
  const list = cells.length > 0 ? cells : [{ ...EMPTY_MOSAIC_CELL }];

  const update = (index: number, patch: Partial<MosaicCellItem>) => {
    onChange(list.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  };

  return (
    <div className="space-y-3 border-t border-neutral-100 pt-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-neutral-700">Mosaic tiles</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8"
          onClick={() =>
            onChange([
              ...list,
              { ...EMPTY_MOSAIC_CELL, title: `Tile ${list.length + 1}` },
            ])
          }
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add tile
        </Button>
      </div>
      <p className="text-xs text-neutral-500">
        Add images, titles, links, and tile size (tall / wide / square) for each
        cell in the collage.
      </p>
      <ul className="space-y-3">
        {list.map((cell, index) => (
          <li
            key={index}
            className="space-y-2 rounded-xl border border-neutral-200 bg-neutral-50/80 p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-neutral-800">
                Tile {index + 1}
              </p>
              {list.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-neutral-500"
                  onClick={() => onChange(list.filter((_, i) => i !== index))}
                >
                  Remove
                </Button>
              ) : null}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <ImageUrlField
                  label="Image URL"
                  value={cell.imageUrl}
                  onChange={(imageUrl) => update(index, { imageUrl })}
                  inputClassName="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Title</Label>
                <Input
                  className="mt-1"
                  value={cell.title}
                  onChange={(e) => update(index, { title: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs">Image alt text</Label>
                <Input
                  className="mt-1"
                  value={cell.imageAlt ?? ""}
                  onChange={(e) => update(index, { imageAlt: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs">Link (optional)</Label>
                <Input
                  className="mt-1"
                  value={cell.linkHref}
                  placeholder="/shop"
                  onChange={(e) => update(index, { linkHref: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs">Tile size</Label>
                <Select
                  value={cell.span ?? "square"}
                  onValueChange={(v) =>
                    update(index, {
                      span: v as MosaicCellItem["span"],
                    })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="square">Square</SelectItem>
                    <SelectItem value="wide">Wide (2 columns)</SelectItem>
                    <SelectItem value="tall">Tall (2 rows)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function GalleryImagesEditor({
  images,
  onChange,
}: {
  images: GalleryImageItem[];
  onChange: (images: GalleryImageItem[]) => void;
}) {
  const list = images.length > 0 ? images : [{ ...EMPTY_GALLERY_IMAGE }];

  const update = (index: number, patch: Partial<GalleryImageItem>) => {
    onChange(list.map((img, i) => (i === index ? { ...img, ...patch } : img)));
  };

  return (
    <div className="space-y-3 border-t border-neutral-100 pt-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-neutral-700">Gallery images</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8"
          onClick={() =>
            onChange([
              ...list,
              { ...EMPTY_GALLERY_IMAGE, title: `Image ${list.length + 1}` },
            ])
          }
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add image
        </Button>
      </div>
      <p className="text-xs text-neutral-500">
        Add as many images as you need. Optional title, caption, alt text, and
        link per image.
      </p>
      <ul className="space-y-3">
        {list.map((img, index) => (
          <li
            key={index}
            className="space-y-2 rounded-xl border border-neutral-200 bg-neutral-50/80 p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-neutral-800">
                Image {index + 1}
              </p>
              {list.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-neutral-500"
                  onClick={() => onChange(list.filter((_, i) => i !== index))}
                >
                  Remove
                </Button>
              ) : null}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <ImageUrlField
                  label="Image URL"
                  value={img.imageUrl}
                  onChange={(imageUrl) => update(index, { imageUrl })}
                  inputClassName="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Title</Label>
                <Input
                  className="mt-1"
                  value={img.title}
                  onChange={(e) => update(index, { title: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs">Image alt text</Label>
                <Input
                  className="mt-1"
                  value={img.imageAlt}
                  onChange={(e) => update(index, { imageAlt: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs">Caption (optional)</Label>
                <Input
                  className="mt-1"
                  value={img.caption}
                  onChange={(e) => update(index, { caption: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs">Link (optional)</Label>
                <Input
                  className="mt-1"
                  value={img.linkHref}
                  placeholder="/shop"
                  onChange={(e) => update(index, { linkHref: e.target.value })}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
