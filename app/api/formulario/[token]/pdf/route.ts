import { NextRequest, NextResponse } from "next/server";
import { obtenerSesionFormulario } from "@/lib/auth-formulario";
import { prisma } from "@/lib/prisma";
import { generarPDFFormulario } from "@/lib/pdf";

type Ctx = { params: Promise<{ token: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { token } = await ctx.params;
  const sesion = await obtenerSesionFormulario(token);
  if (!sesion) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const formulario = await prisma.formulario.findUnique({
    where: { terceroId: sesion.terceroId },
    include: {
      infoGeneral: true,
      accionistas: true,
      clientesPrincipales: true,
      infoFinanciera: true,
      referencias: true,
      encuestaProveedor: true,
      tercero: {
        select: { razonSocial: true, tipo: true, tipoDocumento: true, numeroDocumento: true, email: true },
      },
    },
  });

  if (!formulario) return NextResponse.json({ error: "Formulario no encontrado" }, { status: 404 });

  try {
    const pdfBuffer = await generarPDFFormulario({
      tercero: {
        razonSocial: formulario.tercero.razonSocial,
        tipoDocumento: formulario.tercero.tipoDocumento,
        numeroDocumento: formulario.tercero.numeroDocumento,
        email: formulario.tercero.email,
        tipo: formulario.tercero.tipo,
      },
      infoGeneral: formulario.infoGeneral as Record<string, unknown> | null,
      accionistas: formulario.accionistas as Record<string, unknown>[],
      clientesPrincipales: formulario.clientesPrincipales as Record<string, unknown>[],
      infoFinanciera: formulario.infoFinanciera as Record<string, unknown> | null,
      referencias: formulario.referencias as Record<string, unknown>[],
      encuestaProveedor: formulario.encuestaProveedor as Record<string, unknown> | null,
    });

    const razonSocialSanitizada = formulario.tercero.razonSocial
      .toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 40);
    const filename = `formulario_${razonSocialSanitizada}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(pdfBuffer.length),
      },
    });
  } catch (e) {
    console.error("Error generando PDF:", e);
    return NextResponse.json({ error: "Error al generar el PDF" }, { status: 500 });
  }
}
