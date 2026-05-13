import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerSesionFormulario } from "@/lib/auth-formulario";

type Ctx = { params: Promise<{ token: string }> };

export async function POST(_req: NextRequest, ctx: Ctx) {
  const { token } = await ctx.params;
  const sesion = await obtenerSesionFormulario(token);
  if (!sesion) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const formulario = await prisma.formulario.findUnique({
    where: { terceroId: sesion.terceroId },
    include: { documentos: true },
  });
  if (!formulario) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const tiposObligatorios = [
    "formulario_firmado",
    "dui_representante",
    "nit_representante",
    "credencial_administrador",
    "escritura_constitucion",
    "matricula_comercio",
    "comprobante_domicilio",
    "nit_nrc_empresa",
  ];

  const tiposCargados = new Set(formulario.documentos.map((d: { tipo: string }) => d.tipo));
  const faltantes = tiposObligatorios.filter((t) => !tiposCargados.has(t));

  if (faltantes.length > 0) {
    return NextResponse.json(
      { error: "Faltan documentos obligatorios", faltantes },
      { status: 422 }
    );
  }

  await prisma.$transaction([
    prisma.formulario.update({
      where: { id: formulario.id },
      data: { estado: "COMPLETADO", progreso: 100 },
    }),
    prisma.tercero.update({
      where: { id: sesion.terceroId },
      data: { estado: "COMPLETADO" },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
