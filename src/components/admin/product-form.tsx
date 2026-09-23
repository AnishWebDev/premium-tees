"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ImageUrlField } from "@/components/admin/image-url-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AUDIENCE_IDS,
  AUDIENCE_LABELS,
  isKidsAudience,
  KIDS_AGE_IDS,
  KIDS_AGE_LABELS,
  type AudienceId,
  type KidsAgeId,
} from "@/lib/audience";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Category = {
  id: string;
  name: string;
};

type VariantRow = {
  size: string;
  color: string;
  colorHex: string;
  colorImageUrl: string;
  quantity: number;
};

type ImageRow = {
  url: string;
  alt: string;
};

type ProductFormData = {
  name: string;
  description: string;
  shortDesc: string;
  price: string;
  compareAt: string;
  categoryId: string;
  audience: AudienceId;
  kidsAge: KidsAgeId | null;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  active: boolean;
  freeShippingEligible: boolean;
  design: string;
  neck: string;
  sleeveStyle: string;
  material: string;
  fit: string;
  care: string;
  images: ImageRow[];
  variants: VariantRow[];
};

type ProductFormProps = {
  categories: Category[];
  initialData?: Partial<ProductFormData> & { id?: string };
  mode: "create" | "edit";
  canDelete?: boolean;
};

const defaultVariant = (): VariantRow => ({
  size: "M",
  color: "Black",
  colorHex: "#000000",
  colorImageUrl: "",
  quantity: 0,
});

const defaultImage = (): ImageRow => ({ url: "", alt: "" });

