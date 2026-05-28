import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@gruporemor.com.sv";
  const nombre = "Administrador";

  const existente = await prisma.adminUser.findUnique({ where: { email } });
  if (existente) {
    console.log(`Admin ya existe: ${email}`);
    return;
  }

  await prisma.adminUser.create({
    data: { nombre, email, rol: "ADMIN" },
  });

  console.log(`Admin creado: ${email}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
