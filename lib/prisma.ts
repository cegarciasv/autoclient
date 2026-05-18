import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

// Lazy singleton: el adapter no debe instanciarse al cargar el módulo, porque
// durante `next build` (Collecting page data) los route handlers se importan
// sin DATABASE_URL en el entorno, y mariadb falla al inicializar sus opciones.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrisma(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL no está definida. Configúrala en el entorno antes de usar Prisma.",
    );
  }
  return new PrismaClient({ adapter: new PrismaMariaDb(url) });
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createPrisma();
    }
    return Reflect.get(globalForPrisma.prisma, prop, receiver);
  },
});
