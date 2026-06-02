"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FormNuevoUsuario() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    rol: "EJECUTIVO",
  });

  function set(campo: string, valor: string) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError(null);

    const res = await fetch("/api/admin/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setCargando(false);

    if (res.ok) {
      router.push("/admin/usuarios");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Error al crear el usuario");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Usuario</h1>
        <p className="text-sm text-gray-500 mt-1">
          Crear una cuenta de acceso al panel administrativo
        </p>
      </div>

      <Card className="max-w-xl border border-slate-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-slate-800">
            Datos del usuario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nombre">Nombre completo *</Label>
              <Input
                id="nombre"
                value={form.nombre}
                onChange={(e) => set("nombre", e.target.value)}
                placeholder="Ej. Juan Pérez"
                required
                disabled={cargando}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Correo electrónico *</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="usuario@empresa.com"
                required
                disabled={cargando}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Rol *</Label>
              <Select
                value={form.rol}
                onValueChange={(v) => set("rol", v ?? "EJECUTIVO")}
                disabled={cargando}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EJECUTIVO">Ejecutivo</SelectItem>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {error}
              </p>
            )}

            <p className="text-xs text-gray-500 bg-blue-50 rounded p-2 border border-blue-100">
              Se enviará un correo al usuario con instrucciones para acceder al sistema.
            </p>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
                disabled={cargando}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#2872C7] hover:bg-[#1F5FA8]"
                disabled={cargando}
              >
                {cargando ? "Guardando..." : "Crear Usuario"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
