import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { emitNewOrder } from "../lib/socket";
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
        neighborhood: { select: { id: true, name: true } },
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
        neighborhood: { select: { id: true, name: true } },
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
    if (!["PENDING", "PAID", "EN_PREPARACION", "LISTA", "EN_CAMINO", "ENTREGADA", "CANCELLED", "REFUNDED"].includes(status)) {
      return res.status(400).json({ error: "Estado inválido" });
    }
    const order = await prisma.order.update({
      where: { id: String(req.params.id) },
      data: { status },
      include: {
        user: { select: { id: true, name: true, email: true } },
        neighborhood: { select: { id: true, name: true } },
        items: { include: { product: { include: { images: { orderBy: { order: "asc" } } } } } },
      },
    });

    if (status === "CANCELLED") {
      for (const item of order.items) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (product && product.inventoryType !== "MADE_TO_ORDER") {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
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
      include: { category: true, images: { orderBy: { order: "asc" } } },
    });
    res.json(products);
  } catch {
    res.status(500).json({ error: "Error al obtener productos" });
  }
}

export async function createProduct(req: AuthRequest, res: Response) {
  try {
    const { name, description, price, stock, inventoryType, transportType, categoryId, images } = req.body;
    if (!name || !price || !categoryId) {
      return res.status(400).json({ error: "Nombre, precio y categoría son requeridos" });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || "",
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        inventoryType: inventoryType || "MADE_TO_ORDER",
        transportType: transportType || "MOTO",
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
    const { name, description, price, stock, inventoryType, transportType, categoryId, images } = req.body;
    const data: any = {};
    if (name) data.name = name;
    if (description !== undefined) data.description = description;
    if (price) data.price = parseFloat(price);
    if (stock !== undefined) data.stock = parseInt(stock);
    if (inventoryType) data.inventoryType = inventoryType;
    if (transportType) data.transportType = transportType;
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
  } catch (e) {
    console.error("Error al actualizar producto:", e);
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

export async function getNeighborhoods(_req: AuthRequest, res: Response) {
  try {
    const neighborhoods = await prisma.neighborhood.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { orders: true } } },
    });
    res.json(neighborhoods);
  } catch {
    res.status(500).json({ error: "Error al obtener barrios" });
  }
}

export async function createNeighborhood(req: AuthRequest, res: Response) {
  try {
    const { name, motoPrice, taxiPrice } = req.body;
    if (!name) return res.status(400).json({ error: "Nombre requerido" });
    const neighborhood = await prisma.neighborhood.create({ data: { name, motoPrice: motoPrice ? parseFloat(motoPrice) : null, taxiPrice: taxiPrice ? parseFloat(taxiPrice) : null } });
    res.status(201).json(neighborhood);
  } catch {
    res.status(500).json({ error: "Error al crear barrio" });
  }
}

export async function updateNeighborhood(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id);
    const { name, motoPrice, taxiPrice } = req.body;
    if (!name) return res.status(400).json({ error: "Nombre requerido" });
    const data: any = { name };
    if (motoPrice !== undefined) data.motoPrice = motoPrice ? parseFloat(motoPrice) : null;
    if (taxiPrice !== undefined) data.taxiPrice = taxiPrice ? parseFloat(taxiPrice) : null;
    const neighborhood = await prisma.neighborhood.update({ where: { id }, data });
    res.json(neighborhood);
  } catch {
    res.status(500).json({ error: "Error al actualizar barrio" });
  }
}

export async function toggleNeighborhoodActive(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id);
    const current = await prisma.neighborhood.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ error: "Barrio no encontrado" });
    const updated = await prisma.neighborhood.update({
      where: { id },
      data: { active: !current.active },
    });
    res.json(updated);
  } catch {
    res.status(500).json({ error: "Error al cambiar estado" });
  }
}

export async function deleteNeighborhood(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id);
    await prisma.neighborhood.delete({ where: { id } });
    res.json({ message: "Barrio eliminado" });
  } catch {
    res.status(500).json({ error: "Error al eliminar barrio" });
  }
}

export async function getHeroSlidesAdmin(_req: AuthRequest, res: Response) {
  try {
    const slides = await prisma.heroSlide.findMany({ orderBy: { order: "asc" } });
    res.json(slides);
  } catch {
    res.status(500).json({ error: "Error al obtener slides del hero" });
  }
}

export async function createHeroSlide(req: AuthRequest, res: Response) {
  try {
    const { imageUrl, imageUrlMobile, altText, order } = req.body;
    if (!imageUrl) return res.status(400).json({ error: "URL de imagen requerida" });
    const max = await prisma.heroSlide.aggregate({ _max: { order: true } });
    const slide = await prisma.heroSlide.create({
      data: { imageUrl, imageUrlMobile: imageUrlMobile || null, altText: altText || null, order: order ?? ((max._max.order ?? -1) + 1) },
    });
    res.status(201).json(slide);
  } catch {
    res.status(500).json({ error: "Error al crear slide" });
  }
}

