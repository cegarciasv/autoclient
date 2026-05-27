import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerAdminActual } from "@/lib/auth-admin";
import { generarTokenUnico, tokenExpiraEn } from "@/lib/token";
import { enviarLinkFormulario } from "@/lib/email";
import { z } from "zod";

const schema = z.object({
  tipo: z.enum(["CLIENTE", "PROVEEDOR"]),
  razonSocial: z.string().min(2),
  tipoDocumento: z.enum(["NIT", "DUI", "PASAPORTE"]),
  numeroDocumento: z.string().min(5),
  email: z.string().email(),
});

export async function GET(request: NextRequest) {
  const admin = await obtenerAdminActual();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get("tipo");
  const estado = searchParams.get("estado");
  const busqueda = searchParams.get("q");

  const terceros = await prisma.tercero.findMany({
    where: {
      ...(tipo ? { tipo: tipo as "CLIENTE" | "PROVEEDOR" } : {}),
      ...(estado ? { estado: estado as "PENDIENTE" | "EN_PROCESO" | "COMPLETADO" } : {}),
      ...(busqueda
        ? {
            OR: [
              { razonSocial: { contains: busqueda } },
              { email: { contains: busqueda } },
              { numeroDocumento: { contains: busqueda } },
            ],
          }
        : {}),
    },
    include: { formulario: { select: { progreso: true, pasoActual: true } } },
    orderBy: { creadoEn: "desc" },
  });

  return NextResponse.json(terceros);
}

export async function POST(request: NextRequest) {
  const admin = await obtenerAdminActual();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", detalles: parsed.error.flatten() }, { status: 400 });
  }

  const { tipo, razonSocial, tipoDocumento, numeroDocumento, email } = parsed.data;

  // Verificar que no exista ya con ese documento
  const existente = await prisma.tercero.findFirst({
    where: { tipoDocumento, numeroDocumento },
  });
  if (existente) {
    return NextResponse.json(
      { error: "Ya existe un tercero con ese número de documento" },
      { status: 409 }
    );
  }

  const token = generarTokenUnico();
  const tokenExpira = tokenExpiraEn(5);

  const tercero = await prisma.tercero.create({
    data: {
      tipo,
      razonSocial,
      tipoDocumento,
      numeroDocumento,
      email,
      token,
      tokenExpira,
      creadoPor: admin.id,
    },
  });

  // Enviar email con el link
  try {
    await enviarLinkFormulario(email, razonSocial, token, tipo);
  } catch (err) {
    console.error("Error al enviar email:", err);
    // No falla el endpoint si el email falla
  }

  return NextResponse.json(tercero, { status: 201 });
}
