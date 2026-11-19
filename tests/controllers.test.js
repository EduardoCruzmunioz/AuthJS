const { test, describe } = require("node:test");
const assert = require("node:assert");
const bcrypt = require("bcryptjs");
const User = require("../src/models/User");
const {
  crearUsuario,
  loginUsuario,
  renovarUsuario,
} = require("../src/controllers/controller");

process.env.SECRET_JWT_SEED = process.env.SECRET_JWT_SEED || "test_jwt_seed_controller";

function createMockResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
}

describe("Controladores de Autenticación", () => {
  describe("crearUsuario", () => {
    test("debe retornar 400 si el email ya existe", async () => {
      const origFindOne = User.findOne;
      User.findOne = async () => ({ id: "1", name: "Existente", email: "exist@test.com" });

      try {
        const req = {
          body: {
            name: "Existente",
            email: "exist@test.com",
            password: "password123",
          },
        };
        const res = createMockResponse();

        await crearUsuario(req, res);

        assert.strictEqual(res.statusCode, 400);
        assert.strictEqual(res.body.ok, false);
        assert.strictEqual(res.body.msg, "El usuario ya existe con ese correo electrónico");
      } finally {
        User.findOne = origFindOne;
      }
    });

    test("debe hashear password con bcrypt, guardar en BD y retornar 201 con token", async () => {
      const origFindOne = User.findOne;
      const origSave = User.prototype.save;
      let saveCalled = false;

      User.findOne = async () => null;
      User.prototype.save = async function () {
        saveCalled = true;
        assert.ok(bcrypt.compareSync("miClaveSecreta", this.password));
        return this;
      };

      try {
        const req = {
          body: {
            name: "Usuario Nuevo",
            email: "nuevo@test.com",
            password: "miClaveSecreta",
          },
        };
        const res = createMockResponse();

        await crearUsuario(req, res);

        assert.strictEqual(res.statusCode, 201);
        assert.strictEqual(res.body.ok, true);
        assert.strictEqual(res.body.name, "Usuario Nuevo");
        assert.ok(res.body.uid);
        assert.ok(res.body.token);
        assert.strictEqual(saveCalled, true);
      } finally {
        User.findOne = origFindOne;
        User.prototype.save = origSave;
      }
    });
  });

  describe("loginUsuario", () => {
    test("debe retornar 400 si el usuario no existe", async () => {
      const origFindOne = User.findOne;
      User.findOne = async () => null;

      try {
        const req = {
          body: {
            email: "noexiste@test.com",
            password: "password123",
          },
        };
        const res = createMockResponse();

        await loginUsuario(req, res);

        assert.strictEqual(res.statusCode, 400);
        assert.strictEqual(res.body.ok, false);
        assert.strictEqual(res.body.msg, "El usuario no existe con ese correo");
      } finally {
        User.findOne = origFindOne;
      }
    });

    test("debe retornar 400 si la contraseña no coincide", async () => {
      const origFindOne = User.findOne;
      const hashedPassword = bcrypt.hashSync("passwordReal123", 10);
      User.findOne = async () => ({
        id: "usr-123",
        name: "Usuario Test",
        password: hashedPassword,
      });

      try {
        const req = {
          body: {
            email: "usuario@test.com",
            password: "passwordIncorrecta",
          },
        };
        const res = createMockResponse();

        await loginUsuario(req, res);

        assert.strictEqual(res.statusCode, 400);
        assert.strictEqual(res.body.ok, false);
        assert.strictEqual(res.body.msg, "Contraseña incorrecta");
      } finally {
        User.findOne = origFindOne;
      }
    });

    test("debe retornar 200 con JWT si las credenciales son válidas", async () => {
      const origFindOne = User.findOne;
      const hashedPassword = bcrypt.hashSync("passwordValida123", 10);
      User.findOne = async () => ({
        id: "usr-456",
        name: "Eduardo Cruz",
        password: hashedPassword,
      });

      try {
        const req = {
          body: {
            email: "edu@test.com",
            password: "passwordValida123",
          },
        };
        const res = createMockResponse();

        await loginUsuario(req, res);

        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.body.ok, true);
        assert.strictEqual(res.body.uid, "usr-456");
        assert.strictEqual(res.body.name, "Eduardo Cruz");
        assert.ok(res.body.token);
      } finally {
        User.findOne = origFindOne;
      }
    });
  });

  describe("renovarUsuario", () => {
    test("debe generar un nuevo JWT y retornar los datos del usuario autenticado", async () => {
      const origFindById = User.findById;
      User.findById = async (uid) => ({
        id: uid,
        name: "Eduardo Renovado",
        email: "edu@test.com",
      });

      try {
        const req = { uid: "uid-789", name: "Eduardo" };
        const res = createMockResponse();

        await renovarUsuario(req, res);

        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.body.ok, true);
        assert.strictEqual(res.body.uid, "uid-789");
        assert.strictEqual(res.body.name, "Eduardo Renovado");
        assert.strictEqual(res.body.email, "edu@test.com");
        assert.ok(res.body.token);
      } finally {
        User.findById = origFindById;
      }
    });
  });
});
