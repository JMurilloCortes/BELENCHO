import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import {
  getDashboardStats, getAllProducts, getUsers, updateUserRole, updateUser,
  getAllOrders, getOrderDetail, updateOrderStatus,
  createProduct, updateProduct, deleteProduct,
  getCategories, createCategory, updateCategory, deleteCategory,
  toggleProductActive, toggleCategoryActive, toggleUserActive, deleteUser,
} from "../controllers/admin.controller";

const router = Router();

router.use(authenticate as any);
router.use(authorize("ADMIN", "COLLABORATOR") as any);

router.get("/dashboard", getDashboardStats as any);

router.get("/users", authorize("ADMIN") as any, getUsers as any);
router.put("/users/:id", authorize("ADMIN") as any, updateUser as any);
router.put("/users/:id/role", authorize("ADMIN") as any, updateUserRole as any);
router.put("/users/:id/toggle-active", authorize("ADMIN") as any, toggleUserActive as any);
router.delete("/users/:id", authorize("ADMIN") as any, deleteUser as any);

router.get("/orders", getAllOrders as any);
router.get("/orders/:id", getOrderDetail as any);
router.put("/orders/:id/status", updateOrderStatus as any);

router.get("/products", getAllProducts as any);
router.post("/products", createProduct as any);
router.put("/products/:id", updateProduct as any);
router.put("/products/:id/toggle-active", toggleProductActive as any);
router.delete("/products/:id", deleteProduct as any);

router.get("/categories", getCategories as any);
router.post("/categories", createCategory as any);
router.put("/categories/:id", updateCategory as any);
router.put("/categories/:id/toggle-active", toggleCategoryActive as any);
router.delete("/categories/:id", deleteCategory as any);

export default router;
