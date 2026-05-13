import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { crearSesionFormulario, nombreCookieFormulario } from "@/lib/auth-formulario";
import { z } from "zod";

const schema = z.object({ codigo: z.string().length(6) });

type Ctx = { params: Promise<{ token: string }> };

export async function POST(request: NextRequest, ctx: Ctx) {
  const { token } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Código inválido" }, { status: 400 });
  }

  const tercero = await prisma.tercero.findUnique({ where: { token } });
  if (!tercero) return NextResponse.json({ error: "Enlace inválido" }, { status: 404 });

  const otp = await prisma.otpToken.findFirst({
    where: {
      terceroId: tercero.id,
      codigo: parsed.data.codigo,
      usado: false,
      expira: { gte: new Date() },
    },
    orderBy: { creadoEn: "desc" },
  });

  if (!otp) {
    return NextResponse.json({ error: "Código incorrecto o expirado" }, { status: 401 });
  }

  await prisma.otpToken.update({ where: { id: otp.id }, data: { usado: true } });

  let formulario = await prisma.formulario.findUnique({
    where: { terceroId: tercero.id },
  });
  if (!formulario) {
    formulario = await prisma.formulario.create({
      data: { terceroId: tercero.id },
    });
    await prisma.tercero.update({
      where: { id: tercero.id },
      data: { estado: "EN_PROCESO" },
    });
  }

  const jwt = await crearSesionFormulario({
    terceroId: tercero.id,
    token,
    tipo: tercero.tipo,
  });

  const response = NextResponse.json({
    ok: true,
    pasoActual: formulario.pasoActual,
    tipo: tercero.tipo,
  });
  response.cookies.set(nombreCookieFormulario(token), jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 2,
    path: "/",
  });
  return response;
}
