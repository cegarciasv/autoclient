import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerAdminActual } from "@/lib/auth-admin";

type Ctx = { params: Promise<{ id: string }> };

/**
 * POST /api/admin/terceros/[id]/completar
 * Permite al admin marcar manualmente un formulario como COMPLETADO (progreso=100).
 * Útil para casos de prueba o formularios que finalizaron sin el flujo normal.
 */
export async function POST(_req: NextRequest, ctx: Ctx) {
  const admin = await obtenerAdminActual();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await ctx.params;

  const tercero = await prisma.tercero.findFirst({
    where: { id },
    include: { formulario: true },
  });

  if (!tercero) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (!tercero.formulario) return NextResponse.json({ error: "Sin formulario" }, { status: 422 });

  await prisma.$transaction([
    prisma.formulario.update({
      where: { id: tercero.formulario.id },
      data: { estado: "COMPLETADO", progreso: 100 },
    }),
    prisma.tercero.update({
      where: { id },
      data: { estado: "COMPLETADO" },
    }),
  ]);

  return NextResponse.json({ ok: true });
}

/**
 * DELETE /api/admin/terceros/[id]/completar
 * Revierte el estado a EN_PROCESO (para correcciones).
 */
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const admin = await obtenerAdminActual();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await ctx.params;

  const tercero = await prisma.tercero.findFirst({
    where: { id },
    include: { formulario: true },
  });

  if (!tercero) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (!tercero.formulario) return NextResponse.json({ error: "Sin formulario" }, { status: 422 });

  await prisma.$transaction([
    prisma.formulario.update({
      where: { id: tercero.formulario.id },
      data: { estado: "EN_PROCESO" },
    }),
    prisma.tercero.update({
      where: { id },
      data: { estado: "EN_PROCESO" },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
