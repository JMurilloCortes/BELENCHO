import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import { getCart, addToCart, updateCartItem, removeFromCart } from "../controllers/cart.controller";

const router = Router();

router.get("/", authenticate as any, getCart as any);
router.post("/", authenticate as any, addToCart as any);
router.put("/:itemId", authenticate as any, updateCartItem as any);
router.delete("/:itemId", authenticate as any, removeFromCart as any);

export default router;
