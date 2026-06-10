import { PrismaClient } from "@prisma/client";

// Crear una instancia única de PrismaClient
let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  // En desarrollo, reutilizar la instancia para evitar múltiples conexiones
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ["query", "error", "warn"],
    });
  }
  prisma = global.prisma;
}

export default prisma;
