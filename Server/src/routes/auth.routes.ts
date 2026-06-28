import { Router } from "express";
import passport from "passport";
import { register, login } from "../controllers/auth.controller";
import { findOrCreateGoogleUser } from "../services/auth.service";

const router = Router();

router.post("/register", register);
router.post("/login", login);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${process.env.CLIENT_URL}/login` }),
  async (req: any, res) => {
    try {
      const result = await findOrCreateGoogleUser({
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        avatar: req.user.avatar,
      });
      res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${result.token}`);
    } catch {
      res.redirect(`${process.env.CLIENT_URL}/login?error=google_error`);
    }
  }
);

export default router;
