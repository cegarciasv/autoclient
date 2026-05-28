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
import { Plus, Trash2, Building2, User } from "lucide-react";
import { toast } from "sonner";

// ── Schema base — campos opcionales en Zod; se validan manualmente según tipo ─
const schema = z.object({
  tipoPersona:             z.enum(["NATURAL", "JURIDICA"]),
  razonSocial:             z.string().min(1, "Requerido"),
  nombreComercial:         z.string().optional(), // requerido para JURIDICA
  nit:                     z.string().min(1, "Requerido"),
  actividadReal:           z.string().min(1, "Requerido"),
  tipoEmpresa:             z.string().optional(), // requerido para JURIDICA
  tipoActividadEconomica:  z.string().min(1, "Requerido"),
  obligacionesTributarias: z.boolean(),
  sistemaLAFT:             z.boolean(),
  direccionPrincipal:      z.string().min(1, "Requerido"),
  departamento:            z.string().min(1, "Requerido"),
  ciudad:                  z.string().min(1, "Requerido"),
  correoElectronico:       z.string().email("Correo inválido"),
  telefonoFijo:            z.string().optional(),
  telefonoCelular:         z.string().optional(),
  // Representante Legal — requeridos solo para JURIDICA
  rlPrimerApellido:        z.string().optional(),
  rlSegundoApellido:       z.string().optional(),
  rlNombres:               z.string().optional(),
  rlTipoIdentificacion:    z.string().optional(),
  rlNumeroDocumento:       z.string().optional(),
  rlFechaExpedicion:       z.string().optional(),
  rlLugarExpedicion:       z.string().optional(),
  rlFechaVencimiento:      z.string().optional(),
  rlGenero:                z.string().optional(),
  rlEstadoCivil:           z.string().optional(),
  rlFechaNacimiento:       z.string().optional(),
  rlLugarNacimiento:       z.string().optional(),
  pepRecursosPublicos:     z.boolean(),
  pepFamiliaresPublicos:   z.boolean(),
  pepCargosPublicos:       z.boolean(),
  pepSistemaLAFT:          z.boolean(),
  productoServicio:        z.string().min(1, "Requerido"),

  // ── NRC/IVA — requerido para JURIDICA; validado manualmente ─
  nrc:                      z.string().optional(),
  // ── Campos exclusivos PROVEEDOR (validados manualmente) ─
  codigoActividadEconomica: z.string().optional(),
  categoriaContribuyente:   z.string().optional(),
  nombreContacto:           z.string().optional(),
  correoVendedor:           z.string().optional(),
  correoComprobantes:       z.string().optional(),
  numeroCuentaBancaria:     z.string().optional(),
  titularCuenta:            z.string().optional(),
  tipoCuenta:               z.string().optional(),
  banco:                    z.string().optional(),
});

type Datos = z.infer<typeof schema>;

// Campos requeridos para PERSONA JURÍDICA
const CAMPOS_REQUERIDOS_JURIDICA: (keyof Datos)[] = [
  "nombreComercial", "tipoEmpresa", "nrc",
  "rlPrimerApellido", "rlSegundoApellido", "rlNombres",
  "rlTipoIdentificacion", "rlNumeroDocumento", "rlFechaExpedicion",
  "rlLugarExpedicion", "rlGenero", "rlEstadoCivil",
  "rlFechaNacimiento", "rlLugarNacimiento",
];

// Campos requeridos para PROVEEDOR al hacer clic en "Siguiente"
const CAMPOS_REQUERIDOS_PROVEEDOR: (keyof Datos)[] = [
  "codigoActividadEconomica", "categoriaContribuyente",
  "telefonoCelular",
  "nombreContacto", "correoVendedor", "correoComprobantes",
  "numeroCuentaBancaria", "titularCuenta", "tipoCuenta", "banco",
];

