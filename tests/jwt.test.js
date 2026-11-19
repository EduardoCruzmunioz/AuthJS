const { test, describe } = require("node:test");
const assert = require("node:assert");
const jwt = require("jsonwebtoken");
const { generarJWT, generateJWT } = require("../src/helpers/jwt");

process.env.SECRET_JWT_SEED = process.env.SECRET_JWT_SEED || "test_jwt_secret_seed_12345";

describe("Helper: JWT (generarJWT)", () => {
  test("debe generar un token JWT válido con payload correcto y expiración a 2 horas", async () => {
    const uid = "6543210abcdef12345678901";
    const name = "Eduardo Pruebas";

    const token = await generarJWT(uid, name);
    assert.ok(typeof token === "string" && token.length > 20);

    const decoded = jwt.verify(token, process.env.SECRET_JWT_SEED);
    assert.strictEqual(decoded.uid, uid);
    assert.strictEqual(decoded.name, name);
    assert.strictEqual(decoded.exp - decoded.iat, 7200); // 2 horas (7200 segundos)
  });

  test("el alias generateJWT debe ser una función y retornar un token", async () => {
    assert.strictEqual(typeof generateJWT, "function");
    const token = await generateJWT("999", "Alias User");
    assert.ok(token);
  });
});
