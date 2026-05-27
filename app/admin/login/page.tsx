"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Lock,
  Mail,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Zap,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCargando(true);

    const res = await fetch("/api/auth/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setCargando(false);

    if (res.ok) {
      router.push("/admin/dashboard");
    } else {
      const data = await res.json();
      setError(data.error || "Error al iniciar sesión");
    }
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* ── Panel izquierdo (solo desktop) ── */}
      <div className="hidden lg:flex flex-col justify-between bg-[#1B3C22] px-12 py-16 relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#1A7A30]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#1A7A30]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          {/* Grid sutil */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Logo */}
        <div className="relative">
          <Image
            src="/logo.png"
            alt="Grupo Remor"
            width={360}
            height={112}
            className="h-28 w-auto object-contain"
            priority
          />
        </div>

        {/* Contenido central */}
        <div className="relative space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Panel de
              <br />
              <span className="text-[#4ade80]">Administración</span>
            </h2>
            <p className="text-slate-400 text-base leading-relaxed max-w-sm">
              Gestiona el proceso de vinculación de clientes y proveedores desde
              un solo lugar, con trazabilidad completa y en tiempo real.
            </p>
          </div>

          {/* Bullet points */}
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-[#1A7A30]/20 rounded-lg flex items-center justify-center mt-0.5">
                <ShieldCheck className="h-4 w-4 text-[#4ade80]" />
              </span>
              <div>
                <p className="text-white text-sm font-medium">
                  Seguridad empresarial
                </p>
                <p className="text-slate-500 text-xs mt-0.5">
                  Acceso controlado con sesiones cifradas y auditoría de
                  actividad.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-[#1A7A30]/20 rounded-lg flex items-center justify-center mt-0.5">
                <Zap className="h-4 w-4 text-[#4ade80]" />
              </span>
              <div>
                <p className="text-white text-sm font-medium">
                  Eficiencia operativa
                </p>
                <p className="text-slate-500 text-xs mt-0.5">
                  Automatiza el envío de formularios y reduce tiempos de
                  onboarding.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-[#1A7A30]/20 rounded-lg flex items-center justify-center mt-0.5">
                <BarChart3 className="h-4 w-4 text-[#4ade80]" />
              </span>
              <div>
                <p className="text-white text-sm font-medium">
                  Control y visibilidad
                </p>
                <p className="text-slate-500 text-xs mt-0.5">
                  Seguimiento del progreso de cada tercero con reportes
                  detallados.
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* Footer izquierdo */}
        <div className="relative flex items-center gap-2 text-xs text-slate-600">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          Todos los sistemas operativos
        </div>
      </div>

      {/* ── Panel derecho: formulario ── */}
      <div className="flex flex-col items-center justify-center min-h-screen lg:min-h-0 bg-slate-50 px-6 py-12">
        {/* Logo visible solo en móvil */}
        <div className="lg:hidden mb-10">
          <Image
            src="/logo.png"
            alt="Grupo Remor"
            width={280}
            height={88}
            className="h-20 w-auto object-contain"
            priority
          />
        </div>

        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-200/60 overflow-hidden">
            {/* Header */}
            <div className="px-8 pt-8 pb-6 border-b border-slate-100">
              <h1 className="text-2xl font-bold text-slate-900">
                Acceso administrativo
              </h1>
              <p className="text-sm text-slate-500 mt-1.5">
                Ingrese sus credenciales para continuar
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
              {/* Email */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-slate-700"
                >
                  Correo electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@gruporemor.com.sv"
                    required
                    autoFocus
                    className="pl-10 h-12 border-slate-200 focus:border-[#1A7A30] focus:ring-[#1A7A30]/20 text-sm transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-700"
                >
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="pl-10 h-12 border-slate-200 focus:border-[#1A7A30] focus:ring-[#1A7A30]/20 text-sm transition-colors"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-red-500" />
                  <span className="leading-tight">{error}</span>
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={cargando}
                className="w-full h-12 text-white font-semibold text-sm rounded-xl bg-gradient-to-r from-[#1B3C22] to-[#1A7A30] hover:from-[#155E25] hover:to-[#1A7A30] shadow-md shadow-green-900/15 transition-all duration-200"
              >
                {cargando ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verificando...
                  </span>
                ) : (
                  "Ingresar al sistema"
                )}
              </Button>
            </form>

            {/* Seguridad */}
            <div className="px-8 pb-6">
              <div className="flex items-center gap-2 text-xs text-slate-400 justify-center">
                <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                Conexión segura &middot; Sesión cifrada
              </div>
            </div>
          </div>

          {/* Copyright */}
          <p className="text-center text-xs text-slate-400 mt-6">
            &copy; {new Date().getFullYear()} Grupo Remor &middot; Todos los
            derechos reservados
          </p>
        </div>
      </div>
    </div>
  );
}
