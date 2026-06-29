import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@belencho.com" },
    update: { role: "ADMINISTRADOR" },
    create: { email: "admin@belencho.com", name: "Admin", password: adminPassword, role: "ADMINISTRADOR" },
  });
  console.log(`Admin: ${admin.email} / admin123`);

  const catFlores = await prisma.category.upsert({
    where: { slug: "flores" },
    update: {},
    create: { name: "Flores", slug: "flores" },
  });

  const catHogar = await prisma.category.upsert({
    where: { slug: "hogar" },
    update: {},
    create: { name: "Hogar", slug: "hogar" },
  });

  const catKits = await prisma.category.upsert({
    where: { slug: "kits" },
    update: {},
    create: { name: "Kits", slug: "kits" },
  });

  const catAccesorios = await prisma.category.upsert({
    where: { slug: "accesorios" },
    update: {},
    create: { name: "Accesorios", slug: "accesorios" },
  });

  const products = [
    {
      name: "Ramón el carismático",
      description: "Hermoso ramo de rosas eternas que nunca se marchitan. Perfecto para regalar en cualquier ocasión especial. Cada rosa es preservada individualmente para mantener su belleza por años.",
      price: 45000,
      stock: 12,
      categoryId: catFlores.id,
      images: [
        "https://placehold.co/600x600/49b8a7/ffffff?text=Ramón+1",
        "https://placehold.co/600x600/3d9e8f/ffffff?text=Ramón+2",
        "https://placehold.co/600x600/328478/ffffff?text=Ramón+3",
      ],
    },
    {
      name: "Taza personalizada",
      description: "Taza de cerámica con diseño único. Ideal para el café de cada mañana o como detalle especial. Personalizable con nombres y frases.",
      price: 25000,
      stock: 8,
      categoryId: catHogar.id,
      images: [
        "https://placehold.co/600x600/fc8a80/ffffff?text=Taza+1",
        "https://placehold.co/600x600/e06b62/ffffff?text=Taza+2",
      ],
    },
    {
      name: "Kit de regalo sorpresa",
      description: "Caja sorpresa con accesorios seleccionados especialmente para consentir a esa persona especial. Incluye detalles únicos y personalizados.",
      price: 65000,
      stock: 5,
      categoryId: catKits.id,
      images: [
        "https://placehold.co/600x600/f8e694/333333?text=Kit+1",
        "https://placehold.co/600x600/d9c76b/333333?text=Kit+2",
        "https://placehold.co/600x600/f8e694/333333?text=Kit+3",
      ],
    },
    {
      name: "Llavero artesanal",
      description: "Llavero hecho a mano con materiales de alta calidad. Diseño exclusivo BELENCHO.",
      price: 15000,
      stock: 20,
      categoryId: catAccesorios.id,
      images: [
        "https://placehold.co/600x600/49b8a7/ffffff?text=Llavero",
      ],
    },
  ];

  for (const product of products) {
    const { images, ...data } = product;
    const created = await prisma.product.upsert({
      where: { id: product.name.toLowerCase().replace(/\s+/g, "-") },
      update: data,
      create: { id: product.name.toLowerCase().replace(/\s+/g, "-"), ...data },
    });

    for (let i = 0; i < images.length; i++) {
      await prisma.productImage.upsert({
        where: { id: `${created.id}-img-${i}` },
        update: { url: images[i] },
        create: { id: `${created.id}-img-${i}`, url: images[i], productId: created.id, order: i },
      });
    }
  }

  console.log("Seed completado ✅");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
