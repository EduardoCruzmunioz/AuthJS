const { test, describe } = require("node:test");
const assert = require("node:assert");
const jwt = require("jsonwebtoken");
const { validarCampos } = require("../src/middlewares/validarCampos");
const { validarJWT } = require("../src/middlewares/validarjwt");

process.env.SECRET_JWT_SEED = process.env.SECRET_JWT_SEED || "test_jwt_secret_seed_12345";

describe("Middlewares de Autenticación", () => {
  describe("validarCampos", () => {
    test("debe invocar next() si no existen errores de validación", () => {
      let nextCalled = false;
      const req = {};
      const res = {};
      validarCampos(req, res, () => {
        nextCalled = true;
      });
      assert.strictEqual(nextCalled, true);
    });
  });

  describe("validarJWT", () => {
    test("debe responder 401 si no se envía la cabecera x-token", () => {
      const req = { header: () => null };
      let statusSet = null;
      let jsonSent = null;
      const res = {
        status(code) {
          statusSet = code;
          return this;
        },
        json(data) {
          jsonSent = data;
          return this;
        },
      };
      let nextCalled = false;
      validarJWT(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(statusSet, 401);
      assert.strictEqual(jsonSent.ok, false);
      assert.strictEqual(jsonSent.msg, "No hay token en la petición");
      assert.strictEqual(nextCalled, false);
    });

    test("debe responder 401 si el token es inválido o está firmado incorrectamente", () => {
      const req = { header: (h) => (h === "x-token" ? "token-falso-invalido" : null) };
      let statusSet = null;
      let jsonSent = null;
      const res = {
        status(code) {
          statusSet = code;
          return this;
        },
        json(data) {
          jsonSent = data;
          return this;
        },
      };
      let nextCalled = false;
      validarJWT(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(statusSet, 401);
      assert.strictEqual(jsonSent.ok, false);
      assert.strictEqual(jsonSent.msg, "Token no válido");
      assert.strictEqual(nextCalled, false);
    });

    test("debe extraer uid y name del payload y llamar a next() con token válido", () => {
      const token = jwt.sign(
        { uid: "usr-777", name: "Maria Garcia" },
        process.env.SECRET_JWT_SEED
      );
      const req = { header: (h) => (h === "x-token" ? token : null) };
      const res = {};
      let nextCalled = false;

      validarJWT(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, true);
      assert.strictEqual(req.uid, "usr-777");
      assert.strictEqual(req.name, "Maria Garcia");
    });
  });
});
