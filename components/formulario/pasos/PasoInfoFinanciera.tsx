"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const schema = z.object({
  totalActivo: z.string().min(1, "Requerido"),
  totalPasivo: z.string().min(1, "Requerido"),
  totalPatrimonio: z.string().min(1, "Requerido"),
  ingresosMensuales: z.string().min(1, "Requerido"),
  egresosMensuales: z.string().min(1, "Requerido"),
  fuenteOtrosIngresos: z.string().optional(),
  otrosIngresosMensuales: z.string().optional(),
  operacionesInternacionales: z.boolean(),
  detalleOperaciones: z.string().optional(),
});

type Datos = z.infer<typeof schema>;

interface Props {
  formulario: Record<string, unknown>;
  guardando: boolean;
  onGuardar: (datos: Record<string, unknown>, siguiente?: boolean) => Promise<boolean>;
  onAnterior: () => void;
  token: string;
}

function toStr(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "object" && "toString" in (v as object)) return (v as { toString(): string }).toString();
  return String(v);
}

export default function PasoInfoFinanciera({ formulario, guardando, onGuardar, onAnterior }: Props) {
  const fi = (formulario.infoFinanciera as Record<string, unknown>) ?? {};

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Datos>({
    // resolver: zodResolver(schema), // ← DESACTIVADO para pruebas
    defaultValues: {
      totalActivo: toStr(fi.totalActivo),
      totalPasivo: toStr(fi.totalPasivo),
      totalPatrimonio: toStr(fi.totalPatrimonio),
      ingresosMensuales: toStr(fi.ingresosMensuales),
      egresosMensuales: toStr(fi.egresosMensuales),
      fuenteOtrosIngresos: toStr(fi.fuenteOtrosIngresos),
      otrosIngresosMensuales: toStr(fi.otrosIngresosMensuales),
      operacionesInternacionales: Boolean(fi.operacionesInternacionales),
      detalleOperaciones: toStr(fi.detalleOperaciones),
    },
  });

  const tieneOpsInternacionales = watch("operacionesInternacionales");
  const err = (campo: keyof Datos) => errors[campo] ? "border-red-500" : "";

  async function onSubmit(datos: Datos, siguiente: boolean) {
    await onGuardar({ infoFinanciera: datos }, siguiente);
  }

  function MoneyInput({ name, label, req }: { name: keyof Datos; label: string; req?: boolean }) {
    return (
      <div className="space-y-1">
        <Label>
          {label}{req && <span className="text-red-500 ml-0.5">*</span>}
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
          <Input
            {...register(name)}
            type="number"
            min="0"
            step="0.01"
            className={`pl-7 ${err(name)}`}
            placeholder="0.00"
          />
        </div>
        {errors[name] && <p className="text-xs text-red-500">{errors[name]?.message}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit((d) => onSubmit(d, true))(); }}>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-[#1e3a5f]">Balance General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">
              Ingrese los valores en dólares americanos (USD) correspondientes al último período fiscal.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <MoneyInput name="totalActivo" label="Total Activo" req />
              <MoneyInput name="totalPasivo" label="Total Pasivo" req />
              <MoneyInput name="totalPatrimonio" label="Total Patrimonio" req />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-[#1e3a5f]">Flujo de Ingresos y Egresos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MoneyInput name="ingresosMensuales" label="Ingresos Mensuales Promedio" req />
              <MoneyInput name="egresosMensuales" label="Egresos Mensuales Promedio" req />
            </div>

            <Separator />
            <p className="text-sm font-medium text-gray-700">Otros ingresos (si aplica)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Fuente de otros ingresos</Label>
                <Input {...register("fuenteOtrosIngresos")} placeholder="Ej: Arrendamientos, inversiones..." />
              </div>
              <MoneyInput name="otrosIngresosMensuales" label="Monto mensual (otros ingresos)" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-[#1e3a5f]">Operaciones Internacionales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="opsInternacionales"
                checked={tieneOpsInternacionales}
                onCheckedChange={(v) => setValue("operacionesInternacionales", Boolean(v))}
              />
              <Label htmlFor="opsInternacionales" className="font-normal cursor-pointer">
                Realiza operaciones o transacciones con el exterior (importaciones, exportaciones, remesas, etc.)
              </Label>
            </div>

            {tieneOpsInternacionales && (
              <div className="space-y-1">
                <Label>Detalle de las operaciones internacionales <span className="text-red-500">*</span></Label>
                <textarea
                  {...register("detalleOperaciones")}
                  rows={3}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                  placeholder="Describa los países, tipo de operaciones y montos aproximados..."
                />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between pb-4">
          <Button type="button" variant="outline" onClick={onAnterior}>
            ← Anterior
          </Button>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={guardando}
              onClick={() => handleSubmit((d) => onSubmit(d, false))()}
            >
              Guardar borrador
            </Button>
            <Button type="submit" disabled={guardando} className="bg-[#1e3a5f] hover:bg-[#162d4a]">
              {guardando ? "Guardando..." : "Siguiente →"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
