import { defineConfig } from "prisma/config";

// En desarrollo local, Prisma CLI con config personalizada no carga .env automáticamente.
// Este bloque carga .env si DATABASE_URL no está ya en el entorno (Docker lo inyecta directamente).
if (!process.env["DATABASE_URL"]) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("dotenv").config();
  } catch {
    // dotenv no instalado (producción/Docker) — se usan las variables del contenedor
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
