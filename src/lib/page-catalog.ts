/** Known storefront pages surfaced in Admin → Page content. */
export type PageEditorKind =
  | "sections"
  | "site-about"
  | "site-contact"
  | "site-faq"
  | "cms-collections"
  | "cms-legal-terms"
  | "cms-legal-privacy"
  | "cms-legal-shipping"
  | "cms-store-shop";

export type SystemPageDefinition = {
  slug: string;
  title: string;
  path: string;
  sortOrder: number;
  kind: PageEditorKind;
  published?: boolean;
};

export const SYSTEM_PAGES: SystemPageDefinition[] = [
  {
    slug: "home",
    title: "Homepage",
    path: "/",
    sortOrder: 0,
    kind: "sections",
    published: true,
  },
  {
    slug: "shop",
    title: "Shop",
    path: "/shop",
    sortOrder: 10,
    kind: "cms-store-shop",
    published: true,
  },
  {
    slug: "collections",
    title: "Collections",
    path: "/collections",
    sortOrder: 20,
    kind: "cms-collections",
    published: true,
  },
  {
    slug: "about",
    title: "About",
    path: "/about",
    sortOrder: 30,
    kind: "site-about",
    published: true,
  },
  {
    slug: "contact",
    title: "Contact",
    path: "/contact",
    sortOrder: 40,
    kind: "site-contact",
    published: true,
  },
  {
    slug: "faq",
    title: "FAQ",
    path: "/faq",
    sortOrder: 50,
    kind: "site-faq",
    published: true,
  },
  {
    slug: "privacy",
    title: "Privacy",
    path: "/privacy",
    sortOrder: 60,
    kind: "cms-legal-privacy",
    published: true,
  },
  {
    slug: "terms",
    title: "Terms",
    path: "/terms",
    sortOrder: 70,
    kind: "cms-legal-terms",
    published: true,
  },
  {
    slug: "shipping",
    title: "Shipping",
    path: "/shipping",
    sortOrder: 80,
    kind: "cms-legal-shipping",
    published: true,
  },
];

export function pagePathForSlug(slug: string): string {
  const system = SYSTEM_PAGES.find((p) => p.slug === slug);
  if (system) return system.path;
  return `/${slug}`;
}

export function pageKindForSlug(slug: string): PageEditorKind {
  const system = SYSTEM_PAGES.find((p) => p.slug === slug);
  return system?.kind ?? "sections";
}
