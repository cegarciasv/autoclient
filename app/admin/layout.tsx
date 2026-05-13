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
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarAbierto(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 bg-[#1e3a5f] text-white flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto",
          sidebarAbierto ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="bg-white/10 rounded-lg p-2">
            <Building2 className="h-5 w-5 text-blue-200" />
          </div>
          <div>
            <p className="font-bold text-sm tracking-tight leading-none">GRUPO REMOR</p>
            <p className="text-[11px] text-blue-200/80 mt-1 leading-none">Panel Administrativo</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-0.5">
          <p className="text-[10px] font-semibold text-blue-200/60 uppercase tracking-wider px-3 mb-2">
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
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  activo
                    ? "bg-white text-[#1e3a5f] shadow-sm"
                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-4 border-t border-white/10 pt-4">
          <button
            onClick={cerrarSesion}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-blue-100 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar móvil */}
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-4 lg:hidden">
          <button onClick={() => setSidebarAbierto(true)} className="text-slate-600">
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-semibold text-[#1e3a5f] text-sm">Grupo Remor</span>
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
