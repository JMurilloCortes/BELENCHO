import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const slides = await prisma.heroSlide.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });
    res.json(slides);
  } catch {
    res.status(500).json({ error: "Error al obtener slides" });
  }
});

export default router;
