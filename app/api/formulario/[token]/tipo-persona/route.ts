import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerSesionFormulario } from "@/lib/auth-formulario";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const sesion = await obtenerSesionFormulario(token);
  if (!sesion) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();
  const { tipoPersona } = body;

  if (tipoPersona !== "NATURAL" && tipoPersona !== "JURIDICA") {
    return NextResponse.json({ error: "Tipo de persona inválido" }, { status: 400 });
  }

  await prisma.tercero.update({
    where: { id: sesion.terceroId },
    data: { tipoPersona },
  });

  return NextResponse.json({ ok: true, tipoPersona });
}
