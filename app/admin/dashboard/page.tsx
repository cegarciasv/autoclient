import {
  Users,
  Truck,
  Clock,
  Loader2,
  CheckCircle2,
  UserPlus,
  Activity,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

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
      icon: Users,
      iconBg: "bg-gradient-to-br from-[#1A7A30] to-[#1B3C22]",
      border: "border-[#1A7A30]/20",
    },
    {
      label: "Total Proveedores",
      value: totalProveedores,
      icon: Truck,
      iconBg: "bg-gradient-to-br from-purple-500 to-purple-700",
      border: "border-purple-100",
    },
    {
      label: "Pendientes",
      value: pendientes,
      icon: Clock,
      iconBg: "bg-gradient-to-br from-amber-400 to-amber-600",
      border: "border-amber-100",
    },
    {
      label: "En proceso",
      value: enProceso,
      icon: Loader2,
      iconBg: "bg-gradient-to-br from-orange-400 to-orange-600",
      border: "border-orange-100",
    },
    {
      label: "Completados",
      value: completados,
      icon: CheckCircle2,
      iconBg: "bg-gradient-to-br from-emerald-400 to-emerald-600",
      border: "border-emerald-100",
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiCards.map((card) => (
          <Card
            key={card.label}
            className={`border ${card.border} shadow-sm hover:shadow-md transition-shadow bg-white`}
          >
            <CardContent className="pt-5 pb-5">
              <div className={`inline-flex p-2.5 rounded-xl ${card.iconBg} shadow-sm mb-4`}>
                <card.icon className="h-4 w-4 text-white" />
              </div>
              <p className="text-3xl font-black text-slate-900 leading-none">{card.value}</p>
              <p className="text-xs text-slate-500 mt-1.5 font-medium">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Resumen de actividad */}
      <Card className="border border-slate-100 shadow-sm bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Activity className="h-4 w-4 text-slate-500" />
            Resumen de actividad
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Pendientes */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 font-medium flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
                Pendientes
              </span>
              <span className="text-slate-500 font-semibold tabular-nums">
                {pendientes} <span className="text-slate-400 font-normal">({pctPendientes}%)</span>
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-700"
                style={{ width: `${pctPendientes}%` }}
              />
            </div>
          </div>

          {/* En proceso */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 font-medium flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-orange-400" />
                En proceso
              </span>
              <span className="text-slate-500 font-semibold tabular-nums">
                {enProceso} <span className="text-slate-400 font-normal">({pctEnProceso}%)</span>
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-700"
                style={{ width: `${pctEnProceso}%` }}
              />
            </div>
          </div>

          {/* Completados */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 font-medium flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                Completados
              </span>
              <span className="text-slate-500 font-semibold tabular-nums">
                {completados} <span className="text-slate-400 font-normal">({pctCompletados}%)</span>
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700"
                style={{ width: `${pctCompletados}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acciones rápidas + Registros recientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Acciones rápidas */}
        <Card className="border border-slate-100 shadow-sm bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-slate-800">Acciones rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/admin/clientes/nuevo"
              className={buttonVariants({
                className:
                  "w-full bg-gradient-to-r from-[#1B3C22] to-[#1A7A30] hover:from-[#155E25] hover:to-[#1A7A30] text-white font-semibold gap-2 justify-center",
              })}
            >
              <UserPlus className="h-4 w-4" />
              Nuevo Cliente
            </Link>
            <Link
              href="/admin/proveedores/nuevo"
              className={buttonVariants({
                variant: "outline",
                className: "w-full font-semibold gap-2 justify-center border-slate-200 text-slate-700 hover:bg-slate-50",
              })}
            >
              <Truck className="h-4 w-4" />
              Nuevo Proveedor
            </Link>
          </CardContent>
        </Card>

        {/* Registros recientes */}
        <Card className="border border-slate-100 shadow-sm bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-slate-800">Registros recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {recientes.map((t: (typeof recientes)[0]) => {
                const inicial = t.razonSocial?.charAt(0)?.toUpperCase() ?? "?";
                const esCliente = t.tipo === "CLIENTE";
                return (
                  <Link
                    key={t.id}
                    href={`/admin/${esCliente ? "clientes" : "proveedores"}/${t.id}`}
                    className="flex items-center gap-3 py-2.5 px-2 rounded-lg border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all"
                  >
                    {/* Avatar de iniciales */}
                    <div
                      className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        esCliente
                          ? "bg-gradient-to-br from-[#1A7A30] to-[#1B3C22]"
                          : "bg-gradient-to-br from-purple-500 to-purple-700"
                      }`}
                    >
                      {inicial}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {t.razonSocial}
                      </p>
                      <p className="text-xs text-slate-400">
                        {esCliente ? "Cliente" : "Proveedor"} ·{" "}
                        {new Date(t.creadoEn).toLocaleDateString("es-SV")}
                      </p>
                    </div>

                    <EstadoBadge estado={t.estado} />
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EstadoBadge({ estado }: { estado: string }) {
  const styles: Record<string, string> = {
    PENDIENTE: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    EN_PROCESO: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
    COMPLETADO: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  };
  const labels: Record<string, string> = {
    PENDIENTE: "Pendiente",
    EN_PROCESO: "En proceso",
    COMPLETADO: "Completado",
  };
  return (
    <span
      className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-semibold ${styles[estado] ?? "bg-slate-100 text-slate-600"}`}
    >
      {labels[estado] ?? estado}
    </span>
  );
}
