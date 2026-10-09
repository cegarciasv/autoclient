import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerSesionFormulario } from "@/lib/auth-formulario";
import { cartasAutorizacionActivas } from "@/lib/branding";
import { validarCompletitud } from "@/lib/formulario-reglas";

type Ctx = { params: Promise<{ token: string }> };

export async function POST(_req: NextRequest, ctx: Ctx) {
  const { token } = await ctx.params;
  const sesion = await obtenerSesionFormulario(token);
  if (!sesion) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const [formulario, tercero] = await Promise.all([
    prisma.formulario.findUnique({
      where: { terceroId: sesion.terceroId },
      include: {
        documentos: true,
        infoGeneral: true,
        accionistas: true,
        referencias: true,
        encuestaProveedor: true,
      },
    }),
    prisma.tercero.findUnique({
      where: { id: sesion.terceroId },
      select: { tipoPersona: true, tipo: true },
    }),
  ]);
  if (!formulario) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const esNatural = tercero?.tipoPersona === "NATURAL";

  // El navegador valida cada paso, pero el servidor es quien garantiza que nada obligatorio quede vacío
  const problemas = validarCompletitud({
    tipo: tercero?.tipo === "PROVEEDOR" ? "PROVEEDOR" : "CLIENTE",
    tipoPersona: tercero?.tipoPersona ?? null,
    infoGeneral: formulario.infoGeneral as Record<string, unknown> | null,
    accionistas: formulario.accionistas as Record<string, unknown>[],
    referencias: formulario.referencias as Record<string, unknown>[],
    encuesta: formulario.encuestaProveedor as Record<string, unknown> | null,
  });
  if (problemas.length > 0) {
    return NextResponse.json(
      { error: `Faltan datos obligatorios del formulario. Regrese a los pasos anteriores para completarlos — ${problemas.join(" | ")}`, problemas },
      { status: 422 }
    );
  }

  const tiposBase = esNatural
    ? [
        "formulario_firmado",
        "dui_representante",
        "nit_representante",
        "comprobante_domicilio",
      ]
    : [
        "formulario_firmado",
        "dui_representante",
        "nit_representante",
        "credencial_administrador",
        "escritura_constitucion",
        "matricula_comercio",
        "comprobante_domicilio",
        "nit_nrc_empresa",
      ];

  const exigeCarta = tercero?.tipo === "PROVEEDOR" && (await cartasAutorizacionActivas());
  const tiposObligatorios = exigeCarta ? [...tiposBase, "carta_autorizacion_investigacion"] : tiposBase;

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
