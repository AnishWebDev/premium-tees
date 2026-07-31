import { PrismaClient } from "@prisma/client";
import { CONTENT_KEYS, DEFAULT_SITE_CONTENT } from "../src/lib/site-content";

const prisma = new PrismaClient();

async function main() {
  for (const key of CONTENT_KEYS) {
    await prisma.siteContent.upsert({
      where: { key },
      create: { key, data: DEFAULT_SITE_CONTENT[key] },
      update: {},
    });
  }
  console.log("✅ Site content ready");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
