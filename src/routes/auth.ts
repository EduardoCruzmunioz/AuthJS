import { Router } from "express";
import { check } from "express-validator";
import {
  crearUsuario,
  loginUsuario,
  renovarUsuario,
} from "../controllers/controller";
import { validarCampos } from "../middlewares/validarCampos";
import { validarJWT } from "../middlewares/validarjwt";

const router = Router();

// Registro de nuevo usuario
router.post(
  "/new",
  [
    check("name", "El nombre  es un campo obligatorio!").not().isEmpty(),
    check("email", "El email es un campo obligatorio!").isEmail(),
    check("password", "La contraseña es obligatoria!").isLength({ min: 5 }),
    validarCampos,
  ],
  crearUsuario
);

// Login de usuario
router.post(
  "/",
  [
    check("email", "El email es un campo obligatorio!").isEmail(),
    check("password", "La contraseña es obligatoria!").isLength({ min: 5 }),
    validarCampos,
  ],
  loginUsuario
);

// Validar y revalidar token JWT
router.get("/renew", validarJWT, renovarUsuario);

export { router };
export default router;

// Compatibilidad total con CommonJS require() y ESM import
if (typeof module !== "undefined" && module.exports) {
  module.exports = router;
  module.exports.default = router;
  module.exports.router = router;
}