export function ProductForm({
  categories,
  initialData,
  mode,
  canDelete = false,
}: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState<ProductFormData>({
    name: initialData?.name ?? "",
    description: initialData?.description ?? "",
    shortDesc: initialData?.shortDesc ?? "",
    price: initialData?.price ?? "",
    compareAt: initialData?.compareAt ?? "",
    categoryId: initialData?.categoryId ?? "",
    audience: initialData?.audience ?? "men",
    kidsAge: initialData?.kidsAge ?? null,
    featured: initialData?.featured ?? false,
    bestSeller: initialData?.bestSeller ?? false,
    newArrival: initialData?.newArrival ?? false,
    active: initialData?.active ?? true,
    freeShippingEligible: initialData?.freeShippingEligible ?? false,
    design: initialData?.design ?? "",
    neck: initialData?.neck ?? "",
    sleeveStyle: initialData?.sleeveStyle ?? "",
    material: initialData?.material ?? "",
    fit: initialData?.fit ?? "",
    care: initialData?.care ?? "",
    images: initialData?.images?.length ? initialData.images : [defaultImage()],
    variants: initialData?.variants?.length ? initialData.variants : [defaultVariant()],
  });

  const updateField = <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateVariant = (index: number, field: keyof VariantRow, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
    }));
  };

  const updateImage = (index: number, field: keyof ImageRow, value: string) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => (i === index ? { ...img, [field]: value } : img)),
    }));
  };

  const buildPayload = () => ({
    name: form.name,
    description: form.description,
    shortDesc: form.shortDesc || undefined,
    price: parseFloat(form.price),
    compareAt: form.compareAt ? parseFloat(form.compareAt) : null,
    categoryId: form.categoryId,
    audience: form.audience,
    kidsAge: isKidsAudience(form.audience) ? form.kidsAge : null,
    featured: form.featured,
    bestSeller: form.bestSeller,
    newArrival: form.newArrival,
    active: form.active,
    freeShippingEligible: form.freeShippingEligible,
    design: form.design.trim() || undefined,
    neck: form.neck.trim() || undefined,
    sleeveStyle: form.sleeveStyle.trim() || undefined,
    material: form.material.trim() || undefined,
    fit: form.fit.trim() || undefined,
    care: form.care.trim() || undefined,
    images: form.images
      .filter((img) => img.url.trim())
      .map((img, index) => ({
        url: img.url.trim(),
        alt: img.alt.trim() || form.name,
        sortOrder: index,
      })),
    variants: form.variants.map((v) => ({
      size: v.size,
      color: v.color,
      colorHex: v.colorHex || undefined,
      colorImageUrl: v.colorImageUrl.trim() || undefined,
      quantity: Number(v.quantity),
    })),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = buildPayload();
      const url =
        mode === "create" ? "/api/admin/products" : `/api/admin/products/${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Failed to save product");
        return;
      }

      toast.success(mode === "create" ? "Product created" : "Product updated");
      router.push("/admin/products");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;
    if (!confirm("Delete this product? This cannot be undone.")) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${initialData.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Failed to delete product");
        return;
      }
      toast.success("Product deleted");
      router.push("/admin/products");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="rounded-lg shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Basic information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shortDesc">Short description</Label>
                <Input
                  id="shortDesc"
                  value={form.shortDesc}
                  onChange={(e) => updateField("shortDesc", e.target.value)}
                  maxLength={200}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  required
                  minLength={20}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">About the T-shirt</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="design">Design</Label>
                <Input
                  id="design"
                  value={form.design}
                  onChange={(e) => updateField("design", e.target.value)}
                  placeholder="e.g. Minimal logo print"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="neck">Neck</Label>
                <Input
                  id="neck"
                  value={form.neck}
                  onChange={(e) => updateField("neck", e.target.value)}
                  placeholder="e.g. Crew neck"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sleeveStyle">Sleeve style</Label>
                <Input
                  id="sleeveStyle"
                  value={form.sleeveStyle}
                  onChange={(e) => updateField("sleeveStyle", e.target.value)}
                  placeholder="e.g. Short sleeve"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="material">Material</Label>
                <Input
                  id="material"
                  value={form.material}
                  onChange={(e) => updateField("material", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fit">Fit</Label>
                <Input
                  id="fit"
                  value={form.fit}
                  onChange={(e) => updateField("fit", e.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="care">Care</Label>
                <Input
                  id="care"
                  value={form.care}
                  onChange={(e) => updateField("care", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-base">Images</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-md"
                onClick={() => updateField("images", [...form.images, defaultImage()])}
              >
                <Plus className="h-3.5 w-3.5" />
                Add image
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {form.images.map((img, index) => (
                <div key={index} className="grid gap-3 rounded-md border border-neutral-200 p-3 sm:grid-cols-[1fr_1fr_auto]">
                  <div className="space-y-1.5">
                    <ImageUrlField
                      label="Image URL"
                      value={img.url}
                      onChange={(url) => updateImage(index, "url", url)}
                      hint="Any public https image URL (Pexels, Imgur, your CDN, etc.)"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Alt text</Label>
                    <Input
                      value={img.alt}
                      onChange={(e) => updateImage(index, "alt", e.target.value)}
                      placeholder="Product image"
                    />
                  </div>
                  {form.images.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="self-end text-red-600 hover:text-red-700"
                      onClick={() =>
                        updateField(
                          "images",
                          form.images.filter((_, i) => i !== index)
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-lg shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-base">Variants</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-md"
                onClick={() => updateField("variants", [...form.variants, defaultVariant()])}
              >
                <Plus className="h-3.5 w-3.5" />
                Add variant
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {form.variants.map((variant, index) => (
                <div
                  key={index}
                  className="grid gap-3 rounded-md border border-neutral-200 p-3 sm:grid-cols-4 lg:grid-cols-5"
                >
                  <div className="space-y-1.5">
                    <Label>Size</Label>
                    <Input
                      value={variant.size}
                      onChange={(e) => updateVariant(index, "size", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Color</Label>
                    <Input
                      value={variant.color}
                      onChange={(e) => updateVariant(index, "color", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Color hex</Label>
                    <Input
                      value={variant.colorHex}
                      onChange={(e) => updateVariant(index, "colorHex", e.target.value)}
                      placeholder="#000000"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2 lg:col-span-2">
                    <Label>Color thumbnail URL (optional)</Label>
                    <Input
                      value={variant.colorImageUrl}
                      onChange={(e) => updateVariant(index, "colorImageUrl", e.target.value)}
                      placeholder="https://… photo for this color on PDP"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min={0}
                      value={variant.quantity}
                      onChange={(e) => updateVariant(index, "quantity", parseInt(e.target.value, 10) || 0)}
                      required
                    />
                  </div>
                  {form.variants.length > 1 && (
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700"
                        onClick={() =>
                          updateField(
                            "variants",
                            form.variants.filter((_, i) => i !== index)
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-lg shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Pricing & category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => updateField("price", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="compareAt">Compare at price</Label>
                <Input
                  id="compareAt"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.compareAt}
                  onChange={(e) => updateField("compareAt", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.categoryId} onValueChange={(v) => updateField("categoryId", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="audience">Shop audience</Label>
                <Select
                  value={form.audience}
                  onValueChange={(v) => {
                    const next = v as AudienceId;
                    setForm((prev) => ({
                      ...prev,
                      audience: next,
                      kidsAge: isKidsAudience(next) ? prev.kidsAge : null,
                    }));
                  }}
                >
                  <SelectTrigger id="audience">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AUDIENCE_IDS.map((id) => (
                      <SelectItem key={id} value={id}>
                        {AUDIENCE_LABELS[id]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-neutral-500">
                  Controls which shop filter this product appears under.
                </p>
              </div>
              {isKidsAudience(form.audience) && (
                <div className="space-y-2">
                  <Label htmlFor="kids-age">Age group</Label>
                  <Select
                    value={form.kidsAge ?? "none"}
                    onValueChange={(v) =>
                      updateField("kidsAge", v === "none" ? null : (v as KidsAgeId))
                    }
                  >
                    <SelectTrigger id="kids-age">
                      <SelectValue placeholder="Select age group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not set</SelectItem>
                      {KIDS_AGE_IDS.map((id) => (
                        <SelectItem key={id} value={id}>
                          {KIDS_AGE_LABELS[id]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-neutral-500">
                    Used when customers filter Girls or Boys by age in the shop.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-lg shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Flags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(
                [
                  ["active", "Active"],
                  ["featured", "Featured"],
                  ["bestSeller", "Best seller"],
                  ["newArrival", "New arrival"],
                  ["freeShippingEligible", "Eligible for free shipping message"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="flex cursor-pointer items-center gap-2">
                  <Checkbox
                    checked={form[key]}
                    onCheckedChange={(checked) => updateField(key, checked === true)}
                  />
                  <span className="text-sm text-neutral-700">{label}</span>
                </label>
              ))}
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button type="submit" disabled={loading || deleting} className="rounded-md">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "create" ? "Create product" : "Save changes"}
            </Button>
            {mode === "edit" && canDelete && (
              <Button
                type="button"
                variant="destructive"
                className="rounded-md"
                disabled={loading || deleting}
                onClick={handleDelete}
              >
                {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                Delete product
              </Button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
