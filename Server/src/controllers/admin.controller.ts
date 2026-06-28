import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { prisma } from "../lib/prisma";

export async function getUsers(_req: AuthRequest, res: Response) {
  try {
    const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, role: true, createdAt: true } });
    res.json(users);
  } catch {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
}

export async function updateUserRole(req: AuthRequest, res: Response) {
  try {
    const { role } = req.body;
    if (!["ADMIN", "COLLABORATOR", "CLIENT"].includes(role)) {
      return res.status(400).json({ error: "Rol inválido" });
    }
    const user = await prisma.user.update({
      where: { id: String(req.params.id) },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    });
    res.json(user);
  } catch {
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
}

export async function createProduct(req: AuthRequest, res: Response) {
  try {
    const { name, description, price, stock, categoryId, images } = req.body;
    if (!name || !price || !categoryId) {
      return res.status(400).json({ error: "Nombre, precio y categoría son requeridos" });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || "",
        price,
        stock: stock || 0,
        categoryId,
        images: images?.length ? {
          create: images.map((url: string, i: number) => ({ url, order: i })),
        } : undefined,
      },
      include: { images: { orderBy: { order: "asc" } }, category: true },
    });
    res.status(201).json(product);
  } catch {
    res.status(500).json({ error: "Error al crear producto" });
  }
}

export async function updateProduct(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id);
    const { name, description, price, stock, categoryId } = req.body;
    const product = await prisma.product.update({
      where: { id: id },
      data: { name, description, price, stock, categoryId },
      include: { images: { orderBy: { order: "asc" } }, category: true },
    });
    res.json(product);
  } catch {
    res.status(500).json({ error: "Error al actualizar producto" });
  }
}

export async function deleteProduct(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id);
    await prisma.product.delete({ where: { id } });
    res.json({ message: "Producto eliminado" });
  } catch {
    res.status(500).json({ error: "Error al eliminar producto" });
  }
}

export async function getCategories(_req: AuthRequest, res: Response) {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
    res.json(categories);
  } catch {
    res.status(500).json({ error: "Error al obtener categorías" });
  }
}

export async function createCategory(req: AuthRequest, res: Response) {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Nombre requerido" });
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const category = await prisma.category.create({ data: { name, slug } });
    res.status(201).json(category);
  } catch {
    res.status(500).json({ error: "Error al crear categoría" });
  }
}
