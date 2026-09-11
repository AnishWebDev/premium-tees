export const HOME_TEMPLATE_IDS = [
  "parallax",
  "simple",
  "editorial",
  "lookbook",
  "commerce",
  "trail",
] as const;

export type HomeTemplateId = (typeof HOME_TEMPLATE_IDS)[number];

export type HomeTemplateMeta = {
  id: HomeTemplateId;
  name: string;
  description: string;
  inspiredBy: string;
  density: "sparse" | "balanced" | "dense";
};

export const HOME_TEMPLATES: HomeTemplateMeta[] = [
  {
    id: "parallax",
    name: "Parallax",
    description:
      "Cinematic full-viewport chapters, marquee, look tiles — almost no product chrome or signup.",
    inspiredBy: "Apple / modern fashion campaigns",
    density: "sparse",
  },
  {
    id: "simple",
    name: "Simple",
    description:
      "Split static hero, value pillars, 4-product grid, text category list, mission + reviews.",
    inspiredBy: "Everlane",
    density: "balanced",
  },
  {
    id: "editorial",
    name: "Editorial",
    description:
      "Type-only masthead, feature drop, product index rows, sticky story, FAQ digest.",
    inspiredBy: "SSENSE",
    density: "sparse",
  },
  {
    id: "lookbook",
    name: "Lookbook",
    description:
      "Carousel, image mosaic, stacked campaign panels, oversized looks, Instagram — image-first.",
    inspiredBy: "Aritzia",
    density: "balanced",
  },
  {
    id: "commerce",
    name: "Commerce",
    description:
      "Media hero, promo strip, category pills, bestsellers + featured + new arrivals shelves.",
    inspiredBy: "Nike",
    density: "dense",
  },
  {
    id: "trail",
    name: "Trail club",
    description:
      "Outdoor-club hero, trust strip, product grid, fabric story, reviews, and pack-your-favorites CTA.",
    inspiredBy: "Sloth Hiking Club",
    density: "balanced",
  },
];

export function isHomeTemplateId(value: unknown): value is HomeTemplateId {
  return (
    typeof value === "string" &&
    (HOME_TEMPLATE_IDS as readonly string[]).includes(value)
  );
}
