import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerAdminActual } from "@/lib/auth-admin";
import fs from "fs";

type Ctx = { params: Promise<{ id: string; docId: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  // Verificar sesión admin
  const admin = await obtenerAdminActual();
  if (!admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id, docId } = await ctx.params;

  // Buscar documento verificando que pertenece al tercero correcto
  const doc = await prisma.documento.findFirst({
    where: {
      id: docId,
      formulario: { terceroId: id },
    },
  });

  if (!doc) {
    return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 });
  }

  // Verificar que el archivo existe en el NAS
  if (!fs.existsSync(doc.rutaNAS)) {
    return NextResponse.json(
      { error: "Archivo no disponible en el servidor" },
      { status: 404 }
    );
  }

  // Leer y devolver el archivo
  const buffer = fs.readFileSync(doc.rutaNAS);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${encodeURIComponent(doc.nombreArchivo)}"`,
      "Content-Length": String(buffer.length),
      // Evitar caché para documentos sensibles
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Pragma": "no-cache",
    },
  });
}
