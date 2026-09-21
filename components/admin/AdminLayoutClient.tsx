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
  Settings,
  Search,
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
  { href: "/admin/configuracion", label: "Configuración", icon: Settings, adminOnly: true },
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
    <div className="min-h-screen flex bg-[#f5f7f8]">
      {/* Overlay móvil animado */}
      <AnimatePresence>
        {sidebarAbierto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-20 lg:hidden"
            onClick={() => setSidebarAbierto(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ─────────────────────────────────── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-[230px] flex flex-col lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-auto",
          "bg-[var(--brand-dark)] text-white",
          // En desktop siempre visible; en móvil lo manejamos con motion
          "max-lg:transition-transform max-lg:duration-200",
          sidebarAbierto ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="px-5 py-5 min-h-28 flex items-center border-b border-white/10">
          <div className="flex items-center justify-between gap-3">
            <Image
              src="/api/branding/logo"
              unoptimized
              alt="Logo de la empresa"
              width={220}
              height={70}
              className="h-16 max-w-[170px] w-auto object-contain object-left"
              priority
            />
          {/* Cerrar en móvil */}
          <button
            className="ml-auto lg:hidden text-white/75 hover:text-white transition-colors p-3 -mr-3 brand-focus"
            aria-label="Cerrar menú"
            onClick={() => setSidebarAbierto(false)}
          >
            <X className="h-4 w-4" />
          </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1" aria-label="Navegación principal">
          {itemsVisibles.map((item) => {
            const activo = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarAbierto(false)}
                className={cn(
                  "relative flex items-center gap-3 px-4 min-h-12 rounded-lg text-sm font-medium transition-colors brand-focus",
                  activo
                    ? "bg-white/12 text-white before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-full before:bg-[var(--brand-accent)]"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mx-5 border-t border-white/15 pt-5 pb-3 text-xs text-white/75">
          <p className="flex items-center gap-2"><span className="size-2 rounded-full bg-[var(--brand-accent)]" /> Panel Admin activo</p>
          {session && <p className="mt-3 break-all text-white/50">{session.email}</p>}
        </div>

        {/* Logout */}
        <div className="px-3 pb-5">
          <button
            onClick={cerrarSesion}
            className="flex items-center gap-3 px-4 min-h-11 w-full rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors brand-focus"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="hidden lg:flex items-center justify-between border-b border-[#e2e8ec] bg-white px-7 h-[68px]">
          <Link href="/admin/clientes" className="inline-flex items-center gap-3 w-full max-w-[450px] h-10 rounded-lg border border-[#e2e8ec] bg-[#f5f7f8] px-3.5 text-sm text-[#52657a] hover:border-[var(--brand-primary)] brand-focus">
            <Search className="size-4 text-[#142033]" /> Buscar expedientes de clientes
          </Link>
          {session && <div className="flex items-center gap-3 pl-5">
            <div className="size-10 rounded-full bg-[var(--brand-primary)] text-white grid place-items-center text-sm font-semibold">{session.nombre.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("")}</div>
            <div className="text-sm leading-tight"><p className="font-semibold text-[#142033]">{session.nombre}</p><p className="text-xs text-[#52657a]">{session.rol === "ADMIN" ? "Administrador" : "Ejecutivo"}</p></div>
          </div>}
        </div>
        {/* Topbar móvil */}
        <header className="bg-[var(--brand-dark)] text-white border-b border-white/10 px-4 py-3 flex items-center gap-4 lg:hidden">
          <button
            onClick={() => setSidebarAbierto(true)}
            className="text-white/80 hover:text-white transition-colors p-2 brand-focus"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Image
            src="/api/branding/logo"
            unoptimized
            alt="Logo de la empresa"
            width={200}
            height={56}
            className="h-10 w-auto object-contain"
            priority
          />
        </header>

        <main className="flex-1 min-w-0 w-full max-w-[1800px] mx-auto p-4 sm:p-6 lg:px-8 lg:py-7 2xl:px-12 2xl:py-9">
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
