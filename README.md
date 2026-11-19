# AuthJS - API REST de Autenticación (TypeScript & Node.js)

API REST robusta de autenticación de usuarios construida con **Express 5**, **TypeScript**, **Mongoose (MongoDB Atlas)** y **JSON Web Tokens (JWT)**.

---

## 🚀 Despliegue en Render

El repositorio cuenta con soporte nativo para **Render Blueprints** mediante `render.yaml`.

### Variables de Entorno Requeridas en Render
| Variable | Descripción | Valor Ejemplo |
| :--- | :--- | :--- |
| `PORT` | Puerto de escucha HTTP | `10000` (Render lo inyecta por defecto) |
| `MONGODB` | URI de conexión a MongoDB Atlas | `mongodb+srv://<user>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority` |
| `SECRET_JWT_SEED` | Semilla secreta para la firma JWT | `TuSemillaSecretaSuperSegura` |

> [!IMPORTANT]
> **Acceso a Red en MongoDB Atlas para Render**:
> Render utiliza direcciones IP dinámicas salientes. Para evitar errores de conexión como `MongoServerSelectionError` o `buffering timed out`, asegúrate de habilitar acceso global en MongoDB Atlas:
> 1. Accede a **MongoDB Atlas** -> Menú **Security** -> **Network Access**.
> 2. Haz clic en **Add IP Address**.
> 3. Selecciona **Allow Access from Anywhere** (`0.0.0.0/0`) y confirma los cambios.

---

## 🛠️ Scripts del Proyecto

```bash
# Desarrollo con recarga en caliente
npm run dev

# Compilación TypeScript a JavaScript en dist/
npm run build

# Ejecución en producción
npm start

# Validación de tipos estáticos
npm run typecheck

# Suite completa de pruebas (23 tests)
npm test
```

---

## 📡 Endpoints de la API

### Salud y Diagnóstico
- `GET /health` -> Estado del servidor y conexión a base de datos.
- `GET /` -> Contenido estático web.

### Autenticación (`/api/auth`)
- `POST /api/auth/new` -> Registro de nuevo usuario (`name`, `email`, `password`). Retorna `201` con JWT.
- `POST /api/auth/` -> Login con credenciales (`email`, `password`). Retorna `200` con JWT.
- `GET /api/auth/renew` -> Revalidación y rotación de JWT (requiere header `x-token`).
