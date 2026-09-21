import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerAdminActual } from "@/lib/auth-admin";
import { enviarLinkFormulario } from "@/lib/email";
import { generarTokenUnico, tokenExpiraEn } from "@/lib/token";
import { z } from "zod";

type Ctx = { params: Promise<{ id: string }> };

const editarSchema = z.object({
  razonSocial: z.string().trim().min(2).max(191),
  tipoDocumento: z.enum(["NIT", "DUI", "PASAPORTE"]),
  numeroDocumento: z.string().trim().min(5).max(191),
  email: z.string().trim().email().max(191),
});

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

/** Devuelve el enlace vigente para compartirlo manualmente, sin enviar correo. */
export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const admin = await obtenerAdminActual();
    if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = await ctx.params;
    const tercero = await prisma.tercero.findFirst({ where: { id } });
    if (!tercero) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    let token = tercero.token;
    if (tercero.tokenExpira <= new Date()) {
      token = generarTokenUnico();
      await prisma.tercero.update({
        where: { id },
        data: { token, tokenExpira: tokenExpiraEn(5) },
      });
    }

    const origin = process.env.APP_URL || req.nextUrl.origin;
    const url = new URL(`/formulario/${token}`, origin).toString();
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[copiar-link] Error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

/** Actualiza únicamente los datos de registro; no altera las respuestas del formulario. */
export async function PUT(req: NextRequest, ctx: Ctx) {
  const admin = await obtenerAdminActual();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const parsed = editarSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Revisa los datos ingresados" }, { status: 400 });

  const { id } = await ctx.params;
  const actual = await prisma.tercero.findUnique({ where: { id }, select: { id: true } });
  if (!actual) return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });

  const duplicado = await prisma.tercero.findFirst({
    where: {
      tipoDocumento: parsed.data.tipoDocumento,
      numeroDocumento: parsed.data.numeroDocumento,
      id: { not: id },
    },
    select: { id: true },
  });
  if (duplicado) return NextResponse.json({ error: "Ya existe otro registro con ese documento" }, { status: 409 });

  try {
    const tercero = await prisma.tercero.update({
      where: { id },
      data: parsed.data,
      select: { id: true, tipo: true },
    });
    return NextResponse.json(tercero);
  } catch {
    return NextResponse.json({ error: "No se pudo actualizar el registro" }, { status: 500 });
  }
}

/** Solo se elimina un registro sin formulario; así no se pierden respuestas ni documentos. */
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const admin = await obtenerAdminActual();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (admin.rol !== "ADMIN") return NextResponse.json({ error: "Solo un administrador puede eliminar registros" }, { status: 403 });

  const { id } = await ctx.params;
  try {
    const resultado = await prisma.$transaction(async (tx) => {
      const tercero = await tx.tercero.findUnique({
        where: { id },
        select: { id: true, formulario: { select: { id: true } } },
      });
      if (!tercero) return "no-encontrado";
      if (tercero.formulario) return "con-formulario";
      await tx.otpToken.deleteMany({ where: { terceroId: id } });
      await tx.tercero.delete({ where: { id } });
      return "eliminado";
    });
    if (resultado === "no-encontrado") return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    if (resultado === "con-formulario") return NextResponse.json({ error: "Este expediente ya tiene un formulario y no se puede eliminar" }, { status: 409 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No se pudo eliminar el registro" }, { status: 409 });
  }
}
