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
import { toast } from "sonner";

interface Props {
  tipo: "CLIENTE" | "PROVEEDOR";
}

export default function FormNuevoTercero({ tipo }: Props) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [form, setForm] = useState({
    razonSocial: "",
    tipoDocumento: "NIT",
    numeroDocumento: "",
    email: "",
  });

  function set(campo: string, valor: string) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);

    const res = await fetch("/api/admin/terceros", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, tipo }),
    });

    setCargando(false);

    if (res.ok) {
      toast.success("Registro creado y link enviado por email");
      router.push(`/admin/${tipo.toLowerCase()}s`);
      router.refresh();
    } else {
      const data = await res.json();
      toast.error(data.error || "Error al crear el registro");
    }
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle className="text-base">
          Datos del {tipo === "CLIENTE" ? "Cliente" : "Proveedor"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="razonSocial">Razón Social *</Label>
            <Input
              id="razonSocial"
              value={form.razonSocial}
              onChange={(e) => set("razonSocial", e.target.value)}
              placeholder="Ej. Empresa S.A. de C.V."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tipo de Documento *</Label>
              <Select
                value={form.tipoDocumento}
                onValueChange={(v) => set("tipoDocumento", v ?? "")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NIT">NIT</SelectItem>
                  <SelectItem value="DUI">DUI</SelectItem>
                  <SelectItem value="PASAPORTE">Pasaporte</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="numeroDocumento">Número de Documento *</Label>
              <Input
                id="numeroDocumento"
                value={form.numeroDocumento}
                onChange={(e) => set("numeroDocumento", e.target.value)}
                placeholder="Sin guiones ni espacios"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Correo Electrónico *</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="contacto@empresa.com"
              required
            />
          </div>

          <p className="text-xs text-gray-500 bg-blue-50 rounded p-2 border border-blue-100">
            Al guardar, se enviará automáticamente un correo con el enlace al formulario.
          </p>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#1e3a5f] hover:bg-[#162d4a]"
              disabled={cargando}
            >
              {cargando ? "Guardando..." : "Guardar y Enviar Link"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