export async function updateHeroSlide(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id);
    const { imageUrl, imageUrlMobile, altText, order, active } = req.body;
    const data: any = {};
    if (imageUrl !== undefined) data.imageUrl = imageUrl;
    if (imageUrlMobile !== undefined) data.imageUrlMobile = imageUrlMobile;
    if (altText !== undefined) data.altText = altText;
    if (order !== undefined) data.order = order;
    if (active !== undefined) data.active = active;
    const slide = await prisma.heroSlide.update({ where: { id }, data });
    res.json(slide);
  } catch {
    res.status(500).json({ error: "Error al actualizar slide" });
  }
}

export async function deleteHeroSlide(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id);
    await prisma.heroSlide.delete({ where: { id } });
    res.json({ message: "Slide eliminado" });
  } catch {
    res.status(500).json({ error: "Error al eliminar slide" });
  }
}

export async function createManualOrder(req: AuthRequest, res: Response) {
  try {
    const { items, customerName, customerPhone, customerEmail, paymentMethod, deliveryAddress, deliveryInstructions, neighborhoodId, deliveryDate, deliveryTimeSlot, deliveryCost: clientDeliveryCost, giftFrom, giftTo, giftMessage } = req.body;

    if (!items?.length) return res.status(400).json({ error: "Debe incluir al menos un producto" });
    if (!customerName || !customerPhone) return res.status(400).json({ error: "Nombre y teléfono del cliente son obligatorios" });
    if (!["EFECTIVO", "TRANSFERENCIA", "TARJETA", "WOMPI", "MERCADOPAGO"].includes(paymentMethod)) {
      return res.status(400).json({ error: "Método de pago inválido" });
    }

    const productIds = items.map((i: any) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

    const productMap = new Map(products.map((p) => [p.id, p]));
    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) return res.status(400).json({ error: `Producto ${item.productId} no encontrado` });
      if (!product.active) return res.status(400).json({ error: `Producto ${product.name} no está disponible` });
      if (product.inventoryType !== "MADE_TO_ORDER" && item.quantity > product.stock) {
        return res.status(400).json({ error: `Stock insuficiente para ${product.name}` });
      }
    }

    if (deliveryDate && deliveryTimeSlot) {
      const bookedCount = await prisma.order.count({
        where: { deliveryDate, deliveryTimeSlot, status: { notIn: ["CANCELLED", "REFUNDED"] } },
      });
      if (bookedCount >= 5) return res.status(400).json({ error: "Este horario ya no tiene cupo disponible" });
    }

    let deliveryCost = 0;
    if (neighborhoodId && deliveryAddress !== "Recoge en tienda") {
      const neighborhood = await prisma.neighborhood.findUnique({ where: { id: neighborhoodId } });
      if (neighborhood) {
        for (const item of items) {
          const product = productMap.get(item.productId);
          const transport = product?.transportType || "MOTO";
          const cost = transport === "TAXI"
            ? Number(neighborhood.taxiPrice ?? 0)
            : Number(neighborhood.motoPrice ?? 0);
          if (cost > deliveryCost) deliveryCost = cost;
        }
      }
    }
    if (typeof clientDeliveryCost === "number" && clientDeliveryCost >= 0) {
      deliveryCost = clientDeliveryCost;
    }

    const subtotal = items.reduce((sum: number, item: any) => {
      const product = productMap.get(item.productId);
      return sum + Number(product!.price) * item.quantity;
    }, 0);

    const order = await prisma.order.create({
      data: {
        userId: req.user!.id,
        customerName,
        customerPhone,
        customerEmail: customerEmail || "",
        deliveryAddress: deliveryAddress || "Recoge en tienda",
        deliveryInstructions: deliveryInstructions || null,
        neighborhoodId: neighborhoodId || null,
        deliveryDate: deliveryDate || null,
        deliveryTimeSlot: deliveryTimeSlot || null,
        giftFrom: giftFrom || null,
        giftTo: giftTo || null,
        giftMessage: giftMessage || null,
        total: subtotal + deliveryCost,
        deliveryCost,
        paymentMethod,
        status: "PAID",
        items: {
          create: items.map((item: any) => {
            const product = productMap.get(item.productId);
            return { productId: item.productId, quantity: item.quantity, price: product!.price };
          }),
        },
      },
      include: { items: { include: { product: true } }, neighborhood: true },
    });

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (product && product.inventoryType !== "MADE_TO_ORDER") {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    emitNewOrder(order);

    res.json(order);
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Error al crear la orden" });
  }
}
