import { getSiteUrl } from "@/lib/site-url";

export const SITE_URL = getSiteUrl();

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

export type ShippingMethodId = "standard" | "express" | "overnight";

/** Set true to show express/overnight pickers in cart and checkout again. */
export const SHOW_SHIPPING_METHOD_UI = false;

export const DEFAULT_SHIPPING_METHOD: ShippingMethodId = "standard";

export const SHIPPING_METHODS: {
  id: ShippingMethodId;
  label: string;
  price: number;
  days: string;
}[] = [
  { id: "standard", label: "Standard", price: 79, days: "4–6 business days" },
  { id: "express", label: "Express", price: 149, days: "2–3 business days" },
  { id: "overnight", label: "Priority", price: 249, days: "1–2 business days" },
];

export const FREE_SHIPPING_THRESHOLD = 1999;

export const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/collections", label: "Collections" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

/** Wide landscape for the storefront footer hero band (CMS override in footer block). */
export const FOOTER_IMAGE =
  "https://images.pexels.com/photos/7671166/pexels-photo-7671166.jpeg?auto=compress&cs=tinysrgb&w=2400";

export const FOOTER_TRUST_ITEMS = [
  { title: "Premium cotton", subtitle: "Soft from day one" },
  { title: "Free returns", subtitle: "Return with ease" },
  { title: "Fast shipping", subtitle: "We actually hustle" },
  { title: "Secure checkout", subtitle: "No sketchy trails" },
] as const;

export const FOOTER_ESSENTIAL_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;

export const TESTIMONIALS = [
  {
    id: "1",
    name: "Maya Chen",
    role: "Creative Director",
    quote:
      "The fabric is unreal — soft without feeling thin. These are the only tees I wear to the studio now.",
    rating: 5,
  },
  {
    id: "2",
    name: "Jordan Hale",
    role: "Product Designer",
    quote:
      "Fit is dialed. Clean silhouette, no weird shrinking after wash. Worth every dollar.",
    rating: 5,
  },
  {
    id: "3",
    name: "Sam Rivera",
    role: "Photographer",
    quote:
      "Minimal branding, maximum quality. Looks intentional with everything in my wardrobe.",
    rating: 5,
  },
];

export const INSTAGRAM_IMAGES = [
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
  "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&q=80",
  "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80",
  "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80",
  "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80",
  "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80",
];

export const FAQ_ITEMS = [
  {
    question: "What is your shipping policy?",
    answer:
      "Orders over ₹1,999 ship free across India. Standard delivery takes 4–6 business days. Express and priority options are available at checkout.",
  },
  {
    question: "How do I find my size?",
    answer:
      "Our tees follow a modern tailored fit. Open the size guide on each product page. If you're between sizes, we recommend sizing up for a relaxed look.",
  },
  {
    question: "What is your return policy?",
    answer:
      "Unworn items with tags attached can be returned within 30 days of delivery for a full refund or exchange. Start a return from your order history.",
  },
  {
    question: "How should I care for my tees?",
    answer:
      "Machine wash cold with like colors, tumble dry low. Avoid bleach. For best longevity, wash inside out and hang dry when possible.",
  },
  {
    question: "Do you deliver across India?",
    answer:
      "Yes — we deliver to serviceable pincodes across India. Enter your pincode on the product page for an estimated delivery window.",
  },
  {
    question: "Are your products sustainably made?",
    answer:
      "We use premium organic and long-staple cotton, low-impact dyes, and partner with factories that meet fair labor standards. Details are listed on each product.",
  },
];
