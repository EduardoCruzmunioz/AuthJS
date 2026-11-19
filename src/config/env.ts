import dotenv from "dotenv";

dotenv.config();

export interface EnvironmentConfig {
  port: number;
  mongoUri: string;
  jwtSecret: string;
}

export const env: EnvironmentConfig = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB || "",
  jwtSecret: process.env.SECRET_JWT_SEED || "secret-jwt-seed-authjs-2026",
};

export default env;
