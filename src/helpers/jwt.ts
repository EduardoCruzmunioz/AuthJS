import jwt from "jsonwebtoken";

/**
 * Genera un JSON Web Token firmado con el uid y name del usuario
 * @param uid - ID único del usuario
 * @param name - Nombre del usuario
 * @returns Promise<string> Token JWT firmado
 */
export const generarJWT = (uid: string, name: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const payload = { uid, name };
    const secret = process.env.SECRET_JWT_SEED || "secret-jwt-seed-authjs-2026";

    jwt.sign(
      payload,
      secret,
      {
        expiresIn: "2h",
      },
      (err, token) => {
        if (err || !token) {
          console.error("Error al generar el JWT:", err);
          reject("No se pudo generar el token");
        } else {
          resolve(token);
        }
      }
    );
  });
};

export const generateJWT = generarJWT;

export default {
  generarJWT,
  generateJWT,
};

// Compatibilidad total con CommonJS require() y ESM import
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    generarJWT,
    generateJWT,
    default: { generarJWT, generateJWT },
  };
}
