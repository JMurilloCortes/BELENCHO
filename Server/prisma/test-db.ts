import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function test() {
  try {
    const products = await prisma.product.findMany({ take: 3 });
    console.log("Productos:", JSON.stringify(products.map(p => ({ id: p.id, name: p.name })), null, 2));
  } catch (e) {
    console.error("Error:", e);
  }
  await prisma.$disconnect();
}
test();
