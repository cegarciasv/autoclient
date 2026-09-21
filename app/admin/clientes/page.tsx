import { prisma } from "@/lib/prisma";
import TablaTerceros from "@/components/admin/TablaTerceros";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const clientes = await prisma.tercero.findMany({
    where: { tipo: "CLIENTE" },
    include: { formulario: { select: { progreso: true, pasoActual: true } } },
    orderBy: { creadoEn: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="eyebrow">Directorio / Clientes</p>
        <h1 className="display-title text-[32px] text-slate-900">Clientes</h1>
        <p className="text-sm text-slate-500">Consulta expedientes, revisa su avance y comparte el enlace de registro.</p>
      </div>
      <TablaTerceros
        tipo="clientes"
        terceros={clientes.map((c: (typeof clientes)[0]) => ({ ...c, creadoEn: c.creadoEn.toISOString() }))}
      />
    </div>
  );
}
