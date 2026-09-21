import { prisma } from "@/lib/prisma";
import TablaTerceros from "@/components/admin/TablaTerceros";

export const dynamic = "force-dynamic";

export default async function ProveedoresPage() {
  const proveedores = await prisma.tercero.findMany({
    where: { tipo: "PROVEEDOR" },
    include: { formulario: { select: { progreso: true, pasoActual: true } } },
    orderBy: { creadoEn: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="eyebrow">Directorio / Proveedores</p>
        <h1 className="display-title text-[32px] text-slate-900">Proveedores</h1>
        <p className="text-sm text-slate-500">Consulta expedientes y sigue cada vinculación en un solo lugar.</p>
      </div>
      <TablaTerceros
        tipo="proveedores"
        terceros={proveedores.map((p: (typeof proveedores)[0]) => ({ ...p, creadoEn: p.creadoEn.toISOString() }))}
      />
    </div>
  );
}
