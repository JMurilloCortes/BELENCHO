import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function test() {
  try {
    const users = await prisma.user.findMany({ take: 2 });
    console.log("Users:", users.map((u) => ({ id: u.id, email: u.email })));

    if (users.length > 0) {
      const productId = "ramón-el-carismático";
      const product = await prisma.product.findUnique({ where: { id: productId } });
      console.log("Product found:", !!product);

      if (product) {
        const existing = await prisma.favorite.findUnique({
          where: { userId_productId: { userId: users[0].id, productId } },
        });
        console.log("Existing favorite:", !!existing);

        if (!existing) {
          const favorite = await prisma.favorite.create({
            data: { userId: users[0].id, productId },
            include: { product: { include: { images: true, category: true } } },
          });
          console.log("Favorite created:", favorite.id);
        }
      }
    }
  } catch (e) {
    console.error("Error:", e);
  }
  await prisma.$disconnect();
}
test();
