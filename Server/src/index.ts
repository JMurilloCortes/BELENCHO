import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import "./services/passport";
import { initSocket } from "./lib/socket";
import authRoutes from "./routes/auth.routes";
import cartRoutes from "./routes/cart.routes";
import favoriteRoutes from "./routes/favorite.routes";
import productRoutes from "./routes/product.routes";
import reviewRoutes from "./routes/review.routes";
import adminRoutes from "./routes/admin.routes";
import userRoutes from "./routes/user.routes";
import paymentRoutes from "./routes/payment.routes";
import neighborhoodRoutes from "./routes/neighborhood.routes";
import deliveryRoutes from "./routes/delivery.routes";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/products", productRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/neighborhoods", neighborhoodRoutes);
app.use("/api/delivery", deliveryRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

const httpServer = http.createServer(app);
initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
