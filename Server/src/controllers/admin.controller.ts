import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

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
    if (!["ADMINISTRADOR", "COLABORADOR", "CLIENTE"].includes(role)) {
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

export async function getAllProducts(_req: AuthRequest, res: Response) {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: { category: true },
    });
    res.json(products);
  } catch {
    res.status(500).json({ error: "Error al obtener productos" });
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

export async function updateCategory(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id);
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Nombre requerido" });
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const category = await prisma.category.update({
      where: { id },
      data: { name, slug },
      include: { _count: { select: { products: true } } },
    });
    res.json(category);
  } catch {
    res.status(500).json({ error: "Error al actualizar categoría" });
  }
}

export async function deleteCategory(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id);
    await prisma.category.delete({ where: { id } });
    res.json({ message: "Categoría eliminada" });
  } catch {
    res.status(500).json({ error: "Error al eliminar categoría" });
  }
}

export async function toggleProductActive(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id);
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });
    const updated = await prisma.product.update({
      where: { id },
      data: { active: !product.active },
    });
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Error al cambiar estado" });
  }
}

export async function toggleCategoryActive(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id);
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) return res.status(404).json({ error: "Categoría no encontrada" });
    const updated = await prisma.category.update({
      where: { id },
      data: { active: !category.active },
      include: { _count: { select: { products: true } } },
    });
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Error al cambiar estado" });
  }
}

export async function toggleUserActive(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id);
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    const updated = await prisma.user.update({
      where: { id },
      data: { active: !user.active },
      select: { id: true, email: true, name: true, role: true, active: true },
    });
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Error al cambiar estado" });
  }
}

export async function updateUser(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id);
    const { name, email, role } = req.body;
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (role !== undefined) data.role = role;
    const updated = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, role: true, active: true, createdAt: true, _count: { select: { orders: true, reviews: true } } },
    });
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
}

export async function deleteUser(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id);
    await prisma.user.delete({ where: { id } });
    res.json({ message: "Usuario eliminado" });
  } catch {
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
}

export async function createUser(req: AuthRequest, res: Response) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Nombre, email y contraseña son requeridos" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "El email ya está registrado" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: role || "CLIENTE",
      },
      select: { id: true, email: true, name: true, role: true, active: true, createdAt: true },
    });
    res.status(201).json(user);
  } catch {
    res.status(500).json({ error: "Error al crear usuario" });
  }
}

export async function updateUserPassword(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id);
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id }, data: { password: hashed } });
    res.json({ message: "Contraseña actualizada" });
  } catch {
    res.status(500).json({ error: "Error al cambiar contraseña" });
  }
}

export async function resetAll(_req: AuthRequest, res: Response) {
  try {
    await prisma.$transaction([
      prisma.orderItem.deleteMany(),
      prisma.order.deleteMany(),
      prisma.favorite.deleteMany(),
      prisma.cartItem.deleteMany(),
      prisma.cart.deleteMany(),
      prisma.review.deleteMany(),
      prisma.productVideo.deleteMany(),
      prisma.productImage.deleteMany(),
      prisma.product.deleteMany(),
      prisma.category.deleteMany(),
      prisma.user.deleteMany({ where: { email: { not: "admin@belencho.com" } } }),
    ]);
    res.json({ message: "Restablecimiento completo exitoso" });
  } catch {
    res.status(500).json({ error: "Error al restablecer" });
  }
}
