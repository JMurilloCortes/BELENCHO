import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const neighborhoods = await prisma.neighborhood.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    });
    res.json(neighborhoods);
  } catch {
    res.status(500).json({ error: "Error al obtener barrios" });
  }
});

export default router;
