import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerAdminActual } from "@/lib/auth-admin";

export async function GET() {
  const admin = await obtenerAdminActual();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const [totalClientes, totalProveedores, pendientes, enProceso, completados] =
    await Promise.all([
      prisma.tercero.count({ where: { tipo: "CLIENTE" } }),
      prisma.tercero.count({ where: { tipo: "PROVEEDOR" } }),
      prisma.tercero.count({ where: { estado: "PENDIENTE" } }),
      prisma.tercero.count({ where: { estado: "EN_PROCESO" } }),
      prisma.tercero.count({ where: { estado: "COMPLETADO" } }),
    ]);

  return NextResponse.json({
    totalClientes,
    totalProveedores,
    pendientes,
    enProceso,
    completados,
  });
}
