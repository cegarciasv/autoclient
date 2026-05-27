import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerAdminActual } from "@/lib/auth-admin";
import { enviarLinkFormulario } from "@/lib/email";
import { generarTokenUnico, tokenExpiraEn } from "@/lib/token";

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
          infoGeneral: true,
          accionistas: true,
          clientesPrincipales: true,
          infoFinanciera: true,
          referencias: true,
          encuestaProveedor: true,
          documentos: true,
        },
      },
    },
  });

  if (!tercero) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  return NextResponse.json(tercero);
}

/** POST /api/admin/terceros/[id]
 *  Reenvía el link de formulario al tercero (genera nuevo token).
 *  Reemplaza la ruta /[id]/enviar-link que Turbopack no reconoce. */
export async function POST(_req: NextRequest, ctx: Ctx) {
  try {
    const admin = await obtenerAdminActual();
    if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = await ctx.params;
    console.log(`[enviar-link] admin=${admin.email} id=${id}`);

    const tercero = await prisma.tercero.findFirst({ where: { id } });
    if (!tercero) {
      console.error(`[enviar-link] Tercero no encontrado: ${id}`);
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    const token = generarTokenUnico();
    const tokenExpira = tokenExpiraEn(5);

    await prisma.tercero.update({ where: { id }, data: { token, tokenExpira } });
    await enviarLinkFormulario(tercero.email, tercero.razonSocial, token, tercero.tipo);

    console.log(`[enviar-link] Link enviado a ${tercero.email}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[enviar-link] Error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
