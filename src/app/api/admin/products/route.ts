import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { productSchema } from "@/lib/validations/product";

export async function GET() {
  try {
    await requireAdmin();

    const products = await prisma.product.findMany({
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: { include: { inventory: true } },
        category: true,
        _count: { select: { reviews: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const serialized = products.map((product) => ({
      ...product,
      price: Number(product.price),
      compareAt: product.compareAt ? Number(product.compareAt) : null,
      variants: product.variants.map((v) => ({
        ...v,
        price: v.price ? Number(v.price) : null,
      })),
    }));

    return NextResponse.json({ products: serialized });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message === "Forbidden") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    console.error("[GET /api/admin/products]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const slug = data.slug ?? slugify(data.name);

    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Product slug already exists" }, { status: 409 });
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        shortDesc: data.shortDesc,
        price: data.price,
        compareAt: data.compareAt,
        featured: data.featured,
        bestSeller: data.bestSeller,
        newArrival: data.newArrival,
        active: data.active,
        material: data.material,
        fit: data.fit,
        care: data.care,
        origin: data.origin,
        tags: data.tags,
        metaTitle: data.metaTitle,
        metaDesc: data.metaDesc,
        categoryId: data.categoryId,
        images: {
          create: data.images.map((img, index) => ({
            url: img.url,
            alt: img.alt,
            publicId: img.publicId,
            sortOrder: img.sortOrder ?? index,
          })),
        },
        variants: {
          create: data.variants.map((variant) => ({
            size: variant.size,
            color: variant.color,
            colorHex: variant.colorHex,
            sku:
              variant.sku ??
              `${slug.toUpperCase().replace(/-/g, "")}-${variant.color.toUpperCase().slice(0, 3)}-${variant.size}`,
            price: variant.price,
            inventory: {
              create: {
                quantity: variant.quantity,
                lowStock: 5,
              },
            },
          })),
        },
      },
      include: {
        images: true,
        variants: { include: { inventory: true } },
        category: true,
      },
    });

    return NextResponse.json(
      {
        ...product,
        price: Number(product.price),
        compareAt: product.compareAt ? Number(product.compareAt) : null,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message === "Forbidden") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    console.error("[POST /api/admin/products]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
