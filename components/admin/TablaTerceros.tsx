"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Plus, Send, Eye, Copy, Pencil } from "lucide-react";
import EliminarTerceroButton from "@/components/admin/EliminarTerceroButton";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface Tercero {
  id: string;
  razonSocial: string;
  tipoDocumento: string;
  numeroDocumento: string;
  email: string;
  estado: string;
  creadoEn: string;
  tipoPersona?: string | null;
  formulario?: { progreso: number; pasoActual: number } | null;
}

interface Props {
  tipo: "clientes" | "proveedores";
  terceros: Tercero[];
  esAdmin: boolean;
}

const ESTADO_MAP = {
  PENDIENTE: {
    label: "Pendiente",
    cls: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
    pulse: false,
  },
  EN_PROCESO: {
    label: "En proceso",
    cls: "bg-[#fff3e3] text-[#a75c17] border-[#f4dfc7]",
    dot: "bg-[#c98542]",
    pulse: false,
  },
  COMPLETADO: {
    label: "Completado",
    cls: "bg-[#e8f5ee] text-[#16734d] border-[#cee8d8]",
    dot: "bg-[var(--brand-primary)]",
    pulse: false,
  },
};

function getAvatarColors(tipo: "clientes" | "proveedores") {
  return tipo === "clientes"
    ? "bg-[var(--brand-primary)]/10 text-[var(--brand-dark)]"
    : "bg-slate-100 text-slate-700";
}

function getProgressColor(pct: number) {
  if (pct < 30) return "bg-slate-400";
  if (pct < 70) return "bg-[#657586]";
  return "bg-[var(--brand-primary)]";
}

