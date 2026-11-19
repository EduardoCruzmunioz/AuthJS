import fs from "fs";
import path from "path";
import express, { Express, Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/auth";

const app: Express = express();

// Directorio público resiliente (desarrollo con tsx y producción transpilada en dist)
const publicPath = fs.existsSync(path.join(__dirname, "public"))
  ? path.join(__dirname, "public")
  : path.join(__dirname, "../src/public");

app.use(express.static(publicPath));

// Middlewares globales
app.use(cors());
app.use(express.json());

// Endpoint de salud para Render / monitoreo (Liveness probe)
app.get("/health", (_req: Request, res: Response) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStates = ["disconnected", "connected", "connecting", "disconnecting"];
  const isDbConnected = dbStatus === 1;

  res.status(200).json({
    status: isDbConnected ? "healthy" : "degraded",
    uptime: Math.floor(process.uptime()),
    database: dbStates[dbStatus] || "unknown",
    timestamp: new Date().toISOString(),
  });
});

// Rutas de la API
app.use("/api/auth", authRoutes);

export { app };
export default app;

// Compatibilidad total con CommonJS require() y ESM import
if (typeof module !== "undefined" && module.exports) {
  module.exports = app;
  module.exports.app = app;
  module.exports.default = app;
}
