"use client";

import Link from "next/link";
import { Activity, ArrowRight, CheckCircle2, Clock3, LoaderCircle, Plus, Truck, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = { Users, Truck, Clock: Clock3, Loader2: LoaderCircle, CheckCircle2 };
const card = "rounded-xl border border-[#e2e8ec] bg-white shadow-[0_2px_8px_rgba(15,35,50,0.04)]";

interface KpiCard { label: string; value: number; icon: string }
interface Reciente { id: string; razonSocial: string; tipo: string; estado: string; creadoEn: Date | string }
interface Props {
  kpiCards: KpiCard[];
  pendientes: number; enProceso: number; completados: number;
  pctPendientes: number; pctEnProceso: number; pctCompletados: number;
  recientes: Reciente[];
}

function EstadoBadge({ estado }: { estado: string }) {
  const styles: Record<string, string> = {
    PENDIENTE: "bg-[#f1f3f5] text-[#52657a]",
    EN_PROCESO: "bg-[#fff3e3] text-[#a75c17]",
    COMPLETADO: "bg-[#e8f5ee] text-[#16734d]",
  };
  const labels: Record<string, string> = { PENDIENTE: "Pendiente", EN_PROCESO: "En proceso", COMPLETADO: "Completado" };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${styles[estado] ?? "bg-slate-100 text-slate-600"}`}>{labels[estado] ?? estado}</span>;
}

function StatCard({ item }: { item: KpiCard }) {
  const Icon = ICONS[item.icon] ?? Users;
  return <div className={`${card} min-w-0 p-4 sm:p-5`}>
    <div className="flex items-start gap-3">
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#eef5f2] text-[var(--brand-primary)]"><Icon className="size-5" /></span>
      <div className="min-w-0"><p className="text-xs sm:text-sm leading-tight text-[#52657a]">{item.label}</p><p className="mt-1 text-[32px] leading-none font-bold tracking-tight tabular-nums text-[#142033]">{item.value}</p></div>
    </div>
  </div>;
}

function ActivitySummary({ rows, total }: { rows: { label: string; count: number; pct: number; bar: string }[]; total: number }) {
  return <section className={`${card} p-5 min-h-[290px]`} aria-labelledby="activity-title">
    <div className="flex items-center justify-between gap-4"><h2 id="activity-title" className="flex items-center gap-2.5 text-base font-bold text-[#142033]"><Activity className="size-5" /> Resumen de actividad</h2><span className="rounded-lg border border-[#e2e8ec] bg-[#f8fafb] px-3 py-1.5 text-xs text-[#52657a]">Estado actual</span></div>
    <p className="mt-2 text-sm text-[#52657a]">{total} expedientes registrados en total</p>
    <div className="mt-8 space-y-6">{rows.map((row) => <div key={row.label}>
      <div className="mb-2 flex justify-between gap-3 text-sm"><span className="font-medium text-[#142033]">{row.label}</span><span className="font-semibold tabular-nums text-[#52657a]">{row.count} <span className="font-normal">({row.pct}%)</span></span></div>
      <div className="h-3 overflow-hidden rounded-full bg-[#f0f3f5]"><div className={`h-full rounded-full ${row.bar}`} style={{ width: `${row.pct}%` }} /></div>
    </div>)}</div>
  </section>;
}

function StatusDistribution({ rows, total }: { rows: { label: string; pct: number; color: string }[]; total: number }) {
  const segments = rows.map((row, index) => {
    const start = rows.slice(0, index).reduce((sum, value) => sum + value.pct, 0);
    return `${row.color} ${start}% ${start + row.pct}%`;
  }).join(", ");
  return <section className={`${card} p-5 min-h-[290px]`} aria-labelledby="distribution-title">
    <h2 id="distribution-title" className="flex items-center gap-2.5 text-base font-bold text-[#142033]"><Clock3 className="size-5" /> Distribución de estados</h2>
    <div className="mt-7 flex flex-col sm:flex-row xl:flex-row items-center justify-center gap-6">
      <div role="img" aria-label={rows.map((r) => `${r.label}: ${r.pct}%`).join(", ")} className="relative size-40 shrink-0 rounded-full" style={{ background: total ? `conic-gradient(${segments})` : "#e2e8ec" }}>
        <div className="absolute inset-[27px] rounded-full bg-white grid place-content-center text-center"><strong className="text-3xl leading-none text-[#142033]">{total}</strong><span className="mt-1 text-xs text-[#52657a]">Total</span></div>
      </div>
      <div className="w-full max-w-56 space-y-3">{rows.map((row) => <div key={row.label} className="flex items-center gap-2 text-xs sm:text-sm"><span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: row.color }} /><span className="flex-1 text-[#52657a]">{row.label}</span><strong className="tabular-nums text-[#142033]">{row.pct}%</strong></div>)}</div>
    </div>
  </section>;
}

function RecentRecords({ recientes }: { recientes: Reciente[] }) {
  return <section className={`${card} min-w-0 p-5`} aria-labelledby="recent-title">
    <div className="flex items-center justify-between gap-3"><h2 id="recent-title" className="text-base font-bold text-[#142033]">Registros recientes</h2><Link href="/admin/clientes" className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-primary)] hover:underline brand-focus">Ver clientes <ArrowRight className="size-4" /></Link></div>
    <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[540px] text-left text-xs sm:text-sm">
      <thead className="bg-[#f5f7f8] text-[#52657a]"><tr><th className="rounded-l-lg px-3 py-2 font-medium">Cliente o proveedor</th><th className="px-3 py-2 font-medium">Fecha</th><th className="rounded-r-lg px-3 py-2 font-medium">Estado</th></tr></thead>
      <tbody className="divide-y divide-[#eef1f3]">{recientes.map((t) => <tr key={t.id} className="hover:bg-[#f8fafb]"><td className="px-3 py-2.5"><Link className="flex items-center gap-2.5 font-medium text-[#142033] hover:text-[var(--brand-primary)] brand-focus" href={`/admin/${t.tipo === "CLIENTE" ? "clientes" : "proveedores"}/${t.id}`}><span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#e9f4ef] text-xs text-[var(--brand-primary)]">{t.razonSocial.charAt(0).toUpperCase()}</span><span className="truncate max-w-[270px]">{t.razonSocial}</span></Link></td><td className="px-3 py-2.5 whitespace-nowrap text-[#52657a]">{new Date(t.creadoEn).toLocaleDateString("es-SV")}</td><td className="px-3 py-2.5"><EstadoBadge estado={t.estado} /></td></tr>)}</tbody>
    </table>{recientes.length === 0 && <p className="py-8 text-center text-sm text-[#52657a]">Aún no hay expedientes registrados.</p>}</div>
  </section>;
}

function QuickActions() {
  const actions = [
    { href: "/admin/clientes/nuevo", label: "Nuevo cliente", detail: "Registra un nuevo cliente", icon: Users },
    { href: "/admin/proveedores/nuevo", label: "Nuevo proveedor", detail: "Añade un proveedor", icon: Truck },
  ];
  return <section className={`${card} p-5`} aria-labelledby="quick-title"><h2 id="quick-title" className="flex items-center gap-2 text-base font-bold text-[#142033]"><Plus className="size-5" /> Acciones rápidas</h2><div className="mt-4 space-y-2">{actions.map(({ href, label, detail, icon: Icon }) => <Link key={href} href={href} className="flex items-center gap-3 rounded-xl border border-[#e2e8ec] p-3 hover:border-[var(--brand-primary)] hover:bg-[#f8fafb] brand-focus"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#e9f4ef] text-[var(--brand-primary)]"><Icon className="size-5" /></span><span className="min-w-0 flex-1"><strong className="block text-sm text-[#142033]">{label}</strong><span className="block text-xs text-[#52657a]">{detail}</span></span><ArrowRight className="size-4 text-[#52657a]" /></Link>)}</div></section>;
}

export default function DashboardAnimado({ kpiCards, pendientes, enProceso, completados, pctPendientes, pctEnProceso, pctCompletados, recientes }: Props) {
  const total = pendientes + enProceso + completados;
  const rows = [
    { label: "Completados", count: completados, pct: pctCompletados, color: "var(--brand-primary)", bar: "bg-[var(--brand-primary)]" },
    { label: "En proceso", count: enProceso, pct: pctEnProceso, color: "#657586", bar: "bg-[#657586]" },
    { label: "Pendientes", count: pendientes, pct: pctPendientes, color: "#c8d0d7", bar: "bg-[#c8d0d7]" },
  ];
  return <>
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">{kpiCards.map((item) => <StatCard item={item} key={item.label} />)}</div>
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]"><ActivitySummary rows={rows} total={total} /><StatusDistribution rows={rows} total={total} /></div>
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]"><RecentRecords recientes={recientes} /><QuickActions /></div>
  </>;
}
