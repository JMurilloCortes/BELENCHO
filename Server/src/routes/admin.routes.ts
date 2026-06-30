import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import {
  getDashboardStats, getAllProducts, getUsers, createUser, updateUserRole, updateUser,
  updateUserPassword, resetAll,
  getAllOrders, getOrderDetail, updateOrderStatus,
  createProduct, updateProduct, deleteProduct,
  getCategories, createCategory, updateCategory, deleteCategory,
  toggleProductActive, toggleCategoryActive, toggleUserActive, deleteUser,
  getNeighborhoods, createNeighborhood, updateNeighborhood,
  toggleNeighborhoodActive, deleteNeighborhood, createManualOrder,
} from "../controllers/admin.controller";

const router = Router();

router.use(authenticate as any);
router.use(authorize("ADMINISTRADOR", "COLABORADOR") as any);

router.get("/dashboard", getDashboardStats as any);

router.get("/users", authorize("ADMINISTRADOR") as any, getUsers as any);
router.post("/users", authorize("ADMINISTRADOR") as any, createUser as any);
router.put("/users/:id", authorize("ADMINISTRADOR") as any, updateUser as any);
router.put("/users/:id/role", authorize("ADMINISTRADOR") as any, updateUserRole as any);
router.put("/users/:id/toggle-active", authorize("ADMINISTRADOR") as any, toggleUserActive as any);
router.delete("/users/:id", authorize("ADMINISTRADOR") as any, deleteUser as any);
router.put("/users/:id/password", authorize("ADMINISTRADOR") as any, updateUserPassword as any);
router.post("/reset", authorize("ADMINISTRADOR") as any, resetAll as any);

router.get("/orders", getAllOrders as any);
router.post("/orders/manual", createManualOrder as any);
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

router.get("/neighborhoods", getNeighborhoods as any);
router.post("/neighborhoods", authorize("ADMINISTRADOR") as any, createNeighborhood as any);
router.put("/neighborhoods/:id", authorize("ADMINISTRADOR") as any, updateNeighborhood as any);
router.put("/neighborhoods/:id/toggle-active", authorize("ADMINISTRADOR") as any, toggleNeighborhoodActive as any);
router.delete("/neighborhoods/:id", authorize("ADMINISTRADOR") as any, deleteNeighborhood as any);

export default router;
