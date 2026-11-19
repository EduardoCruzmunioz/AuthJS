const { test, describe, before, after } = require("node:test");
const assert = require("node:assert");
const express = require("express");
const path = require("path");
const cors = require("cors");
const User = require("../src/models/User");

process.env.SECRET_JWT_SEED = process.env.SECRET_JWT_SEED || "seed_super_secreta_integracion_jwt";

describe("Pruebas de Integración End-to-End (HTTP REST API)", () => {
  let server;
  let baseUrl;
  let userStore;

  before(async () => {
    userStore = new Map();

    // Emulación en memoria del modelo User para pruebas HTTP sin requerir red externa
    User.findOne = async ({ email }) => {
      return userStore.get(email) || null;
    };

    User.findById = async (uid) => {
      for (const u of userStore.values()) {
        if (u.id === uid) return u;
      }
      return null;
    };

    User.prototype.save = async function () {
      this._id = this._id || "usr-" + Math.random().toString(36).substring(2, 9);
      const stored = {
        id: this.id,
        _id: this._id,
        name: this.name,
        email: this.email,
        password: this.password,
      };
      userStore.set(this.email, stored);
      return this;
    };

    const app = express();
    app.use(express.static(path.join(__dirname, "../src/public")));
    app.use(cors());
    app.use(express.json());
    app.use("/api/auth", require("../src/routes/auth"));

    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(() => {
    if (server) {
      server.close();
    }
  });

  test("GET / debe servir la página pública index.html con código 200", async () => {
    const res = await fetch(`${baseUrl}/`);
    assert.strictEqual(res.status, 200);
    const html = await res.text();
    assert.ok(html.includes("Acceso Denegado"));
  });

  test("POST /api/auth/new debe fallar con 400 cuando el cuerpo está vacío", async () => {
    const res = await fetch(`${baseUrl}/api/auth/new`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.ok, false);
    assert.ok(data.msg.name);
    assert.ok(data.msg.email);
    assert.ok(data.msg.password);
  });

  let registeredToken = "";
  let registeredUid = "";

  test("POST /api/auth/new debe registrar un usuario válido con código 201 y retornar token JWT", async () => {
    const res = await fetch(`${baseUrl}/api/auth/new`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Eduardo Tester",
        email: "eduardo@test.com",
        password: "miPasswordSeguro123",
      }),
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.ok, true);
    assert.strictEqual(data.name, "Eduardo Tester");
    assert.ok(data.uid);
    assert.ok(data.token);

    registeredUid = data.uid;
    registeredToken = data.token;
  });

  test("POST /api/auth/new debe rechazar un usuario con email duplicado con código 400", async () => {
    const res = await fetch(`${baseUrl}/api/auth/new`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Otro Usuario",
        email: "eduardo@test.com",
        password: "otraPassword456",
      }),
    });

    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.ok, false);
    assert.strictEqual(data.msg, "El usuario ya existe con ese correo electrónico");
  });

  test("POST /api/auth/ debe rechazar login con contraseña incorrecta con código 400", async () => {
    const res = await fetch(`${baseUrl}/api/auth/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "eduardo@test.com",
        password: "passwordErronea",
      }),
    });

    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.ok, false);
    assert.strictEqual(data.msg, "Contraseña incorrecta");
  });

  test("POST /api/auth/ debe autenticar con credenciales correctas con código 200 y nuevo token", async () => {
    const res = await fetch(`${baseUrl}/api/auth/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "eduardo@test.com",
        password: "miPasswordSeguro123",
      }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.ok, true);
    assert.strictEqual(data.uid, registeredUid);
    assert.strictEqual(data.name, "Eduardo Tester");
    assert.ok(data.token);

    registeredToken = data.token;
  });

  test("GET /api/auth/renew debe responder 401 si no se envía el header x-token", async () => {
    const res = await fetch(`${baseUrl}/api/auth/renew`);
    assert.strictEqual(res.status, 401);
    const data = await res.json();
    assert.strictEqual(data.ok, false);
    assert.strictEqual(data.msg, "No hay token en la petición");
  });

  test("GET /api/auth/renew debe responder 401 si el header x-token es corrupto", async () => {
    const res = await fetch(`${baseUrl}/api/auth/renew`, {
      headers: { "x-token": "un-token-falso" },
    });
    assert.strictEqual(res.status, 401);
    const data = await res.json();
    assert.strictEqual(data.ok, false);
    assert.strictEqual(data.msg, "Token no válido");
  });

  test("GET /api/auth/renew debe revalidar la sesión con x-token válido con código 200", async () => {
    const res = await fetch(`${baseUrl}/api/auth/renew`, {
      headers: { "x-token": registeredToken },
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.ok, true);
    assert.strictEqual(data.uid, registeredUid);
    assert.strictEqual(data.name, "Eduardo Tester");
    assert.ok(data.token);
  });
});
