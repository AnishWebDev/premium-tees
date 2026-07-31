import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/products";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const category = searchParams.get("category") ?? undefined;
    const sort = searchParams.get("sort") ?? undefined;
    const q = searchParams.get("q") ?? undefined;
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "12", 10);
    const minPrice = searchParams.get("minPrice")
      ? parseFloat(searchParams.get("minPrice")!)
      : undefined;
    const maxPrice = searchParams.get("maxPrice")
      ? parseFloat(searchParams.get("maxPrice")!)
      : undefined;

    const result = await getProducts({
      category,
      sort,
      q,
      page: isNaN(page) ? 1 : page,
      limit: isNaN(limit) ? 12 : Math.min(limit, 100),
      minPrice,
      maxPrice,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/products]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
