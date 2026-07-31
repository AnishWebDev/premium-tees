import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireSuperAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { productSchema } from "@/lib/validations/product";

type RouteContext = { params: Promise<{ id: string }> };

const updateProductSchema = productSchema.partial();

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: { include: { inventory: true } },
        category: true,
        _count: { select: { reviews: true } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...product,
      price: Number(product.price),
      compareAt: product.compareAt ? Number(product.compareAt) : null,
      variants: product.variants.map((v) => ({
        ...v,
        price: v.price ? Number(v.price) : null,
      })),
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message === "Forbidden") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    console.error("[GET /api/admin/products/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const data = parsed.data;
    const slug = data.slug ?? (data.name ? slugify(data.name) : undefined);

    if (slug && slug !== existing.slug) {
      const slugTaken = await prisma.product.findUnique({ where: { slug } });
      if (slugTaken) {
        return NextResponse.json({ error: "Product slug already exists" }, { status: 409 });
      }
    }

    const { images, variants, ...productFields } = data;

    const product = await prisma.$transaction(async (tx) => {
      if (images) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        await tx.productImage.createMany({
          data: images.map((img, index) => ({
            productId: id,
            url: img.url,
            alt: img.alt,
            publicId: img.publicId,
            sortOrder: img.sortOrder ?? index,
          })),
        });
      }

      if (variants) {
        await tx.inventory.deleteMany({
          where: { variant: { productId: id } },
        });
        await tx.variant.deleteMany({ where: { productId: id } });

        for (const variant of variants) {
          await tx.variant.create({
            data: {
              productId: id,
              size: variant.size,
              color: variant.color,
              colorHex: variant.colorHex,
              sku:
                variant.sku ??
                `${(slug ?? existing.slug).toUpperCase().replace(/-/g, "")}-${variant.color.toUpperCase().slice(0, 3)}-${variant.size}`,
              price: variant.price,
              inventory: {
                create: {
                  quantity: variant.quantity,
                  lowStock: 5,
                },
              },
            },
          });
        }
      }

      return tx.product.update({
        where: { id },
        data: {
          ...productFields,
          ...(slug ? { slug } : {}),
        },
        include: {
          images: { orderBy: { sortOrder: "asc" } },
          variants: { include: { inventory: true } },
          category: true,
        },
      });
    });

    return NextResponse.json({
      ...product,
      price: Number(product.price),
      compareAt: product.compareAt ? Number(product.compareAt) : null,
      variants: product.variants.map((v) => ({
        ...v,
        price: v.price ? Number(v.price) : null,
      })),
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message === "Forbidden") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    console.error("[PATCH /api/admin/products/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    await requireSuperAdmin();
    const { id } = await context.params;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message === "Forbidden") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    console.error("[DELETE /api/admin/products/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
