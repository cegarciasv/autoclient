"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Referencia {
  nombreRazonSocial: string;
  telefonoFijo: string;
  telefonoCelular: string;
  direccion: string;
}

interface Props {
  formulario: Record<string, unknown>;
  guardando: boolean;
  onGuardar: (datos: Record<string, unknown>, siguiente?: boolean) => Promise<boolean>;
  onAnterior: () => void;
  token: string;
}

function referenciaVacia(): Referencia {
  return { nombreRazonSocial: "", telefonoFijo: "", telefonoCelular: "", direccion: "" };
}

export default function PasoReferencias({ formulario, guardando, onGuardar, onAnterior }: Props) {
  const refIniciales: Referencia[] = Array.isArray(formulario.referencias) && formulario.referencias.length >= 2
    ? (formulario.referencias as Record<string, unknown>[]).map((r) => ({
        nombreRazonSocial: String(r.nombreRazonSocial ?? ""),
        telefonoFijo: String(r.telefonoFijo ?? ""),
        telefonoCelular: String(r.telefonoCelular ?? ""),
        direccion: String(r.direccion ?? ""),
      }))
    : [referenciaVacia(), referenciaVacia()];

  const [referencias, setReferencias] = useState<Referencia[]>(refIniciales);

  function actualizar(i: number, campo: keyof Referencia, valor: string) {
    const nuevas = [...referencias];
    nuevas[i] = { ...nuevas[i], [campo]: valor };
    setReferencias(nuevas);
  }

  function agregar() {
    setReferencias([...referencias, referenciaVacia()]);
  }

  function eliminar(i: number) {
    if (referencias.length <= 2) {
      toast.error("Se requieren mínimo 2 referencias comerciales");
      return;
    }
    setReferencias(referencias.filter((_, idx) => idx !== i));
  }

  function validar(): boolean {
    if (referencias.length < 2) {
      toast.error("Se requieren mínimo 2 referencias comerciales");
      return false;
    }
    for (let i = 0; i < referencias.length; i++) {
      const r = referencias[i];
      if (!r.nombreRazonSocial || !r.telefonoCelular || !r.direccion) {
        toast.error(`Complete los campos requeridos en la referencia ${i + 1}`);
        return false;
      }
    }
    return true;
  }

  async function guardar(siguiente: boolean) {
    // Al avanzar (Siguiente) validamos; al guardar borrador no
    if (siguiente && !validar()) return;
    await onGuardar({ referencias }, siguiente);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-[#1B4F8A]">Referencias Comerciales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">
            Proporcione al menos <strong>2 referencias comerciales</strong> que puedan dar fe de su trayectoria y cumplimiento de obligaciones.
          </p>

          <AnimatePresence initial={false}>
          {referencias.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.2 }}
              className="border rounded-lg p-4 space-y-4 relative"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">Referencia {i + 1}</p>
                {referencias.length > 2 && (
                  <button type="button" onClick={() => eliminar(i)} className="text-red-400 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <Label>Nombre / Razón Social <span className="text-red-500">*</span></Label>
                  <Input
                    value={r.nombreRazonSocial}
                    onChange={(e) => actualizar(i, "nombreRazonSocial", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Teléfono Fijo</Label>
                  <Input
                    value={r.telefonoFijo}
                    onChange={(e) => actualizar(i, "telefonoFijo", e.target.value)}
                    placeholder="2222-2222"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Teléfono Celular <span className="text-red-500">*</span></Label>
                  <Input
                    value={r.telefonoCelular}
                    onChange={(e) => actualizar(i, "telefonoCelular", e.target.value)}
                    placeholder="7777-7777"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Dirección <span className="text-red-500">*</span></Label>
                  <Input
                    value={r.direccion}
                    onChange={(e) => actualizar(i, "direccion", e.target.value)}
                  />
                </div>
              </div>
            </motion.div>
          ))}
          </AnimatePresence>

          <Button type="button" variant="outline" size="sm" onClick={agregar}>
            <Plus className="h-4 w-4 mr-1" /> Agregar referencia
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-between pb-4">
        <Button type="button" variant="outline" onClick={onAnterior}>
          ← Anterior
        </Button>
        <div className="flex gap-3">
          <Button type="button" variant="outline" disabled={guardando} onClick={() => guardar(false)}>
            Guardar borrador
          </Button>
          <Button
            type="button"
            disabled={guardando}
            className="bg-[#2872C7] hover:bg-[#1F5FA8]"
            onClick={() => guardar(true)}
          >
            {guardando ? "Guardando..." : "Siguiente →"}
          </Button>
        </div>
      </div>
    </div>
  );
}
