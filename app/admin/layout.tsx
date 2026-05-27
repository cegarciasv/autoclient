"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Truck,
  LogOut,
  Menu,
  Building2,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/proveedores", label: "Proveedores", icon: Truck },
];

async function cerrarSesion() {
  await fetch("/api/auth/admin/logout", { method: "POST" });
  window.location.href = "/admin/login";
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Overlay móvil */}
      {sidebarAbierto && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarAbierto(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto",
          "bg-[#1B3C22] text-white",
          sidebarAbierto ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="bg-[#1A7A30] rounded-lg p-2 shadow-lg shadow-black/20 ring-1 ring-white/10">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm tracking-tight leading-none text-white">GRUPO REMOR</p>
            <p className="text-[11px] text-white/50 mt-1 leading-none">Panel Administrativo</p>
          </div>

          {/* Cerrar en móvil */}
          <button
            className="ml-auto lg:hidden text-white/50 hover:text-white transition-colors"
            onClick={() => setSidebarAbierto(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-0.5">
          <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider px-3 mb-3">
            Navegación
          </p>
          {navItems.map((item) => {
            const activo = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarAbierto(false)}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  activo
                    ? "bg-[#1A7A30] text-white shadow-sm shadow-black/20 border-l-2 border-[#4ade80]"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Estado activo del panel */}
        <div className="px-5 py-4 border-t border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <p className="text-xs text-white/40 font-medium">Panel Admin activo</p>
          </div>
        </div>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={cerrarSesion}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-white/50 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar móvil */}
        <header className="bg-[#1B3C22] text-white border-b border-white/10 px-4 py-3 flex items-center gap-4 lg:hidden">
          <button
            onClick={() => setSidebarAbierto(true)}
            className="text-white/60 hover:text-white transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-[#1A7A30] rounded-md p-1">
              <Building2 className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm text-white">Grupo Remor</span>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
