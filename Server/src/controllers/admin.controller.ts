import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { prisma } from "../lib/prisma";

export async function getDashboardStats(_req: AuthRequest, res: Response) {
  try {
    const [totalProducts, totalUsers, totalOrders, totalRevenue, ordersByStatus, recentOrders] =
      await Promise.all([
        prisma.product.count(),
        prisma.user.count(),
        prisma.order.count(),
        prisma.order.aggregate({ _sum: { total: true }, where: { status: "PAID" } }),
        prisma.order.groupBy({ by: ["status"], _count: true }),
        prisma.order.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: { user: { select: { name: true, email: true } }, items: { include: { product: { select: { name: true } } } } },
        }),
      ]);

    res.json({
      totalProducts,
      totalUsers,
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      ordersByStatus,
      recentOrders,
    });
  } catch {
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
}

export async function getUsers(_req: AuthRequest, res: Response) {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true, _count: { select: { orders: true, reviews: true } } },
      orderBy: { createdAt: "desc" },
    });
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

export async function getAllOrders(_req: AuthRequest, res: Response) {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: { select: { name: true, images: { take: 1, orderBy: { order: "asc" } } } } } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch {
    res.status(500).json({ error: "Error al obtener órdenes" });
  }
}

export async function getOrderDetail(req: AuthRequest, res: Response) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: String(req.params.id) },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: { include: { images: { orderBy: { order: "asc" } } } } } },
      },
    });
    if (!order) return res.status(404).json({ error: "Orden no encontrada" });
    res.json(order);
  } catch {
    res.status(500).json({ error: "Error al obtener orden" });
  }
}

export async function updateOrderStatus(req: AuthRequest, res: Response) {
  try {
    const { status } = req.body;
    if (!["PENDING", "PAID", "CANCELLED", "REFUNDED"].includes(status)) {
      return res.status(400).json({ error: "Estado inválido" });
    }
    const order = await prisma.order.update({
      where: { id: String(req.params.id) },
      data: { status },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    });

    if (status === "CANCELLED") {
      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    res.json(order);
  } catch {
    res.status(500).json({ error: "Error al actualizar orden" });
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
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
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
    const { name, description, price, stock, categoryId, images } = req.body;
    const data: any = {};
    if (name) data.name = name;
    if (description !== undefined) data.description = description;
    if (price) data.price = parseFloat(price);
    if (stock !== undefined) data.stock = parseInt(stock);
    if (categoryId) data.categoryId = categoryId;

    const product = await prisma.product.update({
      where: { id },
      data,
      include: { images: { orderBy: { order: "asc" } }, category: true },
    });

    if (images?.length) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      for (let i = 0; i < images.length; i++) {
        await prisma.productImage.create({ data: { url: images[i], productId: id, order: i } });
      }
    }

    const updated = await prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { order: "asc" } }, category: true },
    });
    res.json(updated);
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
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    });
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
