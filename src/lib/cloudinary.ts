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

export async function uploadImage(
  file: string | Buffer,
  folder = "premium-tees/products"
): Promise<{ url: string; publicId: string }> {
  ensureCloudinaryConfigured();

  const result = await cloudinary.uploader.upload(
    typeof file === "string" ? file : `data:image/jpeg;base64,${file.toString("base64")}`,
    {
      folder,
      transformation: [
        { width: 1200, height: 1500, crop: "limit", quality: "auto", fetch_format: "auto" },
      ],
    }
  );

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
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
