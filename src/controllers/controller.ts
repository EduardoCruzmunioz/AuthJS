import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User, { IUserDocument } from "../models/User";
import { generarJWT } from "../helpers/jwt";
import {
  RegisterUserDto,
  LoginUserDto,
  AuthSuccessResponse,
  AuthErrorResponse,
} from "../types/auth.types";

/**
 * Registro de un nuevo usuario
 */
export const crearUsuario = async (
  req: Request<Record<string, unknown>, unknown, RegisterUserDto>,
  res: Response<AuthSuccessResponse | AuthErrorResponse>
): Promise<Response> => {
  const { email, password } = req.body;

  try {
    // 1. Verificar si el usuario ya existe
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        ok: false,
        msg: "El usuario ya existe con ese correo electrónico",
      });
    }

    // 2. Instanciar el nuevo usuario
    const newUser = new User(req.body);

    // 3. Hashear la contraseña con bcrypt
    const salt = bcrypt.genSaltSync(10);
    newUser.password = bcrypt.hashSync(password.toString(), salt);

    // 4. Guardar en la base de datos
    await newUser.save();

    // 5. Generar el JWT para sesión inmediata
    const token = await generarJWT(newUser.id, newUser.name);

    return res.status(201).json({
      ok: true,
      uid: newUser.id,
      name: newUser.name,
      token,
    });
  } catch (error) {
    console.error("Error en crearUsuario:", error);
    return res.status(500).json({
      ok: false,
      msg: "Por favor hable con el administrador",
    });
  }
};

/**
 * Login de usuario existente
 */
export const loginUsuario = async (
  req: Request<Record<string, unknown>, unknown, LoginUserDto>,
  res: Response<AuthSuccessResponse | AuthErrorResponse>
): Promise<Response> => {
  const { email, password } = req.body;

  try {
    // 1. Verificar si el usuario existe por email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        ok: false,
        msg: "El usuario no existe con ese correo",
      });
    }

    // 2. Validar que la contraseña coincida con el hash
    const validPassword = bcrypt.compareSync(
      password.toString(),
      user.password
    );

    if (!validPassword) {
      return res.status(400).json({
        ok: false,
        msg: "Contraseña incorrecta",
      });
    }

    // 3. Generar el JWT para la sesión
    const token = await generarJWT(user.id, user.name);

    return res.status(200).json({
      ok: true,
      uid: user.id,
      name: user.name,
      token,
    });
  } catch (error) {
    console.error("Error en loginUsuario:", error);
    return res.status(500).json({
      ok: false,
      msg: "Por favor hable con el administrador",
    });
  }
};

/**
 * Revalidar token JWT
 */
export const renovarUsuario = async (
  req: Request,
  res: Response<AuthSuccessResponse | AuthErrorResponse>
): Promise<Response> => {
  const uid = req.uid!;
  const reqName = req.name || "";

  try {
    // Leer la base de datos
    const dbuser = (await User.findById(uid)) as IUserDocument | null;
    const name = dbuser ? dbuser.name : reqName;
    const email = dbuser ? dbuser.email : undefined;

    // Generar nuevo JWT
    const token = await generarJWT(uid, name);

    return res.json({
      ok: true,
      uid,
      name,
      email,
      token,
    });
  } catch (error) {
    console.error("Error en renovarUsuario:", error);
    return res.status(500).json({
      ok: false,
      msg: "Por favor hable con el administrador",
    });
  }
};

export default {
  crearUsuario,
  loginUsuario,
  renovarUsuario,
};

// Compatibilidad total con CommonJS require() y ESM import
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    crearUsuario,
    loginUsuario,
    renovarUsuario,
    default: {
      crearUsuario,
      loginUsuario,
      renovarUsuario,
    },
  };
}