export default function TablaTerceros({ tipo, terceros: inicial, esAdmin }: Props) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  const [enviando, setEnviando] = useState<string | null>(null);
  const [copiando, setCopiando] = useState<string | null>(null);

  const filtrados = inicial.filter(
    (t) => (filtroEstado === "TODOS" || t.estado === filtroEstado) && (
      t.razonSocial.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.numeroDocumento.includes(busqueda)
    )
  );

  async function reenviarLink(id: string, razonSocial: string) {
    setEnviando(id);
    try {
      const res = await fetch(`/api/admin/terceros/${id}`, { method: "POST" });
      if (res.ok) {
        toast.success(`Link reenviado a ${razonSocial}`);
      } else {
        toast.error("Error al reenviar el link");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setEnviando(null);
    }
  }

  async function copiarLink(id: string) {
    setCopiando(id);
    try {
      const res = await fetch(`/api/admin/terceros/${id}`, { method: "PATCH" });
      if (!res.ok) throw new Error("No se pudo obtener el enlace");
      const { url } = (await res.json()) as { url: string };
      await navigator.clipboard.writeText(url);
      toast.success("Enlace copiado al portapapeles");
    } catch {
      toast.error("No se pudo copiar el enlace");
    } finally {
      setCopiando(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Barra de acciones */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Buscar por nombre, correo o documento..."
            aria-label="Buscar registros"
            className="pl-10 h-11 rounded-xl border-slate-200 bg-white focus:border-[var(--brand-primary)] focus:ring-[var(--brand-primary)]/20 transition-colors"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <Link
          href={`/admin/${tipo}/nuevo`}
          className={buttonVariants({
            className:
              "brand-button min-h-11 w-full sm:w-auto rounded-xl px-5",
          })}
        >
          <Plus className="h-4 w-4 mr-2" />
          {tipo === "clientes" ? "Nuevo cliente" : "Nuevo proveedor"}
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Filtrar por estado">
        {[
          { value: "TODOS", label: "Todos" },
          { value: "PENDIENTE", label: "Pendientes" },
          { value: "EN_PROCESO", label: "En proceso" },
          { value: "COMPLETADO", label: "Completados" },
        ].map(({ value, label }) => {
          const count = value === "TODOS" ? inicial.length : inicial.filter((t) => t.estado === value).length;
          return <button key={value} type="button" onClick={() => setFiltroEstado(value)}
            aria-pressed={filtroEstado === value}
            className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors brand-focus ${filtroEstado === value ? "border-[var(--brand-primary)]/30 bg-[#e9f4ef] text-[var(--brand-dark)]" : "border-[#e2e8ec] bg-white text-[#52657a] hover:border-[var(--brand-primary)]/40"}`}>
            {label} <span className="ml-1 tabular-nums opacity-70">{count}</span>
          </button>;
        })}
      </div>

      {/* En pantallas pequeñas cada registro conserva sus acciones visibles. */}
      <div className="grid gap-3 md:hidden">
        {filtrados.length === 0 && (
          <div className="surface-card px-6 py-12 text-center text-sm text-slate-500">
            No se encontraron registros{busqueda ? " para esta búsqueda" : ""}.
          </div>
        )}
        {filtrados.map((t) => {
          const estado = ESTADO_MAP[t.estado as keyof typeof ESTADO_MAP] ?? {
            label: t.estado, cls: "bg-slate-100 text-slate-700 border-slate-200", dot: "bg-slate-400", pulse: false,
          };
          return (
            <article key={t.id} className="surface-card p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 leading-snug break-words">{t.razonSocial}</p>
                  <p className="mt-1 text-xs text-slate-500 break-all">{t.email}</p>
                </div>
                <Badge variant="outline" className={`${estado.cls} shrink-0 gap-1.5 text-xs`}>
                  <span className={`size-1.5 rounded-full ${estado.dot}`} />{estado.label}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
                <span className="break-all"><span className="font-semibold text-slate-700">{t.tipoDocumento}</span> · {t.numeroDocumento}</span>
                <span className="shrink-0 font-semibold tabular-nums text-slate-700">{t.formulario ? `${t.formulario.progreso}%` : "Sin iniciar"}</span>
              </div>
              {t.formulario && <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${getProgressColor(t.formulario.progreso)}`} style={{ width: `${t.formulario.progreso}%` }} /></div>}
              <div className="flex flex-wrap gap-2 pt-1 [&>*]:basis-[calc(50%-0.25rem)]">
                <Button variant="outline" onClick={() => copiarLink(t.id)} disabled={copiando === t.id} className="min-h-11 flex-1 rounded-lg" aria-label={`Copiar enlace de ${t.razonSocial}`}><Copy className="size-4" /> Copiar</Button>
                <Button variant="outline" onClick={() => reenviarLink(t.id, t.razonSocial)} disabled={enviando === t.id} className="min-h-11 flex-1 rounded-xl" aria-label={`Reenviar enlace a ${t.razonSocial}`}><Send className="size-4" /> Reenviar</Button>
                <Link href={`/admin/${tipo}/${t.id}`} className={buttonVariants({variant: "outline", className: "min-h-11 flex-1 rounded-xl"})} aria-label={`Ver detalle de ${t.razonSocial}`}><Eye className="size-4" /> Ver</Link>
                <Link href={`/admin/${tipo}/${t.id}/editar`} className={buttonVariants({variant: "outline", className: "min-h-11 flex-1 rounded-lg"})} aria-label={`Editar ${t.razonSocial}`}><Pencil className="size-4" /> Editar</Link>
                {esAdmin && !t.formulario && <EliminarTerceroButton id={t.id} nombre={t.razonSocial} tipo={tipo} />}
              </div>
            </article>
          );
        })}
      </div>

      {/* Tabla de escritorio */}
      <div className="surface-card hidden md:block overflow-x-auto">
        <Table className="min-w-[1100px]">
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50 border-slate-100">
              <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
                Razón Social
              </TableHead>
              <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
                Tipo
              </TableHead>
              <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
                Documento
              </TableHead>
              <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
                Email
              </TableHead>
              <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
                Estado
              </TableHead>
              <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
                Progreso
              </TableHead>
              <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-14 text-slate-400"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Search className="h-8 w-8 text-slate-300" />
                    <span className="text-sm font-medium">
                      No se encontraron registros
                    </span>
                    {busqueda && (
                      <span className="text-xs text-slate-400">
                        Intenta con otro término de búsqueda
                      </span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtrados.map((t) => {
                const estado =
                  ESTADO_MAP[t.estado as keyof typeof ESTADO_MAP] ?? {
                    label: t.estado,
                    cls: "bg-slate-100 text-slate-700 border-slate-200",
                    dot: "bg-slate-400",
                    pulse: false,
                  };
                const initials = t.razonSocial
                  .trim()
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((w) => w[0]?.toUpperCase() ?? "")
                  .join("");
                const avatarColors = getAvatarColors(tipo);

                // El tipo de persona solo se muestra si el formulario fue iniciado
                const tipoDefinido = t.formulario && t.formulario.progreso > 0;

                return (
                  <TableRow
                    key={t.id}
                    className="group hover:bg-[var(--brand-primary)]/5 transition-colors duration-150 border-l-2 border-transparent hover:border-[var(--brand-primary)]"
                  >
                    {/* Razón Social con avatar */}
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${avatarColors}`}
                        >
                          {initials}
                        </div>
                        <span className="font-semibold text-slate-800 text-sm max-w-[160px] truncate">
                          {t.razonSocial}
                        </span>
                      </div>
                    </TableCell>

                    {/* Tipo Persona — solo visible si el formulario ya fue iniciado */}
                    <TableCell>
                      {tipoDefinido ? (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                          t.tipoPersona === "NATURAL"
                            ? "bg-[#e9f4ef] text-[var(--brand-dark)] border-[var(--brand-primary)]/20"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}>
                          {t.tipoPersona === "NATURAL" ? "Natural" : "Jurídica"}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Sin definir</span>
                      )}
                    </TableCell>

                    {/* Documento */}
                    <TableCell className="text-sm text-slate-600">
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide mr-1.5 bg-slate-100 px-1.5 py-0.5 rounded">
                        {t.tipoDocumento}
                      </span>
                      {t.numeroDocumento}
                    </TableCell>

                    {/* Email */}
                    <TableCell className="text-sm text-slate-500 max-w-[180px] truncate">
                      {t.email}
                    </TableCell>

                    {/* Estado */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${estado.cls} flex items-center gap-1.5 w-fit text-xs font-medium px-2 py-0.5`}
                      >
                        <span
                          className={`inline-block w-1.5 h-1.5 rounded-full ${estado.dot} ${
                            estado.pulse ? "animate-pulse" : ""
                          }`}
                        />
                        {estado.label}
                      </Badge>
                    </TableCell>

                    {/* Progreso */}
                    <TableCell>
                      {t.formulario ? (
                        <div className="flex items-center gap-2 min-w-[90px]">
                          <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(
                                t.formulario.progreso
                              )}`}
                              style={{ width: `${t.formulario.progreso}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-slate-600 tabular-nums w-8 text-right">
                            {t.formulario.progreso}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          Sin iniciar
                        </span>
                      )}
                    </TableCell>

                    {/* Acciones */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copiarLink(t.id)}
                            disabled={copiando === t.id}
                            title="Copiar enlace de formulario"
                            aria-label={`Copiar enlace de ${t.razonSocial}`}
                            className="h-10 w-10 p-0 text-slate-500 hover:text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10 transition-colors"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => reenviarLink(t.id, t.razonSocial)}
                          disabled={enviando === t.id}
                          title="Reenviar link de formulario"
                          aria-label={`Reenviar enlace a ${t.razonSocial}`}
                          className="h-10 w-10 p-0 text-slate-500 hover:text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10 transition-colors"
                        >
                          <Send
                            className={`h-3.5 w-3.5 ${
                              enviando === t.id ? "animate-pulse" : ""
                            }`}
                          />
                        </Button>
                        <Link
                          href={`/admin/${tipo}/${t.id}`}
                          title="Ver detalle"
                          aria-label={`Ver detalle de ${t.razonSocial}`}
                          className={buttonVariants({
                            size: "sm",
                            variant: "ghost",
                            className:
                              "h-10 w-10 p-0 text-slate-500 hover:text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10 transition-colors",
                          })}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                        <Link
                          href={`/admin/${tipo}/${t.id}/editar`}
                          title="Editar registro"
                          aria-label={`Editar ${t.razonSocial}`}
                          className={buttonVariants({ size: "sm", variant: "ghost", className: "h-10 w-10 p-0 text-slate-500 hover:text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10" })}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                        {esAdmin && !t.formulario && <EliminarTerceroButton id={t.id} nombre={t.razonSocial} tipo={tipo} compact />}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <p className="text-xs text-slate-400 font-medium">
        <span className="text-slate-600 font-semibold">{filtrados.length}</span>{" "}
        {filtrados.length === 1 ? "registro encontrado" : "registros encontrados"}
        {busqueda && (
          <span className="ml-1 text-slate-400">
            para &ldquo;{busqueda}&rdquo;
          </span>
        )}
      </p>
    </div>
  );
}