const LABELS_CAMPO: Partial<Record<keyof Datos, string>> = {
  nrc:                      "N° de Registro IVA / NRC",
  codigoActividadEconomica: "Código de Actividad Económica",
  categoriaContribuyente:   "Categoría de Contribuyente",
  telefonoCelular:          "Teléfono Celular",
  nombreContacto:           "Nombre de Contacto",
  correoVendedor:           "Correo del Vendedor",
  correoComprobantes:       "Correo de Comprobantes de Pago",
  numeroCuentaBancaria:     "Número de Cuenta Bancaria",
  titularCuenta:            "Titular de la Cuenta",
  tipoCuenta:               "Tipo de Cuenta",
  banco:                    "Banco",
  nombreComercial:          "Nombre Comercial",
  tipoEmpresa:              "Tipo de Empresa",
  rlPrimerApellido:         "Primer Apellido (Representante Legal)",
  rlSegundoApellido:        "Segundo Apellido (Representante Legal)",
  rlNombres:                "Nombres (Representante Legal)",
  rlTipoIdentificacion:     "Tipo de Identificación (Representante Legal)",
  rlNumeroDocumento:        "Número de Documento (Representante Legal)",
  rlFechaExpedicion:        "Fecha de Expedición (Representante Legal)",
  rlLugarExpedicion:        "Lugar de Expedición (Representante Legal)",
  rlGenero:                 "Género (Representante Legal)",
  rlEstadoCivil:            "Estado Civil (Representante Legal)",
  rlFechaNacimiento:        "Fecha de Nacimiento (Representante Legal)",
  rlLugarNacimiento:        "Lugar de Nacimiento (Representante Legal)",
};

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
  return String(v);
}
function toDate(v: unknown): string {
  if (!v) return "";
  return String(v).slice(0, 10);
}
function toBool(v: unknown): boolean {
  return v === true || v === "true";
}

