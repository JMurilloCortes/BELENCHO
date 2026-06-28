import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import {
  getDashboardStats, getUsers, updateUserRole,
  getAllOrders, getOrderDetail, updateOrderStatus,
  createProduct, updateProduct, deleteProduct,
  getCategories, createCategory,
} from "../controllers/admin.controller";

const router = Router();

router.use(authenticate as any);
router.use(authorize("ADMIN", "COLLABORATOR") as any);

router.get("/dashboard", getDashboardStats as any);

router.get("/users", authorize("ADMIN") as any, getUsers as any);
router.put("/users/:id/role", authorize("ADMIN") as any, updateUserRole as any);

router.get("/orders", getAllOrders as any);
router.get("/orders/:id", getOrderDetail as any);
router.put("/orders/:id/status", updateOrderStatus as any);

router.post("/products", createProduct as any);
router.put("/products/:id", updateProduct as any);
router.delete("/products/:id", deleteProduct as any);

router.get("/categories", getCategories as any);
router.post("/categories", createCategory as any);

export default router;
