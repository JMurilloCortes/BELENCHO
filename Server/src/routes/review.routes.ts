import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { createReview } from "../controllers/review.controller";

const router = Router();

router.post("/", authenticate as any, createReview as any);

export default router;
