import { Request, Response } from "express";
import { registerUser, loginUser } from "../services/auth.service";

export async function register(req: Request, res: Response) {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, contraseña y nombre son requeridos" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }
    const result = await registerUser(email, password, name);
    res.status(201).json(result);
  } catch (error: any) {
    const status = error.message === "El correo ya está registrado" ? 409 : 500;
    res.status(status).json({ error: error.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña son requeridos" });
    }
    const result = await loginUser(email, password);
    res.json(result);
  } catch (error: any) {
    const status = error.message === "Credenciales inválidas" ? 401 : 500;
    res.status(status).json({ error: error.message });
  }
}
