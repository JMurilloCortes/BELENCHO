import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { prisma } from "../lib/prisma";

export async function getCart(req: AuthRequest, res: Response) {
  try {
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
      include: { items: { include: { product: { include: { images: true, category: true } } } } },
    });
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user!.id },
        include: { items: { include: { product: { include: { images: true, category: true } } } } },
      });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el carrito" });
  }
}

export async function addToCart(req: AuthRequest, res: Response) {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });

    let cart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: req.user!.id } });
    }

    const existing = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    }

    const updated = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: { include: { images: true, category: true } } } } },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Error al agregar al carrito" });
  }
}

export async function updateCartItem(req: AuthRequest, res: Response) {
  try {
    const { quantity } = req.body;
    const itemId = req.params.itemId as string;
    const item = await prisma.cartItem.findUnique({ where: { id: itemId } });
    if (!item) return res.status(404).json({ error: "Item no encontrado" });

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: item.id } });
    } else {
      await prisma.cartItem.update({ where: { id: item.id }, data: { quantity } });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
      include: { items: { include: { product: { include: { images: true, category: true } } } } },
    });
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el item" });
  }
}

export async function removeFromCart(req: AuthRequest, res: Response) {
  try {
    const itemId = req.params.itemId as string;
    await prisma.cartItem.delete({ where: { id: itemId } });
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
      include: { items: { include: { product: { include: { images: true, category: true } } } } },
    });
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar del carrito" });
  }
}
