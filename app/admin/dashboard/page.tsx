import { TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import DashboardAnimado from "@/components/admin/DashboardAnimado";

export const dynamic = "force-dynamic";

function getFechaEspanol(): string {
  return new Date().toLocaleDateString("es-SV", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function DashboardPage() {
  const [totalClientes, totalProveedores, pendientes, enProceso, completados, recientes] =
    await Promise.all([
      prisma.tercero.count({ where: { tipo: "CLIENTE" } }),
      prisma.tercero.count({ where: { tipo: "PROVEEDOR" } }),
      prisma.tercero.count({ where: { estado: "PENDIENTE" } }),
      prisma.tercero.count({ where: { estado: "EN_PROCESO" } }),
      prisma.tercero.count({ where: { estado: "COMPLETADO" } }),
      prisma.tercero.findMany({
        orderBy: { creadoEn: "desc" },
        take: 5,
        select: {
          id: true,
          razonSocial: true,
          tipo: true,
          estado: true,
          creadoEn: true,
        },
      }),
    ]);

  const totalEstados = pendientes + enProceso + completados || 1;
  const pctPendientes = Math.round((pendientes / totalEstados) * 100);
  const pctEnProceso = Math.round((enProceso / totalEstados) * 100);
  const pctCompletados = Math.round((completados / totalEstados) * 100);

  const kpiCards = [
    {
      label: "Total Clientes",
      value: totalClientes,
      icon: "Users",
      iconBg: "bg-gradient-to-br from-[#2B5BE2] to-[#1E3A8A]",
      border: "border-[#2B5BE2]/20",
    },
    {
      label: "Total Proveedores",
      value: totalProveedores,
      icon: "Truck",
      iconBg: "bg-gradient-to-br from-[#18A8F0] to-[#1890F0]",
      border: "border-[#18A8F0]/20",
    },
    {
      label: "Pendientes",
      value: pendientes,
      icon: "Clock",
      iconBg: "bg-gradient-to-br from-amber-400 to-amber-600",
      border: "border-amber-100",
    },
    {
      label: "En proceso",
      value: enProceso,
      icon: "Loader2",
      iconBg: "bg-gradient-to-br from-orange-400 to-orange-600",
      border: "border-orange-100",
    },
    {
      label: "Completados",
      value: completados,
      icon: "CheckCircle2",
      iconBg: "bg-gradient-to-br from-blue-400 to-blue-600",
      border: "border-blue-100",
    },
  ];

  const fecha = getFechaEspanol();
  // Capitalizar primera letra
  const fechaCapital = fecha.charAt(0).toUpperCase() + fecha.slice(1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Bienvenido al Panel de Control
        </h1>
        <p className="text-sm text-slate-500 flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-slate-400" />
          {fechaCapital}
        </p>
      </div>

      <DashboardAnimado
        kpiCards={kpiCards}
        pendientes={pendientes}
        enProceso={enProceso}
        completados={completados}
        pctPendientes={pctPendientes}
        pctEnProceso={pctEnProceso}
        pctCompletados={pctCompletados}
        recientes={recientes}
      />
    </div>
  );
}
