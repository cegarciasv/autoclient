"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Lock, Mail, ShieldCheck } from "lucide-react";
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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Decoración de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl" />
      </div>

      <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
        {/* Logo header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-[#1e3a5f] rounded-2xl p-3 shadow-lg shadow-blue-900/20">
            <Building2 className="h-7 w-7 text-white" />
          </div>
          <div>
            <p className="font-bold text-xl text-[#1e3a5f] tracking-tight leading-none">GRUPO REMOR</p>
            <p className="text-xs text-slate-500 mt-1">Sistema de Vinculación</p>
          </div>
        </div>

        {/* Card */}
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/60 overflow-hidden">
            <div className="px-8 pt-8 pb-6 text-center border-b border-slate-100">
              <h1 className="text-xl font-semibold text-slate-900">Acceso administrativo</h1>
              <p className="text-sm text-slate-500 mt-1.5">
                Ingrese sus credenciales para continuar
              </p>
            </div>

            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Correo electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@gruporemor.com.sv"
                    required
                    autoFocus
                    className="pl-9 h-10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="pl-9 h-10"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                  <span className="leading-tight">{error}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-10 bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-medium shadow-md shadow-blue-900/10"
                disabled={cargando}
              >
                {cargando ? "Ingresando..." : "Ingresar al sistema"}
              </Button>
            </form>

            <div className="px-8 pb-6">
              <div className="flex items-center gap-2 text-xs text-slate-400 justify-center">
                <ShieldCheck className="h-3.5 w-3.5" />
                Conexión segura · Sesión cifrada
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            © {new Date().getFullYear()} Grupo Remor · Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  );
}
