const { test, describe } = require("node:test");
const assert = require("node:assert");
const User = require("../src/models/User");

describe("Modelo Mongoose: User", () => {
  test("debe requerir campos obligatorios: name, email y password", async () => {
    const emptyUser = new User({});
    let error = null;

    try {
      await emptyUser.validate();
    } catch (err) {
      error = err;
    }

    assert.ok(error, "La validación debía arrojar error");
    assert.ok(error.errors["name"], "El campo 'name' debe ser obligatorio");
    assert.ok(error.errors["email"], "El campo 'email' debe ser obligatorio");
    assert.ok(error.errors["password"], "El campo 'password' debe ser obligatorio");
  });

  test("debe validar correctamente cuando se proporcionan todos los campos y exponer getter 'id'", async () => {
    const validUser = new User({
      name: "Eduardo Cruz",
      email: "eduardo@empresa.com",
      password: "passwordEncriptadoHash123",
    });

    await validUser.validate();

    assert.strictEqual(validUser.name, "Eduardo Cruz");
    assert.strictEqual(validUser.email, "eduardo@empresa.com");
    assert.ok(validUser.id);
    assert.strictEqual(validUser.id, validUser._id.toString());
  });
});
