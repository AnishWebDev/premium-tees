import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { isCloudinaryConfigured, uploadImage } from "@/lib/cloudinary";

export async function POST(request: Request) {
  try {
    await requireAdmin();

    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        {
          error:
            "Image upload is unavailable. Add CLOUDINARY_* env vars, or paste image URLs in the product form.",
        },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF" },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 10MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const folder = (formData.get("folder") as string) || "premium-tees/products";

    const result = await uploadImage(buffer, folder);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message === "Forbidden") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    console.error("[POST /api/upload]", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
