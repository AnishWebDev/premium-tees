/**
 * One-time: scale USD-looking product prices to INR (×20).
 * Safe to re-run — skips products already priced >= 200.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const MULTIPLIER = 20;

async function main() {
  const products = await prisma.product.findMany();
  for (const product of products) {
    const price = Number(product.price);
    if (price >= 200) {
      console.log(`skip ${product.slug} (already INR-ish: ${price})`);
      continue;
    }
    await prisma.product.update({
      where: { id: product.id },
      data: {
        price: Math.round(price * MULTIPLIER),
        compareAt: product.compareAt
          ? Math.round(Number(product.compareAt) * MULTIPLIER)
          : null,
      },
    });
    console.log(`updated ${product.slug}: ${price} → ${Math.round(price * MULTIPLIER)}`);
  }

  const coupons = await prisma.coupon.findMany();
  for (const coupon of coupons) {
    if (coupon.discountType === "FIXED" && Number(coupon.discountValue) < 200) {
      await prisma.coupon.update({
        where: { id: coupon.id },
        data: {
          discountValue: Math.round(Number(coupon.discountValue) * MULTIPLIER),
          minOrder: coupon.minOrder
            ? Math.round(Number(coupon.minOrder) * MULTIPLIER)
            : null,
        },
      });
      console.log(`updated coupon ${coupon.code}`);
    }
  }

  console.log("Done");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
