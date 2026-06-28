import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { getFavorites, addFavorite, removeFavorite } from "../controllers/favorite.controller";

const router = Router();

router.get("/", authenticate as any, getFavorites as any);
router.post("/", authenticate as any, addFavorite as any);
router.delete("/:productId", authenticate as any, removeFavorite as any);

export default router;
