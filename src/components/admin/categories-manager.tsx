"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ImageUrlField } from "@/components/admin/image-url-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  featured: boolean;
  sortOrder: number;
  _count: { products: number };
  createdAt: string;
};

type CategoriesManagerProps = {
  initialCategories: Category[];
  canDelete?: boolean;
};

export function CategoriesManager({
  initialCategories,
  canDelete = false,
}: CategoriesManagerProps) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [loading, setLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editImage, setEditImage] = useState("");
  const [savingImage, setSavingImage] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    image: "",
    featured: false,
    sortOrder: "0",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description || undefined,
          image: form.image || undefined,
          featured: form.featured,
          sortOrder: parseInt(form.sortOrder, 10) || 0,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Failed to create category");
        return;
      }

      toast.success("Category created");
      setCategories((prev) => [...prev, { ...data, _count: { products: 0 } }]);
      setForm({ name: "", description: "", image: "", featured: false, sortOrder: "0" });
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const openEditImage = (category: Category) => {
    setEditingCategory(category);
    setEditImage(category.image ?? "");
  };

  const handleDelete = async (category: Category) => {
    if (
      !confirm(
        `Delete category "${category.name}"? This cannot be undone. Categories with products cannot be deleted.`
      )
    ) {
      return;
    }
    setDeletingId(category.id);
    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "Failed to delete category");
        return;
      }
      toast.success("Category deleted");
      setCategories((prev) => prev.filter((c) => c.id !== category.id));
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDeletingId(null);
    }
  };

  const saveCategoryImage = async () => {
    if (!editingCategory) return;
    setSavingImage(true);

    try {
      const res = await fetch("/api/admin/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: editingCategory.id,
          image: editImage.trim() || "",
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Failed to update category image");
        return;
      }

      setCategories((prev) =>
        prev.map((item) =>
          item.id === editingCategory.id ? { ...item, image: data.image } : item
        )
      );
      toast.success("Category image updated");
      setEditingCategory(null);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSavingImage(false);
    }
  };

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-lg shadow-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">All categories</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Sort</TableHead>
                  <TableHead className="text-right">Edit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-neutral-500">
                      No categories yet
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border border-neutral-200 bg-neutral-100">
                          {category.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={category.image}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-4 w-4 text-neutral-400" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{category.name}</p>
                          {category.description && (
                            <p className="text-xs text-neutral-500">{category.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-neutral-500">{category.slug}</TableCell>
                      <TableCell>{category._count.products}</TableCell>
                      <TableCell>
                        {category.featured ? (
                          <Badge variant="success">Yes</Badge>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </TableCell>
                      <TableCell>{category.sortOrder}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={() => openEditImage(category)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Image
                          </Button>
                          {canDelete && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700"
                              aria-label={`Delete ${category.name}`}
                              disabled={deletingId === category.id}
                              onClick={() => void handleDelete(category)}
                            >
                              {deletingId === category.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="rounded-lg shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Create category</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <ImageUrlField
                label="Image URL"
                value={form.image}
                onChange={(image) => setForm((f) => ({ ...f, image }))}
                hint="Optional category banner or thumbnail"
              />
              <div className="space-y-2">
                <Label htmlFor="sortOrder">Sort order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                />
              </div>
              <label className="flex cursor-pointer items-center gap-2">
                <Checkbox
                  checked={form.featured}
                  onCheckedChange={(checked) =>
                    setForm((f) => ({ ...f, featured: checked === true }))
                  }
                />
                <span className="text-sm">Featured category</span>
              </label>
              <Button type="submit" disabled={loading} className="w-full rounded-md">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Create category
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={editingCategory !== null}
        onOpenChange={(open) => {
          if (!open) setEditingCategory(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit category image</DialogTitle>
            <DialogDescription>
              Update the image for {editingCategory?.name ?? "this category"}.
            </DialogDescription>
          </DialogHeader>
          <ImageUrlField
            label="Image URL"
            value={editImage}
            onChange={setEditImage}
            hint="Leave blank to remove the category image"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCategory(null)}>
              Cancel
            </Button>
            <Button disabled={savingImage} onClick={() => void saveCategoryImage()}>
              {savingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save image"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
