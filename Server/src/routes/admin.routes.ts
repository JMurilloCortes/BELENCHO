import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import {
  getUsers, updateUserRole,
  createProduct, updateProduct, deleteProduct,
  getCategories, createCategory,
} from "../controllers/admin.controller";

const router = Router();

router.use(authenticate as any);
router.use(authorize("ADMIN", "COLLABORATOR") as any);

router.get("/users", authorize("ADMIN") as any, getUsers as any);
router.put("/users/:id/role", authorize("ADMIN") as any, updateUserRole as any);

router.post("/products", createProduct as any);
router.put("/products/:id", updateProduct as any);
router.delete("/products/:id", deleteProduct as any);

router.get("/categories", getCategories as any);
router.post("/categories", createCategory as any);

export default router;
