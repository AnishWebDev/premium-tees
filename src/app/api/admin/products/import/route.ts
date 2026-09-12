import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createProduct, ProductCreateError } from "@/lib/product-create";
import {
  buildCategoryLookup,
  buildImportTemplateCsv,
  parseProductImportCsv,
  type ImportRowError,
} from "@/lib/product-import";

const MAX_ROWS = 200;

export async function GET() {
  try {
    await requireAdmin();

    const csv = buildImportTemplateCsv();
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="product-import-template.csv"',
      },
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
    console.error("[GET /api/admin/products/import]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get("file");
    const dryRun = formData.get("dryRun") === "true";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "CSV file is required" }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".csv") && file.type !== "text/csv") {
      return NextResponse.json({ error: "Please upload a .csv file" }, { status: 400 });
    }

    const csvText = await file.text();
    if (!csvText.trim()) {
      return NextResponse.json({ error: "CSV file is empty" }, { status: 400 });
    }

    const categories = await prisma.category.findMany({
      select: { id: true, name: true, slug: true },
    });

    if (categories.length === 0) {
      return NextResponse.json(
        { error: "Create at least one category before importing products" },
        { status: 400 }
      );
    }

    const categoryLookup = buildCategoryLookup(categories);
    const { rows, errors: parseErrors } = parseProductImportCsv(csvText, categoryLookup);

    if (rows.length > MAX_ROWS) {
      return NextResponse.json(
        { error: `Import limited to ${MAX_ROWS} products per file` },
        { status: 400 }
      );
    }

    if (rows.length === 0 && parseErrors.length === 0) {
      return NextResponse.json(
        { error: "No product rows found. Download the template and add at least one row." },
        { status: 400 }
      );
    }

    const slugsInFile = new Set<string>();
    const duplicateErrors: ImportRowError[] = [];

    for (const row of rows) {
      if (slugsInFile.has(row.slug)) {
        duplicateErrors.push({
          row: row.row,
          name: row.input.name,
          message: `Duplicate slug "${row.slug}" in CSV`,
        });
      } else {
        slugsInFile.add(row.slug);
      }
    }

    const existingSlugs = await prisma.product.findMany({
      where: { slug: { in: [...slugsInFile] } },
      select: { slug: true },
    });
    const existingSlugSet = new Set(existingSlugs.map((p) => p.slug));

    const conflictErrors: ImportRowError[] = rows
      .filter((row) => existingSlugSet.has(row.slug))
      .map((row) => ({
        row: row.row,
        name: row.input.name,
        message: `Product slug "${row.slug}" already exists in the store`,
      }));

    const allErrors = [...parseErrors, ...duplicateErrors, ...conflictErrors];

    if (dryRun) {
      const validRows = rows.filter(
        (row) =>
          !duplicateErrors.some((e) => e.row === row.row) &&
          !conflictErrors.some((e) => e.row === row.row)
      );

      return NextResponse.json({
        dryRun: true,
        total: rows.length + parseErrors.length,
        valid: validRows.length,
        created: 0,
        skipped: allErrors.length,
        errors: allErrors,
        preview: validRows.slice(0, 10).map((row) => ({
          row: row.row,
          name: row.input.name,
          slug: row.slug,
          categoryId: row.input.categoryId,
          price: row.input.price,
          variants: row.input.variants.length,
          images: row.input.images.length,
        })),
      });
    }

    let created = 0;
    const importErrors: ImportRowError[] = [...allErrors];

    for (const row of rows) {
      if (importErrors.some((e) => e.row === row.row)) {
        continue;
      }

      try {
        await createProduct(row.input);
        created++;
      } catch (error) {
        if (error instanceof ProductCreateError) {
          importErrors.push({
            row: row.row,
            name: row.input.name,
            message: error.message,
          });
        } else {
          console.error(`[import row ${row.row}]`, error);
          importErrors.push({
            row: row.row,
            name: row.input.name,
            message: "Failed to create product",
          });
        }
      }
    }

    return NextResponse.json({
      dryRun: false,
      total: rows.length + parseErrors.length,
      created,
      skipped: importErrors.length,
      errors: importErrors,
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
    console.error("[POST /api/admin/products/import]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
