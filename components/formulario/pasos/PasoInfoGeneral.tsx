"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

const schema = z.object({
  razonSocial: z.string().min(1),
  nombreComercial: z.string().min(1),
  nit: z.string().min(1),
  iva: z.string().min(1),
  actividadReal: z.string().min(1),
  tipoEmpresa: z.string().min(1),
  tipoActividadEconomica: z.string().min(1),
  obligacionesTributarias: z.boolean(),
  sistemaLAFT: z.boolean(),
  direccionPrincipal: z.string().min(1),
  departamento: z.string().min(1),
  ciudad: z.string().min(1),
  correoElectronico: z.string().email(),
  telefonoFijo: z.string().optional(),
  telefonoCelular: z.string().optional(),
  rlPrimerApellido: z.string().min(1),
  rlSegundoApellido: z.string().min(1),
  rlNombres: z.string().min(1),
  rlTipoIdentificacion: z.string().min(1),
  rlNumeroDocumento: z.string().min(1),
  rlFechaExpedicion: z.string().min(1),
  rlLugarExpedicion: z.string().min(1),
  rlFechaVencimiento: z.string().optional(),
  rlGenero: z.string().min(1),
  rlEstadoCivil: z.string().min(1),
  rlFechaNacimiento: z.string().min(1),
  rlLugarNacimiento: z.string().min(1),
  pepRecursosPublicos: z.boolean(),
  pepFamiliaresPublicos: z.boolean(),
  pepCargosPublicos: z.boolean(),
  pepSistemaLAFT: z.boolean(),
  productoServicio: z.string().min(1),
});

type Datos = z.infer<typeof schema>;

interface ClientePrincipal {
  nombreRazonSocial: string;
  porcentajeParticipacion: string;
}

interface Props {
  formulario: Record<string, unknown>;
  guardando: boolean;
  onGuardar: (datos: Record<string, unknown>, siguiente?: boolean) => Promise<boolean>;
  onAnterior: () => void;
  token: string;
}

function toStr(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "boolean") return String(v);
  return String(v);
}

function toDate(v: unknown): string {
  if (!v) return "";
  const s = typeof v === "string" ? v : String(v);
  return s.slice(0, 10);
}

function toBool(v: unknown): boolean {
  return v === true || v === "true";
}

