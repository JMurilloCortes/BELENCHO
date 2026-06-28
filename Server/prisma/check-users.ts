import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany();
  console.log("Total usuarios:", users.length);
  for (const u of users) {
    console.log(` - ${u.id} | ${u.email} | ${u.name} | ${u.role}`);
  }
  if (users.length === 0) {
    console.log("No hay usuarios registrados. Regístrate primero en /registro");
  }
  await prisma.$disconnect();
}
main();
