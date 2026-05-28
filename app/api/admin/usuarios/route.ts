import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerAdminActual } from "@/lib/auth-admin";
import { enviarAccesoSistema } from "@/lib/email";
import { z } from "zod";

const schemaCrear = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Correo electrónico inválido"),
  rol: z.enum(["ADMIN", "EJECUTIVO"], { message: "Rol inválido" }),
});

export async function GET() {
  const session = await obtenerAdminActual();
  if (!session || session.rol !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const usuarios = await prisma.adminUser.findMany({
    orderBy: { creadoEn: "desc" },
    select: {
      id: true,
      nombre: true,
      email: true,
      rol: true,
      activo: true,
      creadoEn: true,
      microsoftId: true,
    },
  });

  return NextResponse.json(usuarios);
}

export async function POST(request: NextRequest) {
  const session = await obtenerAdminActual();
  if (!session || session.rol !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schemaCrear.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { nombre, email, rol } = parsed.data;

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Ya existe un usuario con este correo" },
      { status: 400 }
    );
  }

  const usuario = await prisma.adminUser.create({
    data: { nombre, email, rol },
  });

  try {
    await enviarAccesoSistema(email, nombre, rol);
  } catch (e) {
    console.error("Error enviando email de acceso:", e);
  }

  return NextResponse.json(usuario, { status: 201 });
}
