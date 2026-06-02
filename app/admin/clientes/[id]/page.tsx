import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, FileText, CheckCircle2, Clock, Loader2,
  Building2, MapPin, User, Users, DollarSign, Phone, ShieldCheck,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import VisorDocumentos from "@/components/admin/VisorDocumentos";
import BotonesEstado from "@/components/admin/BotonesEstado";

/* ── Helpers ─────────────────────────────────────── */
function fmtFecha(v: unknown): string {
  if (!v) return "—";
  try {
    const d = new Date(String(v));
    if (isNaN(d.getTime()) || d.getFullYear() === 1900) return "—";
    return d.toLocaleDateString("es-SV");
  } catch { return "—"; }
}
function fmtMoney(v: unknown): string {
  const n = Number(v);
  if (!v || isNaN(n) || n === 0) return "—";
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}
function fmtBool(v: unknown): string { return v ? "Sí" : "No"; }
function val(v: unknown): string {
  if (v == null || v === "") return "—";
  return String(v);
}

/* ── Componentes ─────────────────────────────────── */
function InfoItem({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? "col-span-2" : ""}>
      <dt className="text-xs text-gray-400 uppercase tracking-wide font-medium">{label}</dt>
      <dd className="text-sm font-medium text-gray-800 mt-0.5 leading-snug">{value}</dd>
    </div>
  );
}

function SeccionHeader({ icon: Icon, titulo }: { icon: React.ElementType; titulo: string }) {
  return (
    <CardHeader className="pb-3 border-b border-gray-100">
      <CardTitle className="text-sm font-semibold text-[#1E3A8A] flex items-center gap-2">
        <Icon className="h-4 w-4" />
        {titulo}
      </CardTitle>
    </CardHeader>
  );
}

function EstadoBadge({ estado }: { estado: string }) {
  const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    PENDIENTE:  { label: "Pendiente",  cls: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: <Clock className="h-3 w-3" /> },
    EN_PROCESO: { label: "En proceso", cls: "bg-[#2B5BE2]/10 text-[#1E3A8A] border-[#2B5BE2]/20",       icon: <Loader2 className="h-3 w-3" /> },
    COMPLETADO: { label: "Completado", cls: "bg-blue-100 text-blue-800 border-blue-200",    icon: <CheckCircle2 className="h-3 w-3" /> },
  };
  const e = map[estado] ?? { label: estado, cls: "", icon: null };
  return (
    <Badge variant="outline" className={`flex items-center gap-1 ${e.cls}`}>
      {e.icon} {e.label}
    </Badge>
  );
}

function PepCheck({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <span className={`mt-0.5 shrink-0 h-4 w-4 rounded-sm border flex items-center justify-center text-xs font-bold
        ${value ? "bg-red-100 border-red-300 text-red-600" : "bg-gray-50 border-gray-200 text-gray-400"}`}>
        {value ? "✓" : "—"}
      </span>
      <span className="text-sm text-gray-700 leading-snug">{label}</span>
    </div>
  );
}

