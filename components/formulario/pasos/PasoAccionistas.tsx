"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Accionista {
  tipoIdentificacion: string;
  numeroDocumento: string;
  nombreRazonSocial: string;
  recursosPublicos: boolean;
  cargoPoder: boolean;
  reconocidoPublicamente: boolean;
  declaracionPais: string;
  porcentajeParticipacion: string;
}

interface Props {
  formulario: Record<string, unknown>;
  guardando: boolean;
  onGuardar: (datos: Record<string, unknown>, siguiente?: boolean) => Promise<boolean>;
  onAnterior: () => void;
  token: string;
}

function accionistaVacio(): Accionista {
  return {
    tipoIdentificacion: "",
    numeroDocumento: "",
    nombreRazonSocial: "",
    recursosPublicos: false,
    cargoPoder: false,
    reconocidoPublicamente: false,
    declaracionPais: "El Salvador",
    porcentajeParticipacion: "",
  };
}

export default function PasoAccionistas({ formulario, guardando, onGuardar, onAnterior }: Props) {
  const accionistasIniciales: Accionista[] = Array.isArray(formulario.accionistas)
    ? (formulario.accionistas as Record<string, unknown>[]).map((a) => ({
        tipoIdentificacion: String(a.tipoIdentificacion ?? ""),
        numeroDocumento: String(a.numeroDocumento ?? ""),
        nombreRazonSocial: String(a.nombreRazonSocial ?? ""),
        recursosPublicos: Boolean(a.recursosPublicos),
        cargoPoder: Boolean(a.cargoPoder),
        reconocidoPublicamente: Boolean(a.reconocidoPublicamente),
        declaracionPais: String(a.declaracionPais ?? "El Salvador"),
        porcentajeParticipacion: String(a.porcentajeParticipacion ?? ""),
      }))
    : [accionistaVacio()];

  const [accionistas, setAccionistas] = useState<Accionista[]>(accionistasIniciales);
  const [expandidos, setExpandidos] = useState<Set<number>>(new Set([0]));

  function actualizar(i: number, campo: keyof Accionista, valor: unknown) {
    const nuevos = [...accionistas];
    nuevos[i] = { ...nuevos[i], [campo]: valor };
    setAccionistas(nuevos);
  }

  function agregar() {
    const idx = accionistas.length;
    setAccionistas([...accionistas, accionistaVacio()]);
    setExpandidos(new Set([...expandidos, idx]));
  }

  function eliminar(i: number) {
    setAccionistas(accionistas.filter((_, idx) => idx !== i));
    const nuevo = new Set(expandidos);
    nuevo.delete(i);
    setExpandidos(nuevo);
  }

  function toggleExpandir(i: number) {
    const nuevo = new Set(expandidos);
    if (nuevo.has(i)) nuevo.delete(i); else nuevo.add(i);
    setExpandidos(nuevo);
  }

  function validar(): boolean {
    for (let i = 0; i < accionistas.length; i++) {
      const a = accionistas[i];
      if (!a.tipoIdentificacion || !a.numeroDocumento || !a.nombreRazonSocial || !a.porcentajeParticipacion) {
        toast.error(`Complete todos los campos requeridos del accionista ${i + 1}`);
        setExpandidos(new Set([...expandidos, i]));
        return false;
      }
    }
    return true;
  }

  async function guardar(siguiente: boolean) {
    // Al avanzar (Siguiente) validamos; al guardar borrador no
    if (siguiente && !validar()) return;
    await onGuardar({ accionistas }, siguiente);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-[#1B4F8A]">Información de Accionistas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-500">
            Registre todos los accionistas con participación igual o superior al 5%.
          </p>

          <AnimatePresence initial={false}>
          {accionistas.map((a, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.2 }}
              className="border rounded-lg overflow-hidden"
            >
              <div
                className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer"
                onClick={() => toggleExpandir(i)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    {a.nombreRazonSocial || `Accionista ${i + 1}`}
                  </span>
                  {a.porcentajeParticipacion && (
                    <span className="text-xs bg-blue-100 text-[#1B4F8A] px-2 py-0.5 rounded-full">
                      {a.porcentajeParticipacion}%
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {accionistas.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); eliminar(i); }}
                      className="text-red-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  {expandidos.has(i) ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                </div>
              </div>

              {expandidos.has(i) && (
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Tipo de Identificación <span className="text-red-500">*</span></Label>
                      <Select value={a.tipoIdentificacion} onValueChange={(v) => actualizar(i, "tipoIdentificacion", v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {["DUI", "NIT", "Pasaporte", "NRC", "Carné de Residente"].map((o) => (
                            <SelectItem key={o} value={o}>{o}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Número de Documento <span className="text-red-500">*</span></Label>
                      <Input
                        value={a.numeroDocumento}
                        onChange={(e) => actualizar(i, "numeroDocumento", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <Label>Nombre / Razón Social <span className="text-red-500">*</span></Label>
                      <Input
                        value={a.nombreRazonSocial}
                        onChange={(e) => actualizar(i, "nombreRazonSocial", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>% de Participación <span className="text-red-500">*</span></Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={a.porcentajeParticipacion}
                        onChange={(e) => actualizar(i, "porcentajeParticipacion", e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>País de Declaración <span className="text-red-500">*</span></Label>
                      <Input
                        value={a.declaracionPais}
                        onChange={(e) => actualizar(i, "declaracionPais", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Declaración PEP</p>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`rp-${i}`}
                        checked={a.recursosPublicos}
                        onCheckedChange={(v) => actualizar(i, "recursosPublicos", Boolean(v))}
                      />
                      <Label htmlFor={`rp-${i}`} className="font-normal text-sm cursor-pointer">
                        Maneja o ha manejado recursos públicos
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`cp-${i}`}
                        checked={a.cargoPoder}
                        onCheckedChange={(v) => actualizar(i, "cargoPoder", Boolean(v))}
                      />
                      <Label htmlFor={`cp-${i}`} className="font-normal text-sm cursor-pointer">
                        Ejerce o ha ejercido cargo de poder público
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`rpu-${i}`}
                        checked={a.reconocidoPublicamente}
                        onCheckedChange={(v) => actualizar(i, "reconocidoPublicamente", Boolean(v))}
                      />
                      <Label htmlFor={`rpu-${i}`} className="font-normal text-sm cursor-pointer">
                        Es reconocido públicamente como figura política o de alto perfil
                      </Label>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
          </AnimatePresence>

          <Button type="button" variant="outline" size="sm" onClick={agregar}>
            <Plus className="h-4 w-4 mr-1" /> Agregar accionista
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