export default function PasoInfoGeneral({ formulario, guardando, onGuardar }: Props) {
  const ig = (formulario.infoGeneral as Record<string, unknown>) ?? {};
  const tercero = (formulario.tercero as Record<string, unknown>) ?? {};
  const esProveedor = tercero.tipo === "PROVEEDOR";

  const clientesIniciales: ClientePrincipal[] = Array.isArray(formulario.clientesPrincipales)
    ? (formulario.clientesPrincipales as Record<string, unknown>[]).map((c) => ({
        nombreRazonSocial: toStr(c.nombreRazonSocial),
        porcentajeParticipacion: toStr(c.porcentajeParticipacion),
      }))
    : [{ nombreRazonSocial: "", porcentajeParticipacion: "" }];

  const [clientes, setClientes] = useState<ClientePrincipal[]>(clientesIniciales);

  const { register, handleSubmit, getValues, setValue, watch, formState: { errors } } = useForm<Datos>({
    resolver: zodResolver(schema),
    defaultValues: {
      tipoPersona:             ((toStr(tercero.tipoPersona) || "JURIDICA") as "NATURAL" | "JURIDICA"),
      razonSocial:             toStr(ig.razonSocial),
      nombreComercial:         toStr(ig.nombreComercial),
      nit:                     toStr(ig.nit),
      actividadReal:           toStr(ig.actividadReal),
      tipoEmpresa:             toStr(ig.tipoEmpresa),
      tipoActividadEconomica:  toStr(ig.tipoActividadEconomica),
      obligacionesTributarias: toBool(ig.obligacionesTributarias),
      sistemaLAFT:             toBool(ig.sistemaLAFT),
      direccionPrincipal:      toStr(ig.direccionPrincipal),
      departamento:            toStr(ig.departamento),
      ciudad:                  toStr(ig.ciudad),
      correoElectronico:       toStr(ig.correoElectronico),
      telefonoFijo:            toStr(ig.telefonoFijo),
      telefonoCelular:         toStr(ig.telefonoCelular),
      rlPrimerApellido:        toStr(ig.rlPrimerApellido),
      rlSegundoApellido:       toStr(ig.rlSegundoApellido),
      rlNombres:               toStr(ig.rlNombres),
      rlTipoIdentificacion:    toStr(ig.rlTipoIdentificacion),
      rlNumeroDocumento:       toStr(ig.rlNumeroDocumento),
      rlFechaExpedicion:       toDate(ig.rlFechaExpedicion),
      rlLugarExpedicion:       toStr(ig.rlLugarExpedicion),
      rlFechaVencimiento:      toDate(ig.rlFechaVencimiento),
      rlGenero:                toStr(ig.rlGenero),
      rlEstadoCivil:           toStr(ig.rlEstadoCivil),
      rlFechaNacimiento:       toDate(ig.rlFechaNacimiento),
      rlLugarNacimiento:       toStr(ig.rlLugarNacimiento),
      pepRecursosPublicos:     toBool(ig.pepRecursosPublicos),
      pepFamiliaresPublicos:   toBool(ig.pepFamiliaresPublicos),
      pepCargosPublicos:       toBool(ig.pepCargosPublicos),
      pepSistemaLAFT:          toBool(ig.pepSistemaLAFT),
      productoServicio:        toStr(ig.productoServicio),
      // Campos proveedor
      nrc:                      toStr(ig.nrc),
      codigoActividadEconomica: toStr(ig.codigoActividadEconomica),
      categoriaContribuyente:   toStr(ig.categoriaContribuyente),
      nombreContacto:           toStr(ig.nombreContacto),
      correoVendedor:           toStr(ig.correoVendedor),
      correoComprobantes:       toStr(ig.correoComprobantes),
      numeroCuentaBancaria:     toStr(ig.numeroCuentaBancaria),
      titularCuenta:            toStr(ig.titularCuenta),
      tipoCuenta:               toStr(ig.tipoCuenta),
      banco:                    toStr(ig.banco),
    },
  });

  const tipoPersona = watch("tipoPersona");
  const esJuridica = tipoPersona === "JURIDICA";
  const esNatural = tipoPersona === "NATURAL";

  // Valida campos requeridos para persona jurídica
  function validarJuridica(datos: Datos): boolean {
    const faltantes = CAMPOS_REQUERIDOS_JURIDICA.filter((campo) => !datos[campo]);
    if (faltantes.length > 0) {
      const nombres = faltantes.map((c) => LABELS_CAMPO[c] ?? c).join(", ");
      toast.error(`Campos requeridos para persona jurídica: ${nombres}`);
      return false;
    }
    return true;
  }

  // Valida campos requeridos para proveedor
  function validarProveedor(datos: Datos): boolean {
    const faltantes = CAMPOS_REQUERIDOS_PROVEEDOR.filter((campo) => !datos[campo]);
    if (faltantes.length > 0) {
      const nombres = faltantes.map((c) => LABELS_CAMPO[c] ?? c).join(", ");
      toast.error(`Campos requeridos para proveedor: ${nombres}`);
      return false;
    }
    return true;
  }

  async function onSubmit(datos: Datos, siguiente: boolean) {
    if (siguiente && esJuridica && !validarJuridica(datos)) return;
    if (siguiente && esProveedor && !validarProveedor(datos)) return;
    await onGuardar({ infoGeneral: datos, clientesPrincipales: clientes }, siguiente);
  }

  async function guardarBorrador() {
    const datos = getValues();
    await onGuardar({ infoGeneral: datos, clientesPrincipales: clientes }, false);
  }

  const err = (campo: keyof Datos) => errors[campo] ? "border-red-500" : "";
  const req = (campo: keyof Datos) =>
    (esProveedor && CAMPOS_REQUERIDOS_PROVEEDOR.includes(campo)) ||
    (esJuridica && CAMPOS_REQUERIDOS_JURIDICA.includes(campo));

  // Determina si un campo debe mostrar asterisco de requerido
  function campoRequerido(name: keyof Datos): boolean {
    if (name === "telefonoCelular") return esProveedor;
    if (CAMPOS_REQUERIDOS_JURIDICA.includes(name)) return esJuridica;
    const shape = schema.shape[name];
    return shape ? !shape.isOptional() : false;
  }

  function SelectField({ name, label, options }: {
    name: keyof Datos; label: string; options: string[];
  }) {
    return (
      <div className="space-y-1">
        <Label>
          {label}
          {campoRequerido(name) && <span className="text-red-500 ml-0.5">*</span>}
        </Label>
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
        {errors[name] && <p className="text-xs text-red-500">{errors[name]?.message}</p>}
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

  function Field({ name, label, type = "text", placeholder }: {
    name: keyof Datos; label: string; type?: string; placeholder?: string;
  }) {
    return (
      <div className="space-y-1">
        <Label>
          {label}
          {campoRequerido(name) && <span className="text-red-500 ml-0.5">*</span>}
        </Label>
        <Input {...register(name)} type={type} placeholder={placeholder} className={err(name)} />
        {errors[name] && <p className="text-xs text-red-500">{errors[name]?.message}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit((d) => onSubmit(d, true))(); }}>
      <div className="space-y-6">

        {/* ── Tipo de Persona ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-[#1B3C22]">Tipo de Persona</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setValue("tipoPersona", "JURIDICA")}
                className={`flex items-center gap-2 px-5 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  tipoPersona === "JURIDICA"
                    ? "bg-[#1A7A30] text-white border-[#1A7A30]"
                    : "border-gray-200 text-gray-600 hover:border-[#1A7A30] hover:text-[#1A7A30]"
                }`}
              >
                <Building2 className="h-4 w-4" />
                Persona Jurídica
              </button>
              <button
                type="button"
                onClick={() => setValue("tipoPersona", "NATURAL")}
                className={`flex items-center gap-2 px-5 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  tipoPersona === "NATURAL"
                    ? "bg-[#1A7A30] text-white border-[#1A7A30]"
                    : "border-gray-200 text-gray-600 hover:border-[#1A7A30] hover:text-[#1A7A30]"
                }`}
              >
                <User className="h-4 w-4" />
                Persona Natural
              </button>
            </div>
            {esNatural && (
              <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-1.5">
                Los campos marcados con * son obligatorios. El resto son opcionales para persona natural.
              </p>
            )}
          </CardContent>
        </Card>

        {/* ── Datos de la Empresa ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-[#1B3C22]">Datos de la Empresa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field name="razonSocial"    label={esNatural ? "Nombre Completo" : "Razón Social"} />
              <Field name="nombreComercial" label="Nombre Comercial" />
              <Field name="nit"            label="NIT" placeholder="0000-000000-000-0" />
              <Field name="nrc" label="N° de Registro IVA / NRC" placeholder="Ej: 12345-6" />
              <Field name="actividadReal"  label="Giro / Actividad Real" />
              <SelectField name="tipoEmpresa" label="Tipo de Empresa" options={[
                "Sociedad Anónima", "Sociedad de Responsabilidad Limitada", "Empresa Individual",
                "Cooperativa", "ONG / Asociación", "Otro",
              ]} />
              <SelectField name="tipoActividadEconomica" label="Tipo de Actividad Económica" options={[
                "Comercio", "Industria / Manufactura", "Servicios", "Agropecuaria", "Construcción", "Otro",
              ]} />
              {esProveedor && (
                <Field name="codigoActividadEconomica" label="Código de Actividad Económica" placeholder="Ej: 4711" />
              )}
              {esProveedor && (
                <SelectField name="categoriaContribuyente" label="Categoría de Contribuyente" options={[
                  "Grande contribuyente", "Mediano contribuyente", "Pequeño contribuyente", "Otro",
                ]} />
              )}
              <Field name="productoServicio" label="Producto / Servicio principal" />
            </div>
            <div className="space-y-2 pt-1">
              <CheckField name="obligacionesTributarias" label="Declara que cumple con las obligaciones tributarias y fiscales vigentes" />
              <CheckField name="sistemaLAFT" label="Cuenta con Sistema de Prevención de Lavado de Activos y Financiamiento al Terrorismo (LAFT)" />
            </div>
          </CardContent>
        </Card>

        {/* ── Dirección y Contacto ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-[#1B3C22]">Dirección y Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <Label>Dirección Principal <span className="text-red-500">*</span></Label>
                <Input {...register("direccionPrincipal")} className={err("direccionPrincipal")} />
              </div>
              <Field name="departamento" label="Departamento" />
              <Field name="ciudad"       label="Ciudad / Municipio" />
              <Field name="correoElectronico" label="Correo Electrónico" type="email" />
              <div className="space-y-1">
                <Label>Teléfono Fijo</Label>
                <Input {...register("telefonoFijo")} placeholder="2222-2222" />
              </div>
              <div className="space-y-1">
                <Label>
                  Teléfono Celular
                  {esProveedor && <span className="text-red-500 ml-0.5">*</span>}
                </Label>
                <Input {...register("telefonoCelular")} placeholder="7777-7777" className={err("telefonoCelular")} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Datos de Contacto Comercial (solo PROVEEDOR) ── */}
        {esProveedor && (
          <Card className="border-[#1A7A30]/30 bg-[#1A7A30]/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-[#1B3C22] flex items-center gap-2">
                Datos de Contacto Comercial
                <span className="text-xs font-normal text-[#1A7A30] bg-green-100 px-2 py-0.5 rounded-full">Solo Proveedores</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field name="nombreContacto"    label="Nombre del Contacto / Vendedor" />
                <Field name="correoVendedor"    label="Correo del Vendedor" type="email" />
                <div className="space-y-1 sm:col-span-2">
                  <Label>Correo para Recepción de Comprobantes de Pago <span className="text-red-500">*</span></Label>
                  <Input {...register("correoComprobantes")} type="email" className={err("correoComprobantes")} />
                  <p className="text-xs text-gray-400">A este correo se enviarán los comprobantes de pago electrónicos.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Clientes Principales ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-[#1B3C22]">Clientes Principales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {clientes.map((c, i) => (
              <div key={i} className="flex gap-2 items-end">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Nombre / Razón Social</Label>
                  <Input
                    value={c.nombreRazonSocial}
                    onChange={(e) => {
                      const n = [...clientes]; n[i] = { ...n[i], nombreRazonSocial: e.target.value }; setClientes(n);
                    }}
                  />
                </div>
                <div className="w-28 space-y-1">
                  <Label className="text-xs">% Participación</Label>
                  <Input
                    value={c.porcentajeParticipacion}
                    onChange={(e) => {
                      const n = [...clientes]; n[i] = { ...n[i], porcentajeParticipacion: e.target.value }; setClientes(n);
                    }}
                    placeholder="0.00"
                  />
                </div>
                {clientes.length > 1 && (
                  <Button type="button" variant="ghost" size="icon"
                    onClick={() => setClientes(clientes.filter((_, idx) => idx !== i))}>
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm"
              onClick={() => setClientes([...clientes, { nombreRazonSocial: "", porcentajeParticipacion: "" }])}>
              <Plus className="h-4 w-4 mr-1" /> Agregar cliente
            </Button>
          </CardContent>
        </Card>

        {/* ── Información Bancaria (solo PROVEEDOR) ── */}
        {esProveedor && (
          <Card className="border-emerald-200 bg-emerald-50/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-[#1B3C22] flex items-center gap-2">
                Información Bancaria
                <span className="text-xs font-normal text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Solo Proveedores</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500">
                Proporcione los datos bancarios para el procesamiento de pagos. Prioridad banco Cuscatlán.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <Label>Número de Cuenta Bancaria <span className="text-red-500">*</span></Label>
                  <Input
                    {...register("numeroCuentaBancaria")}
                    placeholder="Sin guiones (ej: 10281234567890)"
                    className={err("numeroCuentaBancaria")}
                  />
                  <p className="text-xs text-gray-400">Ingrese el número sin guiones ni espacios.</p>
                </div>
                <Field name="titularCuenta" label="Titular de la Cuenta" />
                <SelectField name="tipoCuenta" label="Tipo de Cuenta" options={[
                  "Ahorro", "Corriente",
                ]} />
                <SelectField name="banco" label="Banco" options={[
                  "Banco Cuscatlán", "Banco Agrícola", "Banco de América Central (BAC)",
                  "Banco Davivienda", "Banco G&T Continental", "Banco Promerica",
                  "Scotiabank", "Citibank", "Banco Hipotecario", "Otro",
                ]} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Representante Legal ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-[#1B3C22]">
              Representante Legal
              {esNatural && (
                <span className="ml-2 text-xs font-normal text-gray-400">(Opcional para persona natural)</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {esNatural && (
              <p className="text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                Si usted es el titular, puede completar esta sección con sus propios datos o dejarla en blanco.
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field name="rlPrimerApellido"     label="Primer Apellido" />
              <Field name="rlSegundoApellido"    label="Segundo Apellido" />
              <Field name="rlNombres"            label="Nombres" />
              <SelectField name="rlTipoIdentificacion" label="Tipo de Identificación" options={[
                "DUI", "NIT", "Pasaporte", "Carné de Residente",
              ]} />
              <Field name="rlNumeroDocumento"    label="Número de Documento" />
              <Field name="rlFechaExpedicion"    label="Fecha de Expedición" type="date" />
              <Field name="rlLugarExpedicion"    label="Lugar de Expedición" />
              <div className="space-y-1">
                <Label>Fecha de Vencimiento</Label>
                <Input {...register("rlFechaVencimiento")} type="date" />
              </div>
              <SelectField name="rlGenero"       label="Género" options={["Masculino", "Femenino", "Otro"]} />
              <SelectField name="rlEstadoCivil"  label="Estado Civil" options={[
                "Soltero/a", "Casado/a", "Divorciado/a", "Viudo/a", "Unión libre",
              ]} />
              <Field name="rlFechaNacimiento"    label="Fecha de Nacimiento" type="date" />
              <Field name="rlLugarNacimiento"    label="Lugar de Nacimiento" />
            </div>

            <Separator />
            <p className="text-sm font-medium text-gray-700">Declaración PEP (Persona Expuesta Políticamente)</p>
            <div className="space-y-2">
              <CheckField name="pepRecursosPublicos"   label="Maneja o ha manejado recursos públicos" />
              <CheckField name="pepFamiliaresPublicos" label="Tiene familiares que manejan recursos públicos" />
              <CheckField name="pepCargosPublicos"     label="Ejerce o ha ejercido cargos públicos de alto nivel" />
              <CheckField name="pepSistemaLAFT"        label="Está vinculado al Sistema LAFT" />
            </div>
          </CardContent>
        </Card>

        {/* ── Botones ── */}
        <div className="flex justify-end gap-3 pb-4">
          <Button type="button" variant="outline" disabled={guardando} onClick={guardarBorrador}>
            Guardar borrador
          </Button>
          <Button type="submit" disabled={guardando} className="bg-[#1A7A30] hover:bg-[#155E25]">
            {guardando ? "Guardando..." : "Siguiente →"}
          </Button>
        </div>
      </div>
    </form>
  );
}
