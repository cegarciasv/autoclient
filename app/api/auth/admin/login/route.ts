import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { crearSesionAdmin, nombreCookieAdmin } from "@/lib/auth-admin";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { email, password } = parsed.data;

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin || !admin.activo) {
    return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
  }

  const valido = await bcrypt.compare(password, admin.password);
  if (!valido) {
    return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
  }

  const token = await crearSesionAdmin({ id: admin.id, email: admin.email, rol: admin.rol });

  const response = NextResponse.json({ ok: true, nombre: admin.nombre, rol: admin.rol });
  response.cookies.set(nombreCookieAdmin(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 horas
    path: "/",
  });
  return response;
}
