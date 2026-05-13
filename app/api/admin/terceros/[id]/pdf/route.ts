import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerAdminActual } from "@/lib/auth-admin";
import { generarPDFFormulario } from "@/lib/pdf";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const admin = await obtenerAdminActual();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await ctx.params;

  const tercero = await prisma.tercero.findFirst({
    where: { id },
    include: {
      formulario: {
        include: {
          infoGeneral:         true,
          accionistas:         true,
          clientesPrincipales: true,
          infoFinanciera:      true,
          referencias:         true,
          encuestaProveedor:   true,
        },
      },
    },
  });

  if (!tercero) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  if (!tercero.formulario) return NextResponse.json({ error: "Sin formulario" }, { status: 404 });

  try {
    const f = tercero.formulario;
    const pdfBuffer = await generarPDFFormulario({
      tercero: {
        razonSocial:     tercero.razonSocial,
        tipoDocumento:   tercero.tipoDocumento,
        numeroDocumento: tercero.numeroDocumento,
        email:           tercero.email,
        tipo:            tercero.tipo,
      },
      infoGeneral:         f.infoGeneral         as Record<string, unknown> | null,
      accionistas:         f.accionistas          as Record<string, unknown>[],
      clientesPrincipales: f.clientesPrincipales  as Record<string, unknown>[],
      infoFinanciera:      f.infoFinanciera        as Record<string, unknown> | null,
      referencias:         f.referencias           as Record<string, unknown>[],
      encuestaProveedor:   f.encuestaProveedor     as Record<string, unknown> | null,
    });

    const filename = `formulario_${tercero.razonSocial
      .toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 40)}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type":        "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length":      String(pdfBuffer.length),
      },
    });
  } catch (err) {
    console.error("Error generando PDF (admin):", err);
    return NextResponse.json({ error: "Error al generar el PDF" }, { status: 500 });
  }
}
