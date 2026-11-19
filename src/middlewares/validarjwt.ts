import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { TokenPayload } from "../types/auth.types";

export const validarJWT = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const token = req.header("x-token");

  if (!token) {
    return res.status(401).json({
      ok: false,
      msg: "No hay token en la petición",
    });
  }

  try {
    const secret = process.env.SECRET_JWT_SEED || "secret-jwt-seed-authjs-2026";
    const payload = jwt.verify(token, secret) as TokenPayload;
    req.uid = payload.uid;
    req.name = payload.name;
  } catch {
    return res.status(401).json({
      ok: false,
      msg: "Token no válido",
    });
  }

  next();
};

export default {
  validarJWT,
};

// Compatibilidad total con CommonJS require() y ESM import
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    validarJWT,
    default: { validarJWT },
  };
}
