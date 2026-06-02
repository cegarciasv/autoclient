"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  Truck,
  LogOut,
  Menu,
  X,
  UserCog,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  children: React.ReactNode;
  session: { id: string; email: string; nombre: string; rol: string } | null;
}

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
  { href: "/admin/clientes", label: "Clientes", icon: Users, adminOnly: false },
  { href: "/admin/proveedores", label: "Proveedores", icon: Truck, adminOnly: false },
  { href: "/admin/usuarios", label: "Usuarios", icon: UserCog, adminOnly: true },
];

async function cerrarSesion() {
  await fetch("/api/auth/admin/logout", { method: "POST" });
  window.location.href = "/admin/login";
}

export default function AdminLayoutClient({ children, session }: Props) {
  const pathname = usePathname();
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  if (pathname === "/admin/login") return <>{children}</>;

  const itemsVisibles = navItems.filter(
    (item) => !item.adminOnly || session?.rol === "ADMIN"
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Overlay móvil animado */}
      <AnimatePresence>
        {sidebarAbierto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
            onClick={() => setSidebarAbierto(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ─────────────────────────────────── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 flex flex-col lg:translate-x-0 lg:static lg:z-auto",
          "bg-[#1B4F8A] text-white",
          // En desktop siempre visible; en móvil lo manejamos con motion
          "max-lg:transition-transform max-lg:duration-200",
          sidebarAbierto ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="bg-white rounded-xl p-2 shadow-sm">
            <Image
              src="/logo.png"
              alt="Transebastian"
              width={160}
              height={160}
              className="h-16 w-16 object-contain"
              priority
            />
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
          {itemsVisibles.map((item) => {
            const activo = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarAbierto(false)}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  activo
                    ? "bg-[#2872C7] text-white shadow-sm shadow-black/20 border-l-2 border-[#F47920]"
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
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
            </span>
            <p className="text-xs text-white/40 font-medium">Panel Admin activo</p>
          </div>
        </div>

        {/* User info */}
        {session && (
          <div className="px-5 py-3 border-t border-white/10">
            <p className="text-xs text-white/70 font-medium truncate">{session.nombre}</p>
            <p className="text-[10px] text-white/30 truncate">{session.email}</p>
          </div>
        )}

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
        <header className="bg-[#1B4F8A] text-white border-b border-white/10 px-4 py-3 flex items-center gap-4 lg:hidden">
          <button
            onClick={() => setSidebarAbierto(true)}
            className="text-white/60 hover:text-white transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="bg-white rounded-lg p-1.5 shadow-sm">
            <Image
              src="/logo.png"
              alt="Transebastian"
              width={120}
              height={120}
              className="h-11 w-11 object-contain"
              priority
            />
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-auto max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
