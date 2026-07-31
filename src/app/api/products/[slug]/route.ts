import { NextRequest, NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/products";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const product = await getProductBySlug(slug);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("[GET /api/products/[slug]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
