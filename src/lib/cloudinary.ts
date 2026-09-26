import { v2 as cloudinary } from "cloudinary";

export function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

function ensureCloudinaryConfigured() {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured");
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export type UploadImageOptions = {
  /** Browser MIME type (e.g. image/png). Used for data-URI uploads. */
  mimeType?: string;
  /** Logo, favicon, etc. — skip heavy product transforms. */
  siteAsset?: boolean;
};

function isSvgMime(mime: string) {
  return mime === "image/svg+xml";
}

function isIconMime(mime: string) {
  return mime === "image/x-icon" || mime === "image/vnd.microsoft.icon";
}

export async function uploadImage(
  file: string | Buffer,
  folder = "premium-tees/products",
  options: UploadImageOptions = {}
): Promise<{ url: string; publicId: string }> {
  ensureCloudinaryConfigured();

  const mimeType = (options.mimeType ?? "image/jpeg").split(";")[0]?.trim() || "image/jpeg";
  const siteAsset = options.siteAsset ?? folder.includes("/site/");

  const uploadPayload =
    typeof file === "string"
      ? file
      : `data:${mimeType};base64,${file.toString("base64")}`;

  const uploadOptions: Record<string, unknown> = { folder };

  if (siteAsset || isSvgMime(mimeType) || isIconMime(mimeType)) {
    // SVG/ICO/favicon break when forced through product JPEG/WebP transforms.
    if (!isSvgMime(mimeType) && !isIconMime(mimeType)) {
      uploadOptions.transformation = [{ width: 1200, height: 1200, crop: "limit" }];
    }
  } else {
    uploadOptions.transformation = [
      { width: 1200, height: 1500, crop: "limit", quality: "auto", fetch_format: "auto" },
    ];
  }

  const result = await cloudinary.uploader.upload(uploadPayload, uploadOptions);

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

export function cloudinaryErrorMessage(error: unknown): string | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  const err = error as {
    message?: unknown;
    http_code?: number;
    error?: { message?: string };
  };

  if (err.http_code === 403) {
    const detail =
      typeof err.error?.message === "string" ? err.error.message : err.message;
    if (typeof detail === "string" && detail.includes("missing permissions")) {
      return (
        "Cloudinary API key cannot upload (missing create permission). In Cloudinary Console → Settings → API Keys, " +
        "edit or recreate the key with a role that allows uploads (e.g. Master Admin), then update CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET on Vercel and redeploy."
      );
    }
    return (
      "Cloudinary rejected the upload (403). Check that your API key has upload permissions and matches CLOUDINARY_CLOUD_NAME."
    );
  }

  if (typeof err.message === "string" && err.message.trim()) {
    return err.message.trim();
  }

  return null;
}

export async function deleteImage(publicId: string): Promise<void> {
  ensureCloudinaryConfigured();
  await cloudinary.uploader.destroy(publicId);
}

export function getOptimizedUrl(
  publicId: string,
  options: { width?: number; height?: number; quality?: string } = {}
): string {
  ensureCloudinaryConfigured();
  const { width = 800, height = 1000, quality = "auto" } = options;
  return cloudinary.url(publicId, {
    transformation: [
      { width, height, crop: "fill", gravity: "auto", quality, fetch_format: "auto" },
    ],
  });
}
