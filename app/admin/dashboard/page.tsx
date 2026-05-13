import { Users, Truck, Clock, Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

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
          id: true, razonSocial: true, tipo: true, estado: true, creadoEn: true,
        },
      }),
    ]);

  const stats = [
    { label: "Total Clientes", value: totalClientes, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Proveedores", value: totalProveedores, icon: Truck, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Pendientes", value: pendientes, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "En proceso", value: enProceso, icon: Loader2, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Completados", value: completados, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Resumen del sistema de vinculación</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4 pb-4">
              <div className={`inline-flex p-2 rounded-lg ${stat.bg} mb-3`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Acciones rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/clientes/nuevo" className={buttonVariants({ className: "w-full bg-[#1e3a5f] hover:bg-[#162d4a]" })}>
              + Nuevo Cliente
            </Link>
            <Link href="/admin/proveedores/nuevo" className={buttonVariants({ variant: "outline", className: "w-full" })}>
              + Nuevo Proveedor
            </Link>
          </CardContent>
        </Card>

        {/* Recientes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Registros recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recientes.map((t: (typeof recientes)[0]) => (
                <Link
                  key={t.id}
                  href={`/admin/${t.tipo === "CLIENTE" ? "clientes" : "proveedores"}/${t.id}`}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded px-1 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800 truncate max-w-[160px]">
                      {t.razonSocial}
                    </p>
                    <p className="text-xs text-gray-400">
                      {t.tipo} · {new Date(t.creadoEn).toLocaleDateString("es-SV")}
                    </p>
                  </div>
                  <EstadoBadge estado={t.estado} />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EstadoBadge({ estado }: { estado: string }) {
  const map: Record<string, string> = {
    PENDIENTE: "bg-yellow-100 text-yellow-700",
    EN_PROCESO: "bg-blue-100 text-blue-700",
    COMPLETADO: "bg-green-100 text-green-700",
  };
  const labels: Record<string, string> = {
    PENDIENTE: "Pendiente",
    EN_PROCESO: "En proceso",
    COMPLETADO: "Completado",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[estado] || ""}`}>
      {labels[estado] || estado}
    </span>
  );
}
