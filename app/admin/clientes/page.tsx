import { prisma } from "@/lib/prisma";
import TablaTerceros from "@/components/admin/TablaTerceros";

export default async function ClientesPage() {
  const clientes = await prisma.tercero.findMany({
    where: { tipo: "CLIENTE" },
    include: { formulario: { select: { progreso: true, pasoActual: true } } },
    orderBy: { creadoEn: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <p className="text-sm text-gray-500 mt-1">Gestión de expedientes de clientes</p>
      </div>
      <TablaTerceros
        tipo="clientes"
        terceros={clientes.map((c: (typeof clientes)[0]) => ({ ...c, creadoEn: c.creadoEn.toISOString() }))}
      />
    </div>
  );
}
