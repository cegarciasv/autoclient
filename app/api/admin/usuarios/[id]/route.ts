import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerAdminActual } from "@/lib/auth-admin";
import { z } from "zod";

const schemaActualizar = z.object({
  nombre: z.string().min(1, "El nombre es requerido").optional(),
  rol: z.enum(["ADMIN", "EJECUTIVO"], { message: "Rol inválido" }).optional(),
  activo: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const session = await obtenerAdminActual();
  if (!session || session.rol !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const usuario = await prisma.adminUser.findUnique({
    where: { id },
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

  if (!usuario) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  return NextResponse.json(usuario);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await obtenerAdminActual();
  if (!session || session.rol !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = schemaActualizar.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", detalles: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const existente = await prisma.adminUser.findUnique({ where: { id } });
  if (!existente) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  const usuario = await prisma.adminUser.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(usuario);
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const session = await obtenerAdminActual();
  if (!session || session.rol !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  if (id === session.id) {
    return NextResponse.json(
      { error: "No puedes eliminarte a ti mismo" },
      { status: 400 }
    );
  }

  const existente = await prisma.adminUser.findUnique({ where: { id } });
  if (!existente) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  await prisma.adminUser.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
