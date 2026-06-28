import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { prisma } from "../lib/prisma";

export async function getFavorites(req: AuthRequest, res: Response) {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user!.id },
      include: { product: { include: { images: true, category: true } } },
    });
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener favoritos" });
  }
}

export async function addFavorite(req: AuthRequest, res: Response) {
  try {
    const { productId } = req.body;
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });

    const existing = await prisma.favorite.findUnique({
      where: { userId_productId: { userId: req.user!.id, productId } },
    });
    if (existing) return res.status(409).json({ error: "Ya está en favoritos" });

    const favorite = await prisma.favorite.create({
      data: { userId: req.user!.id, productId },
      include: { product: { include: { images: true, category: true } } },
    });
    res.status(201).json(favorite);
  } catch (error) {
    res.status(500).json({ error: "Error al agregar a favoritos" });
  }
}

export async function removeFavorite(req: AuthRequest, res: Response) {
  try {
    const productId = req.params.productId as string;
    await prisma.favorite.deleteMany({
      where: { userId: req.user!.id, productId },
    });
    res.json({ message: "Eliminado de favoritos" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar de favoritos" });
  }
}
