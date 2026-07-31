/**
 * Upsert SuperAdmin / Admin / Guest accounts without wiping the catalog.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const USERS = [
  {
    email: "superadmin@premiumtees.com",
    name: "Super Admin",
    password: "SuperAdmin123!",
    role: "SUPERADMIN" as const,
  },
  {
    email: "admin@premiumtees.com",
    name: "Store Admin",
    password: "Admin123!",
    role: "ADMIN" as const,
  },
  {
    email: "guest@premiumtees.com",
    name: "Guest Shopper",
    password: "Guest1234!",
    role: "USER" as const,
  },
];

async function main() {
  for (const user of USERS) {
    const password = await bcrypt.hash(user.password, 12);
    await prisma.user.upsert({
      where: { email: user.email },
      create: {
        email: user.email,
        name: user.name,
        password,
        role: user.role,
      },
      update: {
        name: user.name,
        password,
        role: user.role,
      },
    });
    console.log(`✓ ${user.role.padEnd(11)} ${user.email} / ${user.password}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