export default function PasoInfoGeneral({ formulario, guardando, onGuardar }: Props) {
  const ig = (formulario.infoGeneral as Record<string, unknown>) ?? {};
  const clientesIniciales: ClientePrincipal[] = Array.isArray(formulario.clientesPrincipales)
    ? (formulario.clientesPrincipales as Record<string, unknown>[]).map((c) => ({
        nombreRazonSocial: toStr(c.nombreRazonSocial),
        porcentajeParticipacion: toStr(c.porcentajeParticipacion),
      }))
    : [{ nombreRazonSocial: "", porcentajeParticipacion: "" }];

  const [clientes, setClientes] = useState<ClientePrincipal[]>(clientesIniciales);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Datos>({
    // resolver: zodResolver(schema), // ← DESACTIVADO para pruebas
    defaultValues: {
      razonSocial: toStr(ig.razonSocial),
      nombreComercial: toStr(ig.nombreComercial),
      nit: toStr(ig.nit),
      iva: toStr(ig.iva),
      actividadReal: toStr(ig.actividadReal),
      tipoEmpresa: toStr(ig.tipoEmpresa),
      tipoActividadEconomica: toStr(ig.tipoActividadEconomica),
      obligacionesTributarias: toBool(ig.obligacionesTributarias),
      sistemaLAFT: toBool(ig.sistemaLAFT),
      direccionPrincipal: toStr(ig.direccionPrincipal),
      departamento: toStr(ig.departamento),
      ciudad: toStr(ig.ciudad),
      correoElectronico: toStr(ig.correoElectronico),
      telefonoFijo: toStr(ig.telefonoFijo),
      telefonoCelular: toStr(ig.telefonoCelular),
      rlPrimerApellido: toStr(ig.rlPrimerApellido),
      rlSegundoApellido: toStr(ig.rlSegundoApellido),
      rlNombres: toStr(ig.rlNombres),
      rlTipoIdentificacion: toStr(ig.rlTipoIdentificacion),
      rlNumeroDocumento: toStr(ig.rlNumeroDocumento),
      rlFechaExpedicion: toDate(ig.rlFechaExpedicion),
      rlLugarExpedicion: toStr(ig.rlLugarExpedicion),
      rlFechaVencimiento: toDate(ig.rlFechaVencimiento),
      rlGenero: toStr(ig.rlGenero),
      rlEstadoCivil: toStr(ig.rlEstadoCivil),
      rlFechaNacimiento: toDate(ig.rlFechaNacimiento),
      rlLugarNacimiento: toStr(ig.rlLugarNacimiento),
      pepRecursosPublicos: toBool(ig.pepRecursosPublicos),
      pepFamiliaresPublicos: toBool(ig.pepFamiliaresPublicos),
      pepCargosPublicos: toBool(ig.pepCargosPublicos),
      pepSistemaLAFT: toBool(ig.pepSistemaLAFT),
      productoServicio: toStr(ig.productoServicio),
    },
  });

  function agregarCliente() {
    setClientes([...clientes, { nombreRazonSocial: "", porcentajeParticipacion: "" }]);
  }

  function eliminarCliente(i: number) {
    setClientes(clientes.filter((_, idx) => idx !== i));
  }

  function actualizarCliente(i: number, campo: keyof ClientePrincipal, valor: string) {
    const nuevos = [...clientes];
    nuevos[i] = { ...nuevos[i], [campo]: valor };
    setClientes(nuevos);
  }

  async function onSubmit(datos: Datos, siguiente: boolean) {
    await onGuardar({ infoGeneral: datos, clientesPrincipales: clientes }, siguiente);
  }

  const err = (campo: keyof Datos) => errors[campo] ? "border-red-500" : "";

  function SelectField({ name, label, options, req }: {
    name: keyof Datos; label: string; options: string[]; req?: boolean;
  }) {
    return (
      <div className="space-y-1">
        <Label>{label}{req && <span className="text-red-500 ml-0.5">*</span>}</Label>
        <Select
          defaultValue={toStr(ig[name as string]) || watch(name) as string}
          onValueChange={(v) => setValue(name, (v ?? "") as never)}
        >
          <SelectTrigger className={err(name)}>
            <SelectValue placeholder="Seleccione..." />
          </SelectTrigger>
          <SelectContent>
            {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    );
  }

  function CheckField({ name, label }: { name: keyof Datos; label: string }) {
    return (
      <div className="flex items-center gap-2">
        <Checkbox
          id={name}
          checked={watch(name) as boolean}
          onCheckedChange={(v) => setValue(name, v as never)}
        />
        <Label htmlFor={name} className="font-normal text-sm cursor-pointer">{label}</Label>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit((d) => onSubmit(d, true))(); }}>
      <div className="space-y-6">

        {/* Datos de la Empresa */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-[#1e3a5f]">Datos de la Empresa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Razón Social <span className="text-red-500">*</span></Label>
                <Input {...register("razonSocial")} className={err("razonSocial")} />
              </div>
              <div className="space-y-1">
                <Label>Nombre Comercial <span className="text-red-500">*</span></Label>
                <Input {...register("nombreComercial")} className={err("nombreComercial")} />
              </div>
              <div className="space-y-1">
                <Label>NIT <span className="text-red-500">*</span></Label>
                <Input {...register("nit")} placeholder="0000-000000-000-0" className={err("nit")} />
              </div>
              <div className="space-y-1">
                <Label>Número de Registro IVA <span className="text-red-500">*</span></Label>
                <Input {...register("iva")} className={err("iva")} />
              </div>
              <div className="space-y-1">
                <Label>Actividad Real / Giro <span className="text-red-500">*</span></Label>
                <Input {...register("actividadReal")} className={err("actividadReal")} />
              </div>
              <SelectField name="tipoEmpresa" label="Tipo de Empresa" req options={[
                "Sociedad Anónima", "Sociedad de Responsabilidad Limitada", "Empresa Individual",
                "Cooperativa", "ONG / Asociación", "Otro",
              ]} />
              <SelectField name="tipoActividadEconomica" label="Tipo de Actividad Económica" req options={[
                "Comercio", "Industria / Manufactura", "Servicios", "Agropecuaria", "Construcción", "Otro",
              ]} />
              <div className="space-y-1">
                <Label>Producto / Servicio principal <span className="text-red-500">*</span></Label>
                <Input {...register("productoServicio")} className={err("productoServicio")} />
              </div>
            </div>
            <div className="space-y-2 pt-1">
              <CheckField name="obligacionesTributarias" label="Declara que cumple con las obligaciones tributarias y fiscales vigentes" />
              <CheckField name="sistemaLAFT" label="Cuenta con Sistema de Prevención de Lavado de Activos y Financiamiento al Terrorismo (LAFT)" />
            </div>
          </CardContent>
        </Card>

        {/* Dirección */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-[#1e3a5f]">Dirección de Oficina Principal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <Label>Dirección Principal <span className="text-red-500">*</span></Label>
                <Input {...register("direccionPrincipal")} className={err("direccionPrincipal")} />
              </div>
              <div className="space-y-1">
                <Label>Departamento <span className="text-red-500">*</span></Label>
                <Input {...register("departamento")} className={err("departamento")} />
              </div>
              <div className="space-y-1">
                <Label>Ciudad / Municipio <span className="text-red-500">*</span></Label>
                <Input {...register("ciudad")} className={err("ciudad")} />
              </div>
              <div className="space-y-1">
                <Label>Correo Electrónico <span className="text-red-500">*</span></Label>
                <Input {...register("correoElectronico")} type="email" className={err("correoElectronico")} />
              </div>
              <div className="space-y-1">
                <Label>Teléfono Fijo</Label>
                <Input {...register("telefonoFijo")} />
              </div>
              <div className="space-y-1">
                <Label>Teléfono Celular</Label>
                <Input {...register("telefonoCelular")} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clientes Principales */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-[#1e3a5f]">Clientes Principales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {clientes.map((c, i) => (
              <div key={i} className="flex gap-2 items-end">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Nombre / Razón Social</Label>
                  <Input
                    value={c.nombreRazonSocial}
                    onChange={(e) => actualizarCliente(i, "nombreRazonSocial", e.target.value)}
                  />
                </div>
                <div className="w-28 space-y-1">
                  <Label className="text-xs">% Participación</Label>
                  <Input
                    value={c.porcentajeParticipacion}
                    onChange={(e) => actualizarCliente(i, "porcentajeParticipacion", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                {clientes.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => eliminarCliente(i)}>
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={agregarCliente}>
              <Plus className="h-4 w-4 mr-1" /> Agregar cliente
            </Button>
          </CardContent>
        </Card>

        {/* Representante Legal */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-[#1e3a5f]">Representante Legal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Primer Apellido <span className="text-red-500">*</span></Label>
                <Input {...register("rlPrimerApellido")} className={err("rlPrimerApellido")} />
              </div>
              <div className="space-y-1">
                <Label>Segundo Apellido <span className="text-red-500">*</span></Label>
                <Input {...register("rlSegundoApellido")} className={err("rlSegundoApellido")} />
              </div>
              <div className="space-y-1">
                <Label>Nombres <span className="text-red-500">*</span></Label>
                <Input {...register("rlNombres")} className={err("rlNombres")} />
              </div>
              <SelectField name="rlTipoIdentificacion" label="Tipo de Identificación" req options={["DUI", "NIT", "Pasaporte", "Carné de Residente"]} />
              <div className="space-y-1">
                <Label>Número de Documento <span className="text-red-500">*</span></Label>
                <Input {...register("rlNumeroDocumento")} className={err("rlNumeroDocumento")} />
              </div>
              <div className="space-y-1">
                <Label>Fecha de Expedición <span className="text-red-500">*</span></Label>
                <Input {...register("rlFechaExpedicion")} type="date" className={err("rlFechaExpedicion")} />
              </div>
              <div className="space-y-1">
                <Label>Lugar de Expedición <span className="text-red-500">*</span></Label>
                <Input {...register("rlLugarExpedicion")} className={err("rlLugarExpedicion")} />
              </div>
              <div className="space-y-1">
                <Label>Fecha de Vencimiento</Label>
                <Input {...register("rlFechaVencimiento")} type="date" />
              </div>
              <SelectField name="rlGenero" label="Género" req options={["Masculino", "Femenino", "Otro"]} />
              <SelectField name="rlEstadoCivil" label="Estado Civil" req options={["Soltero/a", "Casado/a", "Divorciado/a", "Viudo/a", "Unión libre"]} />
              <div className="space-y-1">
                <Label>Fecha de Nacimiento <span className="text-red-500">*</span></Label>
                <Input {...register("rlFechaNacimiento")} type="date" className={err("rlFechaNacimiento")} />
              </div>
              <div className="space-y-1">
                <Label>Lugar de Nacimiento <span className="text-red-500">*</span></Label>
                <Input {...register("rlLugarNacimiento")} className={err("rlLugarNacimiento")} />
              </div>
            </div>

            <Separator />
            <p className="text-sm font-medium text-gray-700">Declaración PEP (Persona Expuesta Políticamente)</p>
            <div className="space-y-2">
              <CheckField name="pepRecursosPublicos" label="Maneja o ha manejado recursos públicos" />
              <CheckField name="pepFamiliaresPublicos" label="Tiene familiares que manejan recursos públicos" />
              <CheckField name="pepCargosPublicos" label="Ejerce o ha ejercido cargos públicos de alto nivel" />
              <CheckField name="pepSistemaLAFT" label="Está vinculado al Sistema LAFT" />
            </div>
          </CardContent>
        </Card>

        {/* Botones */}
        <div className="flex justify-end gap-3 pb-4">
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
    </form>
  );
}
