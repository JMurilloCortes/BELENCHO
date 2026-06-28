import { Router } from "express";
import passport from "passport";
import { register, login } from "../controllers/auth.controller";
import { generateToken } from "../services/auth.service";

const router = Router();

router.post("/register", register);
router.post("/login", login);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${process.env.CLIENT_URL}/login` }),
  (req: any, res) => {
    const token = generateToken(req.user.id, req.user.role);
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  }
);

export default router;
