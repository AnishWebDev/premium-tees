import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  cloudinaryErrorMessage,
  isCloudinaryConfigured,
  uploadImage,
} from "@/lib/cloudinary";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/x-icon",
  "image/vnd.microsoft.icon",
] as const;

function mimeFromFilename(filename: string): string | null {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "svg":
      return "image/svg+xml";
    case "ico":
      return "image/x-icon";
    default:
      return null;
  }
}

function resolveUploadMime(file: File): string | null {
  const fromBrowser = file.type?.split(";")[0]?.trim();
  if (fromBrowser && (ALLOWED_TYPES as readonly string[]).includes(fromBrowser)) {
    return fromBrowser;
  }
  return mimeFromFilename(file.name);
}

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

    const mimeType = resolveUploadMime(file);
    if (!mimeType) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF, SVG, ICO" },
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

    const siteAsset = folder.includes("/site/");
    const result = await uploadImage(buffer, folder, { mimeType, siteAsset });

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
    const cloudinaryMsg = cloudinaryErrorMessage(error);
    return NextResponse.json(
      { error: cloudinaryMsg ?? "Upload failed. Check Cloudinary credentials on Vercel." },
      { status: 500 }
    );
  }
}
