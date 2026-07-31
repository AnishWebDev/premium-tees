import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

const COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Stone", hex: "#C4B8A8" },
  { name: "Navy", hex: "#1B2838" },
] as const;

const UNSPLASH_IMAGES = [
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
  "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80",
  "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80",
  "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80",
  "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80",
  "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80",
  "https://images.unsplash.com/photo-1622445275463-afa12ab34d44?w=800&q=80",
  "https://images.unsplash.com/photo-1586367262704-6587a398b0f1?w=800&q=80",
];

function randomInventory(): number {
  return Math.floor(Math.random() * 45) + 5;
}

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.returnRequest.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.variant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.newsletter.deleteMany();
  await prisma.address.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.siteContent.deleteMany();

  const superAdminPassword = await bcrypt.hash("SuperAdmin123!", 12);
  const adminPassword = await bcrypt.hash("Admin123!", 12);
  const guestPassword = await bcrypt.hash("Guest1234!", 12);

  await prisma.user.create({
    data: {
      name: "Super Admin",
      email: "superadmin@premiumtees.com",
      password: superAdminPassword,
      role: "SUPERADMIN",
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: "Store Admin",
      email: "admin@premiumtees.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const demoUser = await prisma.user.create({
    data: {
      name: "Guest Shopper",
      email: "guest@premiumtees.com",
      password: guestPassword,
      role: "USER",
    },
  });

  console.log("✅ Users created");
  console.log("   SuperAdmin: superadmin@premiumtees.com / SuperAdmin123!");
  console.log("   Admin:      admin@premiumtees.com / Admin123!");
  console.log("   Guest:      guest@premiumtees.com / Guest1234!");

  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Essentials",
        slug: "essentials",
        description: "Everyday staples crafted from premium organic cotton.",
        image: UNSPLASH_IMAGES[0],
        featured: true,
        sortOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: "Oversized",
        slug: "oversized",
        description: "Relaxed silhouettes with a modern drop-shoulder fit.",
        image: UNSPLASH_IMAGES[1],
        featured: true,
        sortOrder: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: "Graphic",
        slug: "graphic",
        description: "Statement tees with original artwork and vintage-inspired prints.",
        image: UNSPLASH_IMAGES[2],
        featured: false,
        sortOrder: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: "Limited",
        slug: "limited",
        description: "Small-batch releases. Once they're gone, they're gone.",
        image: UNSPLASH_IMAGES[3],
        featured: true,
        sortOrder: 4,
      },
    }),
  ]);

  console.log("✅ Categories created");

  const productsData = [
    {
      name: "Essential Crew Tee",
      slug: "essential-crew-tee",
      description:
        "Our signature crew neck tee in 220gsm organic cotton. Pre-shrunk, garment-dyed, and finished with a soft hand feel that only gets better with every wash. The perfect foundation for any wardrobe.",
      shortDesc: "Premium organic cotton crew neck",
      price: 799,
      compareAt: 999,
      featured: true,
      bestSeller: true,
      newArrival: false,
      material: "100% Organic Cotton",
      fit: "Regular",
      care: "Machine wash cold, tumble dry low",
      origin: "Portugal",
      tags: ["essentials", "organic", "crew-neck"],
      categoryId: categories[0].id,
      imageIndex: 0,
      colorSubset: ["Black", "White", "Stone", "Navy"],
    },
    {
      name: "Classic V-Neck",
      slug: "classic-v-neck",
      description:
        "A refined v-neck with a clean neckline and tailored drape. Made from long-staple Supima cotton for exceptional softness and durability. Ideal for layering or wearing solo.",
      shortDesc: "Supima cotton v-neck tee",
      price: 899,
      compareAt: null,
      featured: true,
      bestSeller: false,
      newArrival: false,
      material: "100% Supima Cotton",
      fit: "Slim",
      care: "Machine wash cold, hang dry recommended",
      origin: "USA",
      tags: ["essentials", "v-neck", "supima"],
      categoryId: categories[0].id,
      imageIndex: 4,
      colorSubset: ["Black", "White", "Navy"],
    },
    {
      name: "Oversized Drop Shoulder",
      slug: "oversized-drop-shoulder",
      description:
        "An intentionally relaxed fit with extended shoulders and a boxy body. Heavyweight 280gsm cotton gives it structure while maintaining comfort. The streetwear essential.",
      shortDesc: "Heavyweight oversized fit",
      price: 1099,
      compareAt: 1299,
      featured: true,
      bestSeller: false,
      newArrival: true,
      material: "100% Heavyweight Cotton",
      fit: "Oversized",
      care: "Machine wash cold, tumble dry low",
      origin: "Portugal",
      tags: ["oversized", "streetwear", "heavyweight"],
      categoryId: categories[1].id,
      imageIndex: 1,
      colorSubset: ["Black", "Stone", "White"],
    },
    {
      name: "Relaxed Box Fit",
      slug: "relaxed-box-fit",
      description:
        "A modern boxy silhouette with dropped hem and wide sleeves. Crafted from brushed cotton fleece interior for all-day comfort. Pairs effortlessly with wide-leg trousers.",
      shortDesc: "Boxy fit with brushed interior",
      price: 999,
      compareAt: null,
      featured: false,
      bestSeller: true,
      newArrival: false,
      material: "Cotton Blend",
      fit: "Boxy",
      care: "Machine wash cold, tumble dry low",
      origin: "Turkey",
      tags: ["oversized", "box-fit", "comfort"],
      categoryId: categories[1].id,
      imageIndex: 5,
      colorSubset: ["Black", "White", "Stone", "Navy"],
    },
    {
      name: "Abstract Wave Graphic",
      slug: "abstract-wave-graphic",
      description:
        "Original abstract wave artwork screen-printed with water-based inks on our premium 220gsm cotton base. Soft hand print that moves with the fabric. Limited color run.",
      shortDesc: "Water-based screen print",
      price: 1199,
      compareAt: 1499,
      featured: true,
      bestSeller: false,
      newArrival: true,
      material: "100% Organic Cotton",
      fit: "Regular",
      care: "Wash inside out, cold water",
      origin: "USA",
      tags: ["graphic", "art", "screen-print"],
      categoryId: categories[2].id,
      imageIndex: 2,
      colorSubset: ["Black", "White"],
    },
    {
      name: "Vintage Logo Tee",
      slug: "vintage-logo-tee",
      description:
        "Distressed vintage-inspired logo print with a lived-in aesthetic from day one. Enzyme-washed for a soft, broken-in feel. A nod to classic sportswear with a premium twist.",
      shortDesc: "Enzyme-washed vintage print",
      price: 1149,
      compareAt: null,
      featured: false,
      bestSeller: true,
      newArrival: false,
      material: "100% Cotton",
      fit: "Regular",
      care: "Machine wash cold, tumble dry low",
      origin: "Portugal",
      tags: ["graphic", "vintage", "logo"],
      categoryId: categories[2].id,
      imageIndex: 6,
      colorSubset: ["Black", "Stone", "Navy"],
    },
    {
      name: "Limited Edition Midnight",
      slug: "limited-edition-midnight",
      description:
        "A small-batch release in deep midnight navy with tonal embroidery. Only 500 pieces produced. Each tee is individually numbered on the inside label. When they're gone, they're gone.",
      shortDesc: "Numbered limited release — 500 pcs",
      price: 1599,
      compareAt: 1999,
      featured: true,
      bestSeller: true,
      newArrival: true,
      material: "100% Organic Cotton",
      fit: "Regular",
      care: "Hand wash recommended",
      origin: "Japan",
      tags: ["limited", "numbered", "embroidery"],
      categoryId: categories[3].id,
      imageIndex: 3,
      colorSubset: ["Navy"],
    },
    {
      name: "Artisan Dyed Tee",
      slug: "artisan-dyed-tee",
      description:
        "Hand-dyed using natural indigo and botanical pigments. Each piece is unique with subtle color variations. A collaboration with a Kyoto-based dye house. Limited to 200 units.",
      shortDesc: "Hand-dyed natural indigo",
      price: 1799,
      compareAt: 2299,
      featured: false,
      bestSeller: false,
      newArrival: true,
      material: "100% Organic Cotton",
      fit: "Relaxed",
      care: "Wash separately, cold water only",
      origin: "Japan",
      tags: ["limited", "hand-dyed", "indigo"],
      categoryId: categories[3].id,
      imageIndex: 7,
      colorSubset: ["Stone", "Navy"],
    },
  ];

  const createdProducts = [];

  for (const productData of productsData) {
    const { imageIndex, colorSubset, categoryId, ...productFields } = productData;

    const product = await prisma.product.create({
      data: {
        ...productFields,
        categoryId,
        images: {
          create: [
            {
              url: UNSPLASH_IMAGES[imageIndex],
              alt: `${productFields.name} — front view`,
              sortOrder: 0,
            },
            {
              url: UNSPLASH_IMAGES[(imageIndex + 1) % UNSPLASH_IMAGES.length],
              alt: `${productFields.name} — detail view`,
              sortOrder: 1,
            },
          ],
        },
      },
    });

    const selectedColors = COLORS.filter((c) =>
      (colorSubset as string[]).includes(c.name)
    );

    for (const color of selectedColors) {
      for (const size of SIZES) {
        const sku = `${product.slug.toUpperCase().replace(/-/g, "")}-${color.name.toUpperCase().slice(0, 3)}-${size}`;

        await prisma.variant.create({
          data: {
            sku,
            size,
            color: color.name,
            colorHex: color.hex,
            productId: product.id,
            inventory: {
              create: {
                quantity: randomInventory(),
                reserved: 0,
                lowStock: 5,
              },
            },
          },
        });
      }
    }

    createdProducts.push(product);
  }

  console.log("✅ Products and variants created");

  const reviewsData = [
    {
      productSlug: "essential-crew-tee",
      userId: demoUser.id,
      rating: 5,
      title: "Best everyday tee",
      comment:
        "Incredibly soft and the fit is perfect. I've washed it multiple times and it holds its shape beautifully. Already ordered two more colors.",
      verified: true,
      approved: true,
    },
    {
      productSlug: "essential-crew-tee",
      userId: admin.id,
      rating: 4,
      title: "Great quality",
      comment:
        "Premium feel and weight. Slightly runs large — I'd size down if you prefer a fitted look. The stone color is gorgeous in person.",
      verified: true,
      approved: true,
    },
    {
      productSlug: "oversized-drop-shoulder",
      userId: demoUser.id,
      rating: 5,
      title: "Perfect oversized fit",
      comment:
        "Exactly the relaxed silhouette I was looking for. Heavy enough to drape well but not stiff. My new go-to for casual days.",
      verified: true,
      approved: true,
    },
    {
      productSlug: "abstract-wave-graphic",
      userId: demoUser.id,
      rating: 5,
      title: "Stunning print quality",
      comment:
        "The print is so soft you can barely feel it on the fabric. Gets compliments every time I wear it. Worth the price.",
      verified: true,
      approved: true,
    },
    {
      productSlug: "limited-edition-midnight",
      userId: demoUser.id,
      rating: 5,
      title: "Worth every penny",
      comment:
        "The embroidery detail is immaculate and the midnight navy color is rich and deep. Love that it's numbered — feels special.",
      verified: true,
      approved: true,
    },
    {
      productSlug: "vintage-logo-tee",
      userId: admin.id,
      rating: 4,
      title: "Great vintage vibe",
      comment:
        "Love the washed-out look and soft hand feel. Print has a nice cracked texture that looks authentic. Runs true to size.",
      verified: true,
      approved: true,
    },
  ];

  for (const review of reviewsData) {
    const product = createdProducts.find((p) => p.slug === review.productSlug);
    if (!product) continue;

    await prisma.review.create({
      data: {
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        verified: review.verified,
        approved: review.approved,
        userId: review.userId,
        productId: product.id,
      },
    });
  }

  console.log("✅ Reviews created");

  await prisma.coupon.createMany({
    data: [
      {
        code: "WELCOME10",
        description: "10% off your first order",
        discountType: "PERCENT",
        discountValue: 10,
        minOrder: 30,
        maxUses: 1000,
        active: true,
      },
      {
        code: "FREESHIP",
        description: "$5.99 off shipping",
        discountType: "FIXED",
        discountValue: 79,
        minOrder: 999,
        maxUses: null,
        active: true,
      },
    ],
  });

  console.log("✅ Coupons created");

  await prisma.newsletter.create({
    data: { email: "newsletter@example.com", active: true },
  });

  // Site content defaults (Admin → Site content) — inline to avoid path-alias issues in seed
  const siteContentDefaults: Record<string, object> = {
    site: {
      name: "Premium Tees",
      description:
        "Premium essentials. Soft cotton tees designed with obsessive attention to fit, fabric, and finish.",
    },
    hero: {
      brand: "Premium Tees",
      headline: "Tees built for everyday excellence.",
      subheadline:
        "Premium organic cotton, refined fit, and a finish that holds up wash after wash.",
      imageUrl:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1920&q=80",
      primaryCtaLabel: "Shop",
      primaryCtaHref: "/shop",
      secondaryCtaLabel: "Collections",
      secondaryCtaHref: "/collections",
    },
    home: {
      template: "parallax",
      marqueeItems: [
        "Organic cotton",
        "Refined fit",
        "Everyday wear",
        "Built to last",
      ],
      essentials: {
        title: "Essentials",
        subtitle: "A short edit of pieces we reach for every week.",
      },
      story: {
        eyebrow: "Premium Tees",
        title: "Cut slow. Worn daily.",
        body: "Soft organic cotton, a considered fit, and finishes that stay honest after every wash.",
        ctaLabel: "Our story",
        ctaHref: "/about",
        imageUrl:
          "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=1920&q=80",
      },
      bestSellers: {
        title: "Best sellers",
        subtitle: "The pieces our community reaches for again and again.",
      },
      newArrivals: {
        title: "New arrivals",
        subtitle: "Fresh cuts and colors, just landed.",
      },
      categories: {
        title: "Shop by category",
        subtitle: "Curated collections for every part of your wardrobe.",
      },
    },
    about: {
      eyebrow: "Our story",
      title: "Less noise. Better tees.",
      intro:
        "Premium essentials. Soft cotton tees designed with obsessive attention to fit, fabric, and finish.",
      storyTitle: "Crafted for everyday",
      storyParagraphs: [
        "Premium Tees started with a simple frustration: great-looking tees that fell apart after a few washes. We spent two years sourcing long-staple organic cotton, refining our patterns, and partnering with factories that share our standards for fair labor and low-impact production.",
        "Every piece is designed in Los Angeles and built to become a staple — not a seasonal throwaway. Minimal branding, maximum quality.",
      ],
      valuesTitle: "What we stand for",
      values: [
        {
          title: "Premium materials",
          body: "Organic and long-staple cotton, low-impact dyes, and fabrics that soften with wear — never thin out.",
        },
        {
          title: "Intentional fit",
          body: "A modern tailored silhouette that works tucked or untucked, layered or alone.",
        },
        {
          title: "Transparent production",
          body: "We publish material and factory details for every product. No greenwashing, no shortcuts.",
        },
      ],
      ctaTitle: "Ready to feel the difference?",
      ctaSubtitle: "Explore the collection and find your next everyday essential.",
      ctaLabel: "Shop the collection",
      ctaHref: "/shop",
    },
    testimonials: {
      title: "What customers say",
      subtitle: "Real feedback from people who live in our tees.",
      items: [
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
      ],
    },
    faq: {
      title: "Frequently asked questions",
      subtitle:
        "Everything you need to know about ordering, sizing, and caring for your tees.",
      items: [
        {
          question: "What is your shipping policy?",
          answer:
            "Orders over $100 ship free within the US. Standard shipping takes 5–7 business days. Express and overnight options are available at checkout.",
        },
        {
          question: "How do I find my size?",
          answer:
            "Our tees follow a modern tailored fit. Check the size guide on each product page. If you're between sizes, we recommend sizing up for a relaxed look.",
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
          question: "Do you ship internationally?",
          answer:
            "Yes — we currently ship to the US, Canada, UK, and Australia. International duties and taxes may apply depending on your location.",
        },
        {
          question: "Are your products sustainably made?",
          answer:
            "We use premium organic and long-staple cotton, low-impact dyes, and partner with factories that meet fair labor standards. Details are listed on each product.",
        },
      ],
    },
    instagram: {
      title: "On the gram",
      subtitle: "Tag us @premiumtees for a chance to be featured.",
      profileUrl: "https://instagram.com",
      images: UNSPLASH_IMAGES.slice(0, 6),
    },
    newsletter: {
      title: "Stay in the loop",
      subtitle: "New drops, restocks, and fabric stories — delivered to your inbox.",
    },
    theme: {
      presetId: "studio",
      background: "#fafafa",
      foreground: "#0a0a0a",
      muted: "#f4f4f5",
      mutedForeground: "#71717a",
      border: "#e4e4e7",
      accent: "#18181b",
      accentForeground: "#fafafa",
      ring: "#0a0a0a",
      fontSans: "DM Sans",
      fontDisplay: "Instrument Serif",
      buttonRadius: "pill",
      buttonStyle: "solid",
      buttonWeight: "medium",
      linkStyle: "underline",
    },
  };

  for (const [key, data] of Object.entries(siteContentDefaults)) {
    await prisma.siteContent.create({ data: { key, data } });
  }
  console.log("✅ Site content created");

  console.log("🎉 Seed completed successfully!");
  console.log("   SuperAdmin: superadmin@premiumtees.com / SuperAdmin123!");
  console.log("   Admin:      admin@premiumtees.com / Admin123!");
  console.log("   Guest:      guest@premiumtees.com / Guest1234!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
