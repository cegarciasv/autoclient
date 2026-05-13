import { prisma } from "@/lib/prisma";
import TablaTerceros from "@/components/admin/TablaTerceros";

export default async function ProveedoresPage() {
  const proveedores = await prisma.tercero.findMany({
    where: { tipo: "PROVEEDOR" },
    include: { formulario: { select: { progreso: true, pasoActual: true } } },
    orderBy: { creadoEn: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Proveedores</h1>
        <p className="text-sm text-gray-500 mt-1">Gestión de expedientes de proveedores</p>
      </div>
      <TablaTerceros
        tipo="proveedores"
        terceros={proveedores.map((p: (typeof proveedores)[0]) => ({ ...p, creadoEn: p.creadoEn.toISOString() }))}
      />
    </div>
  );
}
