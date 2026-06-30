import { prisma } from "../lib/prisma";
import axios from "axios";
import { emitNewOrder } from "../lib/socket";

const WOMPI_API = process.env.WOMPI_API || "https://sandbox.wompi.co/v1";
const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY || "";
const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || "";
const SERVER_URL = process.env.SERVER_URL || "http://localhost:4000";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

export async function createWompiTransaction(orderId: string, total: number) {
  if (!WOMPI_PRIVATE_KEY) {
    return {
      paymentId: `mock-wompi-${orderId}`,
      redirectUrl: `${CLIENT_URL}/pago/confirmacion?orderId=${orderId}`,
    };
  }
  const totalCents = Math.round(Number(total) * 100);
  const { data } = await axios.post(
    `${WOMPI_API}/transactions`,
    {
      amount_in_cents: totalCents,
      currency: "COP",
      reference: orderId,
      redirect_url: `${CLIENT_URL}/pago/confirmacion?orderId=${orderId}`,
    },
    {
      headers: {
        Authorization: `Bearer ${WOMPI_PRIVATE_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
  return {
    paymentId: data.data.id,
    redirectUrl: data.data.redirect_url,
  };
}

export async function confirmWompiTransaction(transactionId: string) {
  if (!WOMPI_PRIVATE_KEY) {
    return { status: "APPROVED", reference: transactionId.replace("mock-wompi-", "") };
  }
  const { data } = await axios.get(`${WOMPI_API}/transactions/${transactionId}`, {
    headers: { Authorization: `Bearer ${WOMPI_PRIVATE_KEY}` },
  });
  return {
    status: data.data.status,
    reference: data.data.reference,
  };
}

export async function createMercadoPagoPreference(orderId: string, total: number, items: any[]) {
  if (!MP_ACCESS_TOKEN) {
    return {
      paymentId: `mock-mp-${orderId}`,
      redirectUrl: `${CLIENT_URL}/pago/confirmacion?orderId=${orderId}`,
    };
  }
  const { data } = await axios.post(
    "https://api.mercadopago.com/checkout/preferences",
    {
      external_reference: orderId,
      notification_url: `${SERVER_URL}/api/payments/webhook/mercadopago`,
      back_urls: {
        success: `${CLIENT_URL}/pago/confirmacion?orderId=${orderId}`,
        failure: `${CLIENT_URL}/pago/fallido`,
        pending: `${CLIENT_URL}/pago/pendiente`,
      },
      auto_return: "approved",
      items: items.map((item) => ({
        id: item.productId,
        title: item.product.name,
        quantity: item.quantity,
        unit_price: Number(item.product.price),
        currency_id: "COP",
      })),
    },
    {
      headers: {
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
  return {
    paymentId: data.id,
    redirectUrl: data.init_point,
  };
}

export async function createOrderFromCart(
  userId: string,
  paymentMethod: "WOMPI" | "MERCADOPAGO",
  customerData: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryAddress: string;
    deliveryInstructions?: string;
    neighborhoodId: string;
    deliveryDate: string;
    deliveryTimeSlot: string;
    giftFrom?: string;
    giftTo?: string;
    giftMessage?: string;
    deliveryCost?: number;
  }
) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error("El carrito está vacío");
  }

  for (const item of cart.items) {
    if (item.quantity > item.product.stock) {
      throw new Error(`Stock insuficiente para ${item.product.name}`);
    }
  }

  const subtotal = cart.items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
  const deliveryCost = customerData.deliveryCost || 0;
  const total = subtotal + deliveryCost;

  const order = await prisma.order.create({
    data: {
      userId,
      customerName: customerData.customerName,
      customerEmail: customerData.customerEmail,
      customerPhone: customerData.customerPhone,
      deliveryAddress: customerData.deliveryAddress,
      deliveryInstructions: customerData.deliveryInstructions || null,
      neighborhoodId: customerData.neighborhoodId,
      deliveryDate: customerData.deliveryDate,
      deliveryTimeSlot: customerData.deliveryTimeSlot,
      giftFrom: customerData.giftFrom || null,
      giftTo: customerData.giftTo || null,
      giftMessage: customerData.giftMessage || null,
      total,
      deliveryCost,
      paymentMethod,
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        })),
      },
    },
    include: { items: true },
  });

  for (const item of cart.items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } },
    });
  }

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  emitNewOrder(order);

  return order;
}
