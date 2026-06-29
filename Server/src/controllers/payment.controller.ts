import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import {
  createOrderFromCart,
  createWompiTransaction,
  createMercadoPagoPreference,
  confirmWompiTransaction,
} from "../services/payment.service";
import { prisma } from "../lib/prisma";

export async function createPayment(req: AuthRequest, res: Response) {
  try {
    const { paymentMethod, customerName, customerEmail, customerPhone, deliveryAddress, deliveryInstructions, neighborhoodId, deliveryDate, deliveryTimeSlot, giftFrom, giftTo, giftMessage } = req.body;
    if (!["WOMPI", "MERCADOPAGO"].includes(paymentMethod)) {
      return res.status(400).json({ error: "Método de pago inválido" });
    }
    if (!customerName || !customerEmail || !customerPhone || !deliveryAddress || !neighborhoodId) {
      return res.status(400).json({ error: "Completa todos los datos de entrega" });
    }
    if (!deliveryDate || !deliveryTimeSlot) {
      return res.status(400).json({ error: "Selecciona fecha y horario de entrega" });
    }

    const neighborhood = await prisma.neighborhood.findUnique({ where: { id: neighborhoodId } });
    if (!neighborhood || !neighborhood.active) {
      return res.status(400).json({ error: "Barrio no disponible para entregas" });
    }

    // Validate delivery slot availability
    const bookedCount = await prisma.order.count({
      where: {
        deliveryDate,
        deliveryTimeSlot,
        status: { notIn: ["CANCELLED", "REFUNDED"] },
      },
    });
    if (bookedCount >= 5) {
      return res.status(400).json({ error: "Este horario ya no tiene cupo disponible" });
    }

    const order = await createOrderFromCart(req.user!.id, paymentMethod, {
      customerName, customerEmail, customerPhone, deliveryAddress, deliveryInstructions, neighborhoodId, deliveryDate, deliveryTimeSlot, giftFrom, giftTo, giftMessage,
    });

    let result;
    if (paymentMethod === "WOMPI") {
      result = await createWompiTransaction(order.id, Number(order.total));
    } else {
      const fullOrder = await prisma.order.findUnique({
        where: { id: order.id },
        include: { items: { include: { product: true } } },
      });
      result = await createMercadoPagoPreference(order.id, Number(order.total), fullOrder!.items);
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { paymentId: result.paymentId, redirectUrl: result.redirectUrl },
    });

    res.json({ orderId: order.id, redirectUrl: result.redirectUrl });
  } catch (e: any) {
    res.status(500).json({ error: e.message || "Error al procesar pago" });
  }
}

export async function confirmPayment(req: Request, res: Response) {
  try {
    const transactionId = req.query.transactionId;
    if (!transactionId || typeof transactionId !== "string") {
      return res.status(400).json({ error: "transactionId requerido" });
    }

    const result = await confirmWompiTransaction(transactionId);

    const order = await prisma.order.findUnique({ where: { id: result.reference } });
    if (!order) return res.status(404).json({ error: "Orden no encontrada" });

    if (result.status === "APPROVED") {
      await prisma.order.update({ where: { id: order.id }, data: { status: "PAID" } });
      return res.json({ status: "PAID", orderId: order.id });
    }

    res.json({ status: result.status, orderId: order.id });
  } catch {
    res.status(500).json({ error: "Error al confirmar pago" });
  }
}

export async function handleWompiWebhook(req: Request, res: Response) {
  try {
    const { event, data } = req.body;
    if (event === "transaction.updated" && data?.transaction) {
      const { id, status, reference } = data.transaction;
      const order = await prisma.order.findUnique({
        where: { id: reference },
        include: { items: true },
      });
      if (!order) return res.status(404).json({ error: "Orden no encontrada" });

      if (status === "APPROVED") {
        await prisma.order.update({ where: { id: order.id }, data: { status: "PAID", paymentId: id } });
      } else if (["DECLINED", "VOIDED", "ERROR"].includes(status)) {
        await prisma.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
        for (const item of order.items) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
    }
    res.sendStatus(200);
  } catch {
    res.sendStatus(500);
  }
}

export async function handleMercadoPagoWebhook(req: Request, res: Response) {
  try {
    const { type, data } = req.body;
    if (type === "payment" && data?.id) {
      const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
        headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
      });
      const payment: any = await mpRes.json();

      const order = await prisma.order.findUnique({ where: { id: payment.external_reference } });
      if (!order) return res.status(404).json({ error: "Orden no encontrada" });

      if (payment.status === "approved") {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "PAID", paymentId: String(payment.id) },
        });
      } else if (["rejected", "cancelled", "refunded"].includes(payment.status)) {
        await prisma.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
      }
    }
    res.sendStatus(200);
  } catch {
    res.sendStatus(500);
  }
}

export async function getOrder(req: AuthRequest, res: Response) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: String(req.params.id) },
      include: {
        neighborhood: { select: { id: true, name: true } },
        items: { include: { product: { include: { images: true } } } },
      },
    });
    if (!order) return res.status(404).json({ error: "Orden no encontrada" });
    if (order.userId !== req.user!.id) return res.status(403).json({ error: "No autorizado" });
    res.json(order);
  } catch {
    res.status(500).json({ error: "Error al obtener orden" });
  }
}

export async function getUserOrders(req: AuthRequest, res: Response) {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
      include: {
        neighborhood: { select: { id: true, name: true } },
        items: { include: { product: { include: { images: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch {
    res.status(500).json({ error: "Error al obtener órdenes" });
  }
}
