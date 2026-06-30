import { Server as HTTPServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

let io: Server;

export function initSocket(httpServer: HTTPServer) {
  io = new Server(httpServer, {
    path: "/api/socket.io",
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error("Token requerido"));
    }
    try {
      const decoded = jwt.verify(token as string, JWT_SECRET) as { id: string; role: string };
      if (decoded.role !== "ADMINISTRADOR" && decoded.role !== "COLABORADOR") {
        return next(new Error("No autorizado"));
      }
      (socket as any).user = decoded;
      next();
    } catch {
      next(new Error("Token inválido"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Admin conectado: ${(socket as any).user.id}`);
    socket.join("admin");
    socket.on("disconnect", () => {
      console.log(`🔌 Admin desconectado: ${(socket as any).user.id}`);
    });
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket.io no inicializado");
  return io;
}

export function emitNewOrder(order: any) {
  if (!io) return;
  io.to("admin").emit("new-order", {
    id: order.id,
    customerName: order.customerName,
    total: Number(order.total),
    createdAt: order.createdAt,
  });
}
