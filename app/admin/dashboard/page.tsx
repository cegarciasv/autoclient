import { CalendarDays } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { obtenerAdminActual } from "@/lib/auth-admin";
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
  const admin = await obtenerAdminActual();
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
    },
    {
      label: "Total Proveedores",
      value: totalProveedores,
      icon: "Truck",
    },
    {
      label: "Pendientes",
      value: pendientes,
      icon: "Clock",
    },
    {
      label: "En proceso",
      value: enProceso,
      icon: "Loader2",
    },
    {
      label: "Completados",
      value: completados,
      icon: "CheckCircle2",
    },
  ];

  const fecha = getFechaEspanol();
  // Capitalizar primera letra
  const fechaCapital = fecha.charAt(0).toUpperCase() + fecha.slice(1);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-1">
        <div>
          <h1 className="text-[32px] leading-tight font-bold tracking-tight text-[#142033]">Hola, {admin?.nombre?.split(" ")[0] || "bienvenido"}</h1>
          <p className="mt-1 text-sm sm:text-base text-[#52657a]">Aquí tienes el resumen de la operación. Todo bajo control.</p>
        </div>
        <div className="flex items-center gap-3 text-[#142033]"><CalendarDays className="size-5" /><span className="text-sm font-medium">{fechaCapital}</span></div>
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
