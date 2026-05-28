"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, UserPlus, Truck, Users, Clock, Loader2, CheckCircle2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Users,
  Truck,
  Clock,
  Loader2,
  CheckCircle2,
};

interface KpiCard {
  label: string;
  value: number;
  icon: string;
  iconBg: string;
  border: string;
}

interface Reciente {
  id: string;
  razonSocial: string;
  tipo: string;
  estado: string;
  creadoEn: Date | string;
}

interface Props {
  kpiCards: KpiCard[];
  pendientes: number;
  enProceso: number;
  completados: number;
  pctPendientes: number;
  pctEnProceso: number;
  pctCompletados: number;
  recientes: Reciente[];
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: "easeOut" as const },
  }),
};

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

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
    <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-semibold ${styles[estado] ?? "bg-slate-100 text-slate-600"}`}>
      {labels[estado] ?? estado}
    </span>
  );
}

export default function DashboardAnimado({
  kpiCards, pendientes, enProceso, completados,
  pctPendientes, pctEnProceso, pctCompletados, recientes,
}: Props) {
  return (
    <>
      {/* KPI Cards con stagger */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiCards.map((card, i) => (
          <motion.div key={card.label} custom={i} initial="hidden" animate="visible" variants={fadeUp}>
            <Card className={`border ${card.border} shadow-sm hover:shadow-md transition-shadow bg-white`}>
              <CardContent className="pt-5 pb-5">
                <div className={`inline-flex p-2.5 rounded-xl ${card.iconBg} shadow-sm mb-4`}>
                  {(() => { const Icon = ICON_MAP[card.icon] ?? Users; return <Icon className="h-4 w-4 text-white" />; })()}
                </div>
                <p className="text-3xl font-black text-slate-900 leading-none">{card.value}</p>
                <p className="text-xs text-slate-500 mt-1.5 font-medium">{card.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Resumen de actividad */}
      <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.35 }}>
        <Card className="border border-slate-100 shadow-sm bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Activity className="h-4 w-4 text-slate-500" />
              Resumen de actividad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Pendientes", count: pendientes, pct: pctPendientes, color: "from-amber-400 to-amber-500", dot: "bg-amber-400" },
              { label: "En proceso", count: enProceso, pct: pctEnProceso, color: "from-orange-400 to-orange-500", dot: "bg-orange-400" },
              { label: "Completados", count: completados, pct: pctCompletados, color: "from-emerald-400 to-emerald-600", dot: "bg-emerald-500" },
            ].map((row) => (
              <div key={row.label} className="space-y-1.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 font-medium flex items-center gap-1.5">
                    <span className={`inline-block h-2 w-2 rounded-full ${row.dot}`} />
                    {row.label}
                  </span>
                  <span className="text-slate-500 font-semibold tabular-nums">
                    {row.count} <span className="text-slate-400 font-normal">({row.pct}%)</span>
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full bg-gradient-to-r ${row.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${row.pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" as const, delay: 0.5 }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Acciones rápidas + Recientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.45 }}>
          <Card className="border border-slate-100 shadow-sm bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-800">Acciones rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link
                href="/admin/clientes/nuevo"
                className={buttonVariants({
                  className: "w-full bg-gradient-to-r from-[#1B3C22] to-[#1A7A30] hover:from-[#155E25] hover:to-[#1A7A30] text-white font-semibold gap-2 justify-center",
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
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.5 }}>
          <Card className="border border-slate-100 shadow-sm bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-800">Registros recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {recientes.map((t, i) => {
                  const inicial = t.razonSocial?.charAt(0)?.toUpperCase() ?? "?";
                  const esCliente = t.tipo === "CLIENTE";
                  return (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.55 + i * 0.06, duration: 0.3 }}
                    >
                      <Link
                        href={`/admin/${esCliente ? "clientes" : "proveedores"}/${t.id}`}
                        className="flex items-center gap-3 py-2.5 px-2 rounded-lg border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all"
                      >
                        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          esCliente ? "bg-gradient-to-br from-[#1A7A30] to-[#1B3C22]" : "bg-gradient-to-br from-purple-500 to-purple-700"
                        }`}>
                          {inicial}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{t.razonSocial}</p>
                          <p className="text-xs text-slate-400">
                            {esCliente ? "Cliente" : "Proveedor"} · {new Date(t.creadoEn).toLocaleDateString("es-SV")}
                          </p>
                        </div>
                        <EstadoBadge estado={t.estado} />
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
}
