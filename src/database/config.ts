import mongoose from "mongoose";
import env from "../config/env";

export const dbConnection = async (retries = 5, delay = 3000): Promise<boolean> => {
  let mongoUri = env.mongoUri || process.env.MONGODB;
  if (!mongoUri) {
    console.error("❌ ERROR: La variable de entorno MONGODB no está definida.");
    console.error("👉 En Render: Configura la variable de entorno 'MONGODB' en el Dashboard de tu servicio.");
    return false;
  }

  // Asegurar formato con opciones de reintento para clusters Atlas
  if (!mongoUri.includes("retryWrites") && mongoUri.startsWith("mongodb+srv://")) {
    mongoUri = mongoUri.includes("?")
      ? `${mongoUri}&retryWrites=true&w=majority`
      : `${mongoUri}/?retryWrites=true&w=majority`;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log("✅ BASE DE DATOS MONGO CONECTADA");
      return true;
    } catch (error: any) {
      console.error(`⚠️ Intento ${attempt}/${retries} de conexión a MongoDB falló:`, error.message);

      if (
        error.name === "MongooseServerSelectionError" ||
        error.name === "MongoServerSelectionError"
      ) {
        console.error("🔍 DIAGNÓSTICO RENDER/MONGO ATLAS: Posible bloqueo de IP.");
        console.error("👉 En MongoDB Atlas: Ve a 'Network Access' -> 'Add IP Address' -> Selecciona 'Allow Access from Anywhere' (0.0.0.0/0).");
      }

      if (attempt < retries) {
        console.log(`⏳ Reintentando conexión en ${delay / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  console.error("❌ No se pudo conectar a MongoDB tras agotar los reintentos inmediatos.");
  console.log("🔄 Activando reintento periódico en segundo plano cada 10 segundos...");

  // Reintento continuo en segundo plano para autoconectar en cuanto se habilite la IP en Atlas
  const backgroundTimer = setInterval(async () => {
    if (mongoose.connection.readyState === 1) {
      clearInterval(backgroundTimer);
      return;
    }
    try {
      await mongoose.connect(mongoUri!, { serverSelectionTimeoutMS: 5000 });
      console.log("✅ BASE DE DATOS MONGO CONECTADA (Reintento en segundo plano)");
      clearInterval(backgroundTimer);
    } catch {
      // Continúa reintentando silenciosamente
    }
  }, 10000);

  return false;
};

export default {
  dbConnection,
};

// Compatibilidad total con CommonJS require() y ESM import
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    dbConnection,
    default: { dbConnection },
  };
}
