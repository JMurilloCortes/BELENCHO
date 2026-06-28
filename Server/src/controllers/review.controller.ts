import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { prisma } from "../lib/prisma";

export async function createReview(req: AuthRequest, res: Response) {
  try {
    const { productId, rating, comment } = req.body;
    if (!productId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Calificación requerida (1-5)" });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });

    const existing = await prisma.review.findFirst({
      where: { userId: req.user!.id, productId },
    });
    if (existing) return res.status(409).json({ error: "Ya calificaste este producto" });

    const review = await prisma.review.create({
      data: { userId: req.user!.id, productId, rating, comment },
      include: { user: { select: { name: true, avatar: true } } },
    });
    res.status(201).json(review);
  } catch {
    res.status(500).json({ error: "Error al crear reseña" });
  }
}
