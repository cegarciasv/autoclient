import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerAdminActual } from "@/lib/auth-admin";
import { enviarLinkFormulario } from "@/lib/email";
import { generarTokenUnico, tokenExpiraEn } from "@/lib/token";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, ctx: Ctx) {
  try {
    const admin = await obtenerAdminActual();
    if (!admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await ctx.params;
    console.log(`[enviar-link] admin=${admin.email} id=${id}`);

    // findFirst es más robusto que findUnique con el adapter MariaDB
    const tercero = await prisma.tercero.findFirst({ where: { id } });
    if (!tercero) {
      console.error(`[enviar-link] Tercero no encontrado: ${id}`);
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    const token = generarTokenUnico();
    const tokenExpira = tokenExpiraEn(30);

    await prisma.tercero.update({
      where: { id },
      data: { token, tokenExpira },
    });

    await enviarLinkFormulario(tercero.email, tercero.razonSocial, token, tercero.tipo);

    console.log(`[enviar-link] Link enviado a ${tercero.email}`);
    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("[enviar-link] Error inesperado:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
