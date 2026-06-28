import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  createPayment,
  confirmPayment,
  handleWompiWebhook,
  handleMercadoPagoWebhook,
  getOrder,
  getUserOrders,
} from "../controllers/payment.controller";

const router = Router();

router.post("/create", authenticate as any, createPayment as any);
router.get("/confirm", confirmPayment as any);
router.get("/orders", authenticate as any, getUserOrders as any);
router.get("/orders/:id", authenticate as any, getOrder as any);

router.post("/webhook/wompi", handleWompiWebhook as any);
router.post("/webhook/mercadopago", handleMercadoPagoWebhook as any);

export default router;
