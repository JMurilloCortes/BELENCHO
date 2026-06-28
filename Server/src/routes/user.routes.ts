import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { getProfile, updateProfile, changePassword } from "../controllers/user.controller";

const router = Router();

router.use(authenticate as any);

router.get("/profile", getProfile as any);
router.put("/profile", updateProfile as any);
router.put("/password", changePassword as any);

export default router;