/* ── Página ──────────────────────────────────────── */
export default async function DetalleClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tercero = await prisma.tercero.findUnique({
    where: { id },
    include: {
      formulario: {
        include: {
          infoGeneral:        true,
          accionistas:        true,
          clientesPrincipales: true,
          infoFinanciera:     true,
          referencias:        true,
          documentos:         true,
        },
      },
    },
  });

  if (!tercero || tercero.tipo !== "CLIENTE") notFound();
  const f = tercero.formulario;
  const ig = f?.infoGeneral;

  return (
    <div className="space-y-5 max-w-5xl">

      {/* ── Header ── */}
      <div className="flex items-start gap-4 flex-wrap">
        <Link href="/admin/clientes" className={buttonVariants({ variant: "outline", size: "sm" })}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Volver
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900 leading-tight">{tercero.razonSocial}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {tercero.tipoDocumento}: {tercero.numeroDocumento} · {tercero.email}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Creado el {new Date(tercero.creadoEn).toLocaleDateString("es-SV")}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <EstadoBadge estado={tercero.estado} />
          <BotonesEstado
            terceroId={tercero.id}
            estadoActual={tercero.estado}
            tieneFormulario={!!f}
          />
          {f && (
            <a
              href={`/api/admin/terceros/${tercero.id}/pdf`}
              target="_blank"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <FileText className="h-4 w-4 mr-1" /> Descargar PDF
            </a>
          )}
        </div>
      </div>

      {/* ── Sin formulario ── */}
      {!f && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-4">
            <p className="text-sm text-yellow-700">El cliente aún no ha iniciado el formulario.</p>
          </CardContent>
        </Card>
      )}

      {/* ── Progreso ── */}
      {f && (() => {
        const completado = tercero.estado === "COMPLETADO" || f.estado === "COMPLETADO";
        const pct = completado ? 100 : f.progreso;
        const barColor = completado
          ? "bg-gradient-to-r from-blue-400 to-blue-600"
          : pct >= 70 ? "bg-gradient-to-r from-[#2B5BE2] to-[#1E3A8A]"
          : pct >= 40 ? "bg-gradient-to-r from-amber-400 to-amber-600"
          : "bg-gradient-to-r from-red-400 to-red-600";
        return (
          <Card className={completado ? "border-blue-200 bg-blue-50/40" : ""}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-sm font-medium text-gray-700">Progreso del formulario</p>
                <span className={`text-sm font-bold ${completado ? "text-blue-700" : "text-[#1E3A8A]"}`}>
                  {pct}%{completado ? " — Completado ✓" : ""}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className={`${barColor} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {completado ? "El cliente finalizó el formulario y cargó todos los documentos." : `Paso ${f.pasoActual} de 6`}
              </p>
            </CardContent>
          </Card>
        );
      })()}

      {/* ── Información de la Empresa ── */}
      {ig && (
        <Card>
          <SeccionHeader icon={Building2} titulo="Información de la Empresa" />
          <CardContent className="pt-4">
            <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 text-sm">
              <InfoItem label="Razón Social"          value={val(ig.razonSocial)} />
              <InfoItem label="Nombre Comercial"      value={val(ig.nombreComercial)} />
              <InfoItem label="NIT"                   value={val(ig.nit)} />
              <InfoItem label="Número de IVA"         value={val(ig.iva)} />
              <InfoItem label="Tipo de Empresa"       value={val(ig.tipoEmpresa)} />
              <InfoItem label="Actividad Económica"   value={val(ig.tipoActividadEconomica)} />
              <InfoItem label="Actividad Real / Giro" value={val(ig.actividadReal)} wide />
              <InfoItem label="Producto / Servicio"   value={val(ig.productoServicio)} wide />
              <InfoItem label="Obligaciones Tributarias" value={fmtBool(ig.obligacionesTributarias)} />
              <InfoItem label="Sistema LAFT"          value={fmtBool(ig.sistemaLAFT)} />
            </dl>
          </CardContent>
        </Card>
      )}

      {/* ── Dirección ── */}
      {ig && (
        <Card>
          <SeccionHeader icon={MapPin} titulo="Dirección y Contacto" />
          <CardContent className="pt-4">
            <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 text-sm">
              <InfoItem label="Dirección Principal" value={val(ig.direccionPrincipal)} wide />
              <InfoItem label="Departamento"        value={val(ig.departamento)} />
              <InfoItem label="Ciudad / Municipio"  value={val(ig.ciudad)} />
              <InfoItem label="Correo Electrónico"  value={val(ig.correoElectronico)} />
              <InfoItem label="Teléfono Fijo"       value={val(ig.telefonoFijo)} />
              <InfoItem label="Teléfono Celular"    value={val(ig.telefonoCelular)} />
            </dl>
          </CardContent>
        </Card>
      )}

      {/* ── Representante Legal ── */}
      {ig && (
        <Card>
          <SeccionHeader icon={User} titulo="Representante Legal" />
          <CardContent className="pt-4 space-y-4">
            <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 text-sm">
              <InfoItem label="Nombres"                value={val(ig.rlNombres)} />
              <InfoItem label="Primer Apellido"        value={val(ig.rlPrimerApellido)} />
              <InfoItem label="Segundo Apellido"       value={val(ig.rlSegundoApellido)} />
              <InfoItem label="Tipo Identificación"    value={val(ig.rlTipoIdentificacion)} />
              <InfoItem label="Número de Documento"    value={val(ig.rlNumeroDocumento)} />
              <InfoItem label="Fecha de Expedición"    value={fmtFecha(ig.rlFechaExpedicion)} />
              <InfoItem label="Lugar de Expedición"    value={val(ig.rlLugarExpedicion)} />
              <InfoItem label="Fecha de Vencimiento"   value={fmtFecha(ig.rlFechaVencimiento)} />
              <InfoItem label="Género"                 value={val(ig.rlGenero)} />
              <InfoItem label="Estado Civil"           value={val(ig.rlEstadoCivil)} />
              <InfoItem label="Fecha de Nacimiento"    value={fmtFecha(ig.rlFechaNacimiento)} />
              <InfoItem label="Lugar de Nacimiento"    value={val(ig.rlLugarNacimiento)} />
            </dl>

            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> Declaración PEP
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <PepCheck label="Maneja o ha manejado recursos públicos"       value={Boolean(ig.pepRecursosPublicos)} />
                <PepCheck label="Familiares con recursos o cargos públicos"    value={Boolean(ig.pepFamiliaresPublicos)} />
                <PepCheck label="Ocupa o ha ocupado cargos públicos"           value={Boolean(ig.pepCargosPublicos)} />
                <PepCheck label="Vinculado a sistema de prevención LAFT"       value={Boolean(ig.pepSistemaLAFT)} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Clientes Principales ── */}
      {f && f.clientesPrincipales.length > 0 && (
        <Card>
          <SeccionHeader icon={Users} titulo="Clientes Principales" />
          <CardContent className="pt-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-xs text-gray-400 font-medium uppercase">Nombre / Razón Social</th>
                  <th className="text-right py-2 text-xs text-gray-400 font-medium uppercase w-32">% Participación</th>
                </tr>
              </thead>
              <tbody>
                {f.clientesPrincipales.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2 text-gray-800 font-medium">{val(c.nombreRazonSocial)}</td>
                    <td className="py-2 text-right text-gray-600">{val(c.porcentajeParticipacion)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* ── Accionistas ── */}
      {f && f.accionistas.length > 0 && (
        <Card>
          <SeccionHeader icon={Users} titulo="Accionistas" />
          <CardContent className="pt-3 overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-xs text-gray-400 font-medium uppercase">Nombre / Razón Social</th>
                  <th className="text-left py-2 text-xs text-gray-400 font-medium uppercase">Tipo ID</th>
                  <th className="text-left py-2 text-xs text-gray-400 font-medium uppercase">Documento</th>
                  <th className="text-right py-2 text-xs text-gray-400 font-medium uppercase">% Part.</th>
                  <th className="text-center py-2 text-xs text-gray-400 font-medium uppercase">PEP</th>
                  <th className="text-left py-2 text-xs text-gray-400 font-medium uppercase">País</th>
                </tr>
              </thead>
              <tbody>
                {f.accionistas.map((a) => {
                  const esPep = a.recursosPublicos || a.cargoPoder || a.reconocidoPublicamente;
                  return (
                    <tr key={a.id} className="border-b border-gray-50 last:border-0">
                      <td className="py-2 text-gray-800 font-medium">{val(a.nombreRazonSocial)}</td>
                      <td className="py-2 text-gray-600">{val(a.tipoIdentificacion)}</td>
                      <td className="py-2 text-gray-600">{val(a.numeroDocumento)}</td>
                      <td className="py-2 text-right text-gray-600">{Number(a.porcentajeParticipacion).toFixed(2)}%</td>
                      <td className="py-2 text-center">
                        {esPep
                          ? <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">PEP</span>
                          : <span className="text-xs text-gray-300">—</span>}
                      </td>
                      <td className="py-2 text-gray-600">{val(a.declaracionPais)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* ── Información Financiera ── */}
      {f?.infoFinanciera && (
        <Card>
          <SeccionHeader icon={DollarSign} titulo="Información Financiera" />
          <CardContent className="pt-4">
            <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 text-sm">
              <InfoItem label="Total Activo"              value={fmtMoney(f.infoFinanciera.totalActivo)} />
              <InfoItem label="Total Pasivo"              value={fmtMoney(f.infoFinanciera.totalPasivo)} />
              <InfoItem label="Total Patrimonio"          value={fmtMoney(f.infoFinanciera.totalPatrimonio)} />
              <InfoItem label="Ingresos Mensuales"        value={fmtMoney(f.infoFinanciera.ingresosMensuales)} />
              <InfoItem label="Egresos Mensuales"         value={fmtMoney(f.infoFinanciera.egresosMensuales)} />
              <InfoItem label="Otros Ingresos Mensuales"  value={fmtMoney(f.infoFinanciera.otrosIngresosMensuales)} />
              {f.infoFinanciera.fuenteOtrosIngresos && (
                <InfoItem label="Fuente Otros Ingresos"  value={val(f.infoFinanciera.fuenteOtrosIngresos)} wide />
              )}
              <InfoItem label="Operaciones Internacionales" value={fmtBool(f.infoFinanciera.operacionesInternacionales)} />
              {f.infoFinanciera.detalleOperaciones && (
                <InfoItem label="Detalle Operaciones Internacionales" value={val(f.infoFinanciera.detalleOperaciones)} wide />
              )}
            </dl>
          </CardContent>
        </Card>
      )}

      {/* ── Referencias Comerciales ── */}
      {f && f.referencias.length > 0 && (
        <Card>
          <SeccionHeader icon={Phone} titulo="Referencias Comerciales" />
          <CardContent className="pt-3">
            <div className="space-y-3">
              {f.referencias.map((r, i) => (
                <div key={r.id} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                  <p className="text-xs text-gray-400 uppercase font-medium mb-2">Referencia {i + 1}</p>
                  <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-sm">
                    <InfoItem label="Nombre / Razón Social" value={val(r.nombreRazonSocial)} wide />
                    <InfoItem label="Teléfono Fijo"         value={val(r.telefonoFijo)} />
                    <InfoItem label="Teléfono Celular"      value={val(r.telefonoCelular)} />
                    <InfoItem label="Dirección"             value={val(r.direccion)} wide />
                  </dl>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Documentos ── */}
      {f && f.documentos.length > 0 && (
        <Card>
          <SeccionHeader icon={FileText} titulo={`Documentos cargados (${f.documentos.length})`} />
          <CardContent className="pt-3 pb-2">
            <VisorDocumentos
              terceroId={tercero.id}
              documentos={f.documentos.map((d) => ({
                id: d.id,
                nombreArchivo: d.nombreArchivo,
                tipo: d.tipo,
                tamanoBytes: d.tamanoBytes,
              }))}
            />
          </CardContent>
        </Card>
      )}

      {f && f.documentos.length === 0 && f.progreso === 100 && (
        <Card className="border-gray-100">
          <CardContent className="pt-4">
            <p className="text-sm text-gray-400 text-center">Aún no se han cargado documentos.</p>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
