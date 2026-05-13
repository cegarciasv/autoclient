import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import bcrypt from "bcryptjs";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@gruporemor.com.sv";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "GrupoRemor2024!";
  const nombre = "Administrador";

  const existente = await prisma.adminUser.findUnique({ where: { email } });
  if (existente) {
    console.log(`Admin ya existe: ${email}`);
    return;
  }

  const hash = await bcrypt.hash(password, 12);
  await prisma.adminUser.create({
    data: { nombre, email, password: hash, rol: "ADMIN" },
  });

  console.log(`Admin creado: ${email}`);
  console.log(`Contraseña: ${password}`);
  console.log("⚠️  Cambie la contraseña inmediatamente después del primer inicio de sesión.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
