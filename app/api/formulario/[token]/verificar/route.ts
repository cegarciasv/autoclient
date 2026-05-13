import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generarOTP, otpExpiraEn } from "@/lib/otp";
import { enviarOTP } from "@/lib/email";
import { z } from "zod";

const schema = z.object({ numeroDocumento: z.string().min(5) });

type Ctx = { params: Promise<{ token: string }> };

export async function POST(request: NextRequest, ctx: Ctx) {
  const { token } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Número de documento inválido" }, { status: 400 });
  }

  const tercero = await prisma.tercero.findUnique({ where: { token } });

  if (!tercero) {
    return NextResponse.json({ error: "Enlace inválido o expirado" }, { status: 404 });
  }

  if (tercero.tokenExpira < new Date()) {
    return NextResponse.json({ error: "El enlace ha expirado. Solicite uno nuevo." }, { status: 410 });
  }

  const docNormalizado = parsed.data.numeroDocumento.replace(/[\s\-\.]/g, "").toUpperCase();
  const docTercero = tercero.numeroDocumento.replace(/[\s\-\.]/g, "").toUpperCase();

  if (docNormalizado !== docTercero) {
    return NextResponse.json({ error: "Número de documento no coincide" }, { status: 401 });
  }

  // Rate limiting: max 3 OTPs en últimos 15 min
  const quince = new Date(Date.now() - 15 * 60 * 1000);
  const recientes = await prisma.otpToken.count({
    where: { terceroId: tercero.id, creadoEn: { gte: quince } },
  });
  if (recientes >= 3) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espere 15 minutos antes de solicitar otro código." },
      { status: 429 }
    );
  }

  const codigo = generarOTP();
  const expira = otpExpiraEn(15);

  await prisma.otpToken.create({
    data: { terceroId: tercero.id, codigo, expira },
  });

  await enviarOTP(tercero.email, tercero.razonSocial, codigo);

  const emailOculto = tercero.email.replace(/(.{2})(.*)(@.*)/, "$1***$3");
  return NextResponse.json({ ok: true, email: emailOculto });
}
