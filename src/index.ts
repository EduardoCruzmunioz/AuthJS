import { app } from "./app";
import { env } from "./config/env";
import { dbConnection } from "./database/config";

// Arrancar el servidor HTTP
const server = app.listen(env.port, () => {
  console.log(`🚀 Servidor ejecutándose en el puerto: ${env.port}`);

  // Conectar a la base de datos de manera resiliente
  dbConnection().catch((err) => {
    console.error("Error al iniciar la base de datos:", err);
  });
});

export { app, server };
export default app;
