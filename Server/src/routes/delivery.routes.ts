import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

const MAX_SLOT_CAPACITY = 5;
const TIME_SLOTS = [
  "7-8", "8-9", "9-10", "10-11", "11-12",
  "12-13", "13-14", "14-15", "15-16", "16-17", "17-18",
];

router.get("/slots", async (req, res) => {
  try {
    const { date } = req.query;
    if (!date || typeof date !== "string") {
      return res.status(400).json({ error: "Fecha requerida (YYYY-MM-DD)" });
    }

    const orders = await prisma.order.findMany({
      where: {
        deliveryDate: date,
        status: { notIn: ["CANCELLED", "REFUNDED"] },
        deliveryTimeSlot: { not: null },
      },
      select: { deliveryTimeSlot: true },
    });

    const slotCounts: Record<string, number> = {};
    for (const o of orders) {
      const slot = o.deliveryTimeSlot!;
      slotCounts[slot] = (slotCounts[slot] || 0) + 1;
    }

    const slots = TIME_SLOTS.map((slot) => ({
      slot,
      capacity: MAX_SLOT_CAPACITY,
      booked: slotCounts[slot] || 0,
      available: MAX_SLOT_CAPACITY - (slotCounts[slot] || 0),
    }));

    res.json(slots);
  } catch {
    res.status(500).json({ error: "Error al obtener horarios" });
  }
});

export default router;
