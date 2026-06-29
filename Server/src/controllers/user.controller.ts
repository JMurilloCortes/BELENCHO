import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

export async function getProfile(req: AuthRequest, res: Response) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true, email: true, name: true, role: true, avatar: true, createdAt: true,
        phone: true, defaultAddress: true, defaultNeighborhoodId: true,
        defaultNeighborhood: { select: { id: true, name: true } },
      },
    });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(user);
  } catch {
    res.status(500).json({ error: "Error al obtener perfil" });
  }
}

export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    const { name, email, avatar, phone, defaultAddress, defaultNeighborhoodId } = req.body;
    const data: any = {};
    if (name) data.name = name;
    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== req.user!.id) {
        return res.status(409).json({ error: "El email ya está en uso" });
      }
      data.email = email;
    }
    if (avatar !== undefined) data.avatar = avatar;
    if (phone !== undefined) data.phone = phone;
    if (defaultAddress !== undefined) data.defaultAddress = defaultAddress;
    if (defaultNeighborhoodId !== undefined) data.defaultNeighborhoodId = defaultNeighborhoodId;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data,
      select: {
        id: true, email: true, name: true, role: true, avatar: true,
        phone: true, defaultAddress: true, defaultNeighborhoodId: true,
        defaultNeighborhood: { select: { id: true, name: true } },
      },
    });
    res.json(user);
  } catch {
    res.status(500).json({ error: "Error al actualizar perfil" });
  }
}

export async function changePassword(req: AuthRequest, res: Response) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Contraseña actual y nueva son requeridas" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "La nueva contraseña debe tener al menos 6 caracteres" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user || !user.password) {
      return res.status(400).json({ error: "No se puede cambiar la contraseña de cuentas de Google" });
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(401).json({ error: "Contraseña actual incorrecta" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
    res.json({ message: "Contraseña actualizada" });
  } catch {
    res.status(500).json({ error: "Error al cambiar contraseña" });
  }
}
