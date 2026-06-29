import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

export function generateToken(userId: string, role: string) {
  return jwt.sign({ id: userId, role }, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export async function registerUser(email: string, password: string, name: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("El correo ya está registrado");
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, password: hashedPassword, name },
  });

  const token = generateToken(user.id, user.role);
  return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt } };
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) {
    throw new Error("Credenciales inválidas");
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new Error("Credenciales inválidas");
  }

  const token = generateToken(user.id, user.role);
  return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar, createdAt: user.createdAt } };
}

export async function findOrCreateGoogleUser(profile: { id: string; email: string; name: string; avatar?: string }) {
  let user = await prisma.user.findFirst({
    where: { OR: [{ googleId: profile.id }, { email: profile.email }] },
  });

  if (user) {
    if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: profile.id, avatar: profile.avatar || user.avatar },
      });
    }
  } else {
    user = await prisma.user.create({
      data: {
        email: profile.email,
        name: profile.name,
        googleId: profile.id,
        avatar: profile.avatar,
      },
    });
  }

  const token = generateToken(user.id, user.role);
  return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar, createdAt: user.createdAt } };
}
