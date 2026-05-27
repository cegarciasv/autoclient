"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const schema = z.object({
  trayectoriaExperiencia: z.string().min(1),
  cantidadProyectos: z.string().min(1),
  montosProyectos: z.string().min(1),
  marketShareLocal: z.string().min(1),
  certificacionesInternacionales: z.boolean(),
  detallesCertificaciones: z.string().optional(),
  polizasSeguros: z.boolean(),
  detallesPolizas: z.string().optional(),
  prestacionesLey: z.boolean(),
  programaSeguridadSalud: z.boolean(),
  creditoOtorga: z.string().min(1),
  garantiasFianzas: z.boolean(),
  presenciaRegional: z.string().min(1),
  marketShareRegional: z.string().min(1),
  campanasReciclaje: z.boolean(),
  detallesReciclaje: z.string().optional(),
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
  return String(v);
}

export default function PasoEncuestaProveedor({ formulario, guardando, onGuardar, onAnterior }: Props) {
  const ep = (formulario.encuestaProveedor as Record<string, unknown>) ?? {};

  const { register, handleSubmit, getValues, setValue, watch } = useForm<Datos>({
    resolver: zodResolver(schema),
    defaultValues: {
      trayectoriaExperiencia: toStr(ep.trayectoriaExperiencia),
      cantidadProyectos: toStr(ep.cantidadProyectos),
      montosProyectos: toStr(ep.montosProyectos),
      marketShareLocal: toStr(ep.marketShareLocal),
      certificacionesInternacionales: Boolean(ep.certificacionesInternacionales),
      detallesCertificaciones: toStr(ep.detallesCertificaciones),
      polizasSeguros: Boolean(ep.polizasSeguros),
      detallesPolizas: toStr(ep.detallesPolizas),
      prestacionesLey: Boolean(ep.prestacionesLey),
      programaSeguridadSalud: Boolean(ep.programaSeguridadSalud),
      creditoOtorga: toStr(ep.creditoOtorga),
      garantiasFianzas: Boolean(ep.garantiasFianzas),
      presenciaRegional: toStr(ep.presenciaRegional),
      marketShareRegional: toStr(ep.marketShareRegional),
      campanasReciclaje: Boolean(ep.campanasReciclaje),
      detallesReciclaje: toStr(ep.detallesReciclaje),
    },
  });

  const tieneCertificaciones = watch("certificacionesInternacionales");
  const tienePolizas = watch("polizasSeguros");
  const tieneReciclaje = watch("campanasReciclaje");

  // Siguiente → pasa por handleSubmit (valida schema)
  async function onSubmit(datos: Datos, siguiente: boolean) {
    await onGuardar({ encuestaProveedor: datos }, siguiente);
  }

  // Borrador → guarda sin validar
  async function guardarBorrador() {
    const datos = getValues();
    await onGuardar({ encuestaProveedor: datos }, false);
  }

  function BoolCheck({ name, label }: { name: keyof Datos; label: string }) {
    return (
      <div className="flex items-start gap-2">
        <Checkbox
          id={name}
          checked={watch(name) as boolean}
          onCheckedChange={(v) => setValue(name, Boolean(v) as never)}
          className="mt-0.5"
        />
        <Label htmlFor={name} className="font-normal text-sm cursor-pointer leading-snug">{label}</Label>
      </div>
    );
  }

  function SelectField({ name, label, options }: { name: keyof Datos; label: string; options: string[] }) {
    return (
      <div className="space-y-1">
        <Label>{label} <span className="text-red-500">*</span></Label>
        <Select defaultValue={watch(name) as string} onValueChange={(v) => setValue(name, (v ?? "") as never)}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccione..." />
          </SelectTrigger>
          <SelectContent>
            {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit((d) => onSubmit(d, true))(); }}>
      <div className="space-y-6">

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-[#1e3a5f]">Trayectoria y Capacidad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField name="trayectoriaExperiencia" label="Años de trayectoria / experiencia" options={[
                "Menos de 1 año", "1 a 3 años", "3 a 5 años", "5 a 10 años", "Más de 10 años",
              ]} />
              <SelectField name="cantidadProyectos" label="Cantidad de proyectos ejecutados" options={[
                "1 a 5", "6 a 10", "11 a 20", "21 a 50", "Más de 50",
              ]} />
              <SelectField name="montosProyectos" label="Montos de proyectos ejecutados (USD)" options={[
                "Menos de $10,000", "$10,000 a $50,000", "$50,000 a $100,000",
                "$100,000 a $500,000", "Más de $500,000",
              ]} />
              <SelectField name="marketShareLocal" label="Market share en El Salvador" options={[
                "Menos del 5%", "5% a 15%", "15% a 30%", "30% a 50%", "Más del 50%",
              ]} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-[#1e3a5f]">Certificaciones y Cumplimiento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <BoolCheck name="certificacionesInternacionales" label="Cuenta con certificaciones internacionales (ISO, CE, UL, etc.)" />
            {tieneCertificaciones && (
              <div className="space-y-1 ml-6">
                <Label>Detalle de certificaciones</Label>
                <Input {...register("detallesCertificaciones")} placeholder="ISO 9001, ISO 14001..." />
              </div>
            )}

            <BoolCheck name="polizasSeguros" label="Cuenta con pólizas de seguros vigentes" />
            {tienePolizas && (
              <div className="space-y-1 ml-6">
                <Label>Detalle de pólizas</Label>
                <Input {...register("detallesPolizas")} placeholder="Responsabilidad civil, daños a terceros..." />
              </div>
            )}

            <BoolCheck name="prestacionesLey" label="Cumple con prestaciones de ley para sus empleados (ISSS, AFP, etc.)" />
            <BoolCheck name="programaSeguridadSalud" label="Cuenta con programa de seguridad y salud ocupacional" />
            <BoolCheck name="garantiasFianzas" label="Tiene capacidad para emitir garantías o fianzas" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-[#1e3a5f]">Condiciones Comerciales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField name="creditoOtorga" label="Crédito que otorga" options={[
                "Contado", "8 días", "15 días", "30 días", "45 días", "60 días", "90 días o más",
              ]} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-[#1e3a5f]">Presencia Regional y Sostenibilidad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField name="presenciaRegional" label="Presencia regional (Centroamérica)" options={[
                "Solo El Salvador", "El Salvador y Guatemala", "El Salvador y Honduras",
                "El Salvador y Nicaragua", "Toda Centroamérica", "Centroamérica y más",
              ]} />
              <SelectField name="marketShareRegional" label="Market share regional" options={[
                "Menos del 5%", "5% a 15%", "15% a 30%", "30% a 50%", "Más del 50%",
              ]} />
            </div>

            <BoolCheck name="campanasReciclaje" label="Participa en campañas de reciclaje o sostenibilidad ambiental" />
            {tieneReciclaje && (
              <div className="space-y-1 ml-6">
                <Label>Detalle de iniciativas de reciclaje / sostenibilidad</Label>
                <Input {...register("detallesReciclaje")} />
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
              onClick={guardarBorrador}
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
