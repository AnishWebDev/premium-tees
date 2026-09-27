/** Recommended dimensions shown next to admin image upload fields. */
export type ImageUploadGuide = {
  /** e.g. "21:9 wide" */
  ratioLabel: string;
  /** e.g. "2400 × 1030 px" */
  sizeLabel: string;
  /** Visual aspect ratio (width / height) for the mini diagram. */
  aspectRatio: number;
  note?: string;
};

export const IMAGE_UPLOAD_GUIDES = {
  footerBanner: {
    ratioLabel: "21:9 wide (landscape)",
    sizeLabel: "2400 × 1030 px or larger",
    aspectRatio: 21 / 9,
    note: "Full-width footer photo; keep important detail in the lower third (site name overlay).",
  },
  heroPoster: {
    ratioLabel: "16:9 or 3:2",
    sizeLabel: "1920 × 1080 px minimum",
    aspectRatio: 16 / 9,
    note: "Hero fallback when no video; center-weighted composition works best.",
  },
  product: {
    ratioLabel: "3:4 portrait",
    sizeLabel: "1200 × 1600 px",
    aspectRatio: 3 / 4,
    note: "Plain background; product fills most of the frame.",
  },
  productColor: {
    ratioLabel: "1:1 square",
    sizeLabel: "800 × 800 px",
    aspectRatio: 1,
    note: "Swatch photo for this colour on the product page.",
  },
  category: {
    ratioLabel: "4:3 or 16:9",
    sizeLabel: "1600 × 900 px",
    aspectRatio: 4 / 3,
    note: "Category tile or collection banner.",
  },
  logo: {
    ratioLabel: "Wide or square",
    sizeLabel: "512 × 512 px (PNG/SVG)",
    aspectRatio: 3 / 1,
    note: "Transparent PNG or SVG; horizontal logos ~3:1.",
  },
  favicon: {
    ratioLabel: "1:1 square",
    sizeLabel: "512 × 512 px (PNG)",
    aspectRatio: 1,
    note: "Simple mark; displays tiny in the browser tab.",
  },
  ogImage: {
    ratioLabel: "1.91:1 (Open Graph)",
    sizeLabel: "1200 × 630 px",
    aspectRatio: 1200 / 630,
    note: "Social share preview when links are posted.",
  },
  instagram: {
    ratioLabel: "1:1 or 4:5",
    sizeLabel: "1080 × 1080 px",
    aspectRatio: 1,
    note: "Gallery grid; consistent crop looks best.",
  },
  cmsBanner: {
    ratioLabel: "16:9 wide",
    sizeLabel: "1920 × 1080 px",
    aspectRatio: 16 / 9,
    note: "Page banner background behind title text.",
  },
  cmsSection: {
    ratioLabel: "16:9 or 3:2",
    sizeLabel: "1600 × 900 px",
    aspectRatio: 16 / 9,
    note: "Section image or card media.",
  },
  notFound: {
    ratioLabel: "4:3 or square",
    sizeLabel: "1200 × 900 px",
    aspectRatio: 4 / 3,
    note: "404 illustration or brand graphic.",
  },
  generic: {
    ratioLabel: "16:9",
    sizeLabel: "1600 × 900 px or larger",
    aspectRatio: 16 / 9,
    note: "Use a sharp JPG, PNG, or WebP at least 1600 px on the long edge.",
  },
} as const satisfies Record<string, ImageUploadGuide>;

export type ImageUploadGuideKey = keyof typeof IMAGE_UPLOAD_GUIDES;
