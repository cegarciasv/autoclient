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
import { Badge } from "@/components/ui/badge";

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  creadoEn: string;
}

interface Props {
  usuario: Usuario;
  esSelf: boolean;
}

export default function FormEditarUsuario({ usuario, esSelf }: Props) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);
  const [form, setForm] = useState({
    nombre: usuario.nombre,
    rol: usuario.rol,
  });
  const [activo, setActivo] = useState(usuario.activo);

  function set(campo: string, valor: string) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setError(null);
    setExito(null);
  }

  async function patch(data: Record<string, unknown>) {
    setCargando(true);
    setError(null);
    setExito(null);

    const res = await fetch(`/api/admin/usuarios/${usuario.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setCargando(false);

    if (res.ok) {
      return true;
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Error al guardar los cambios");
      return false;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await patch(form);
    if (ok) {
      setExito("Datos actualizados correctamente");
      router.refresh();
    }
  }

  async function toggleActivo() {
    const nuevoEstado = !activo;
    const ok = await patch({ activo: nuevoEstado });
    if (ok) {
      setActivo(nuevoEstado);
      setExito(nuevoEstado ? "Usuario activado" : "Usuario desactivado");
      router.refresh();
    }
  }

  async function handleEliminar() {
    if (!confirm(`¿Eliminar al usuario "${usuario.nombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setCargando(true);
    setError(null);

    const res = await fetch(`/api/admin/usuarios/${usuario.id}`, {
      method: "DELETE",
    });

    setCargando(false);

    if (res.ok) {
      router.push("/admin/usuarios");
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Error al eliminar el usuario");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Usuario</h1>
          <p className="text-sm text-gray-500 mt-1">{usuario.email}</p>
        </div>
        <div className="flex gap-2 items-center">
          {activo ? (
            <Badge className="bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
              Activo
            </Badge>
          ) : (
            <Badge className="bg-red-50 text-red-700 border border-red-200 font-semibold">
              Inactivo
            </Badge>
          )}
          {usuario.rol === "ADMIN" ? (
            <Badge className="bg-purple-100 text-purple-700 border-0 font-semibold">
              ADMIN
            </Badge>
          ) : (
            <Badge className="bg-blue-100 text-blue-700 border-0 font-semibold">
              EJECUTIVO
            </Badge>
          )}
        </div>
      </div>

      {/* Edit form */}
      <Card className="max-w-xl border border-slate-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-slate-800">Datos del usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nombre">Nombre completo *</Label>
              <Input
                id="nombre"
                value={form.nombre}
                onChange={(e) => set("nombre", e.target.value)}
                required
                disabled={cargando}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                value={usuario.email}
                disabled
                className="bg-slate-50 text-slate-500"
              />
              <p className="text-xs text-slate-400">El correo no se puede modificar</p>
            </div>

            <div className="space-y-1.5">
              <Label>Rol *</Label>
              <Select
                value={form.rol}
                onValueChange={(v) => set("rol", v ?? "EJECUTIVO")}
                disabled={cargando || esSelf}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EJECUTIVO">Ejecutivo</SelectItem>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                </SelectContent>
              </Select>
              {esSelf && (
                <p className="text-xs text-slate-400">No puedes cambiar tu propio rol</p>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {error}
              </p>
            )}
            {exito && (
              <p className="text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded px-3 py-2">
                {exito}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/usuarios")}
                className="flex-1"
                disabled={cargando}
              >
                Volver
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#2872C7] hover:bg-[#1F5FA8]"
                disabled={cargando}
              >
                {cargando ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="max-w-xl border border-red-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-red-700">Zona de peligro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!esSelf && (
            <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <div>
                <p className="text-sm font-medium text-slate-800">
                  {activo ? "Desactivar usuario" : "Activar usuario"}
                </p>
                <p className="text-xs text-slate-500">
                  {activo
                    ? "El usuario perderá acceso al panel de administración"
                    : "El usuario recuperará acceso al panel de administración"}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={toggleActivo}
                disabled={cargando}
                className={
                  activo
                    ? "border-amber-300 text-amber-700 hover:bg-amber-50"
                    : "border-blue-300 text-blue-700 hover:bg-blue-50"
                }
              >
                {cargando ? "..." : activo ? "Desactivar" : "Activar"}
              </Button>
            </div>
          )}

          {!esSelf && (
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-slate-800">Eliminar usuario</p>
                <p className="text-xs text-slate-500">
                  Elimina permanentemente esta cuenta. No se puede deshacer.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleEliminar}
                disabled={cargando}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                {cargando ? "..." : "Eliminar"}
              </Button>
            </div>
          )}

          {esSelf && (
            <p className="text-sm text-slate-500 py-2">
              No puedes desactivar ni eliminar tu propia cuenta.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
