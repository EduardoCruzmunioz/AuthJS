import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

export const validarCampos = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({
      ok: false,
      msg: errores.mapped(),
    });
  }
  next();
};

export default {
  validarCampos,
};

// Compatibilidad total con CommonJS require() y ESM import
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    validarCampos,
    default: { validarCampos },
  };
}
