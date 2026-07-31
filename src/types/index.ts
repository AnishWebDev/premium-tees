import type {
  Product,
  ProductImage,
  Variant,
  Inventory,
  Category,
  Review,
  User,
  Order,
  OrderItem,
  Address,
  Coupon,
  WishlistItem,
} from "@prisma/client";

export type {
  Product,
  ProductImage,
  Variant,
  Inventory,
  Category,
  Review,
  User,
  Order,
  OrderItem,
  Address,
  Coupon,
  WishlistItem,
};

export type ProductWithRelations = Product & {
  images: ProductImage[];
  variants: (Variant & { inventory: Inventory | null })[];
  category: Category;
  reviews: (Review & { user: Pick<User, "id" | "name" | "image"> })[];
  _count?: { reviews: number };
  averageRating?: number;
};

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAt: number | null;
  shortDesc: string | null;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  images: { url: string; alt: string | null }[];
  category: { name: string; slug: string };
  averageRating?: number;
  reviewCount?: number;
};

export type CartItemData = {
  id: string;
  quantity: number;
  savedForLater: boolean;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: { url: string; alt: string | null }[];
  };
  variant: {
    id: string;
    size: string;
    color: string;
    colorHex: string | null;
    sku: string;
    inventory: { quantity: number; reserved: number } | null;
  };
};

export type OrderWithItems = Order & {
  items: OrderItem[];
  user?: Pick<User, "id" | "name" | "email"> | null;
};

export type CheckoutFormData = {
  email: string;
  shippingName: string;
  shippingLine1: string;
  shippingLine2?: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  shippingCountry: string;
  shippingPhone?: string;
  sameAsBilling: boolean;
  billingName?: string;
  billingLine1?: string;
  billingLine2?: string;
  billingCity?: string;
  billingState?: string;
  billingZip?: string;
  billingCountry?: string;
  couponCode?: string;
};

export type ShippingEstimate = {
  method: string;
  label: string;
  price: number;
  days: string;
};

export type DashboardStats = {
  revenue: number;
  orders: number;
  customers: number;
  products: number;
  revenueChange: number;
  ordersChange: number;
  recentOrders: OrderWithItems[];
  topProducts: { name: string; sold: number; revenue: number }[];
  salesByDay: { date: string; revenue: number; orders: number }[];
};

export type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: "USER" | "ADMIN" | "SUPERADMIN";
};
