import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export async function getProducts(req: Request, res: Response) {
  try {
    const { search, categoryId, minPrice, maxPrice } = req.query;

    const where: any = {};

    if (search && typeof search === "string") {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (categoryId && typeof categoryId === "string") {
      where.categoryId = categoryId;
    }

    if (minPrice && typeof minPrice === "string") {
      where.price = { ...where.price, gte: parseFloat(minPrice) };
    }

    if (maxPrice && typeof maxPrice === "string") {
      where.price = { ...where.price, lte: parseFloat(maxPrice) };
    }

    const products = await prisma.product.findMany({
      where,
      include: { images: { orderBy: { order: "asc" } }, category: true, reviews: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(products);
  } catch {
    res.status(500).json({ error: "Error al obtener productos" });
  }
}

export async function getProduct(req: Request, res: Response) {
  try {
    const id = String(req.params.id);
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: "asc" } },
        videos: true,
        category: true,
        reviews: { include: { user: { select: { name: true, avatar: true } } }, orderBy: { createdAt: "desc" } },
      },
    });
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(product);
  } catch {
    res.status(500).json({ error: "Error al obtener el producto" });
  }
}

export async function getCategories(_req: Request, res: Response) {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
    res.json(categories);
  } catch {
    res.status(500).json({ error: "Error al obtener categorías" });
  }
}
