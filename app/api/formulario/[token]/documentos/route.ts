import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerSesionFormulario } from "@/lib/auth-formulario";
import { obtenerRutaExpediente, guardarArchivo } from "@/lib/storage";

const MAX_SIZE = 100 * 1024 * 1024;

type Ctx = { params: Promise<{ token: string }> };

export async function POST(request: NextRequest, ctx: Ctx) {
  const { token } = await ctx.params;
  const sesion = await obtenerSesionFormulario(token);
  if (!sesion) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const tercero = await prisma.tercero.findUnique({ where: { id: sesion.terceroId } });
  if (!tercero) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const formulario = await prisma.formulario.findUnique({ where: { terceroId: sesion.terceroId } });
  if (!formulario) return NextResponse.json({ error: "Formulario no encontrado" }, { status: 404 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Error al procesar el archivo" }, { status: 400 });
  }

  const archivo = formData.get("file") as File | null;
  const tipo = formData.get("tipo") as string | null;

  if (!archivo || !tipo) {
    return NextResponse.json({ error: "Archivo y tipo son requeridos" }, { status: 400 });
  }

  if (archivo.type !== "application/pdf") {
    return NextResponse.json({ error: "Solo se aceptan archivos PDF" }, { status: 400 });
  }

  if (archivo.size > MAX_SIZE) {
    return NextResponse.json({ error: "El archivo excede los 100MB" }, { status: 400 });
  }

  const buffer = Buffer.from(await archivo.arrayBuffer());
  const carpetaTipo = tercero.tipo === "CLIENTE" ? "clientes" : "proveedores";
  const rutaDir = obtenerRutaExpediente(tercero.id, tercero.razonSocial, carpetaTipo);

  let rutaNAS: string;
  try {
    rutaNAS = await guardarArchivo(rutaDir, `${tipo}_${archivo.name}`, buffer);
  } catch (err) {
    console.error("Error guardando en NAS:", err);
    return NextResponse.json({ error: "Error al guardar el archivo" }, { status: 500 });
  }

  const existente = await prisma.documento.findFirst({
    where: { formularioId: formulario.id, tipo },
  });
  if (existente) {
    await prisma.documento.delete({ where: { id: existente.id } });
  }

  const documento = await prisma.documento.create({
    data: {
      formularioId: formulario.id,
      tipo,
      nombreArchivo: archivo.name,
      rutaNAS,
      tamanoBytes: archivo.size,
    },
  });

  return NextResponse.json({
    id: documento.id,
    tipo: documento.tipo,
    nombreArchivo: documento.nombreArchivo,
    tamanoBytes: documento.tamanoBytes,
  }, { status: 201 });
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { token } = await ctx.params;
  const sesion = await obtenerSesionFormulario(token);
  if (!sesion) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const formulario = await prisma.formulario.findUnique({
    where: { terceroId: sesion.terceroId },
    select: { id: true },
  });
  if (!formulario) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const documentos = await prisma.documento.findMany({
    where: { formularioId: formulario.id },
    select: { id: true, tipo: true, nombreArchivo: true, tamanoBytes: true, creadoEn: true },
  });

  return NextResponse.json(documentos);
}
