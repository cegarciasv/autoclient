"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Plus, Send, Eye } from "lucide-react";
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
  formulario?: { progreso: number; pasoActual: number } | null;
}

interface Props {
  tipo: "clientes" | "proveedores";
  terceros: Tercero[];
}

const ESTADO_MAP = {
  PENDIENTE: {
    label: "Pendiente",
    cls: "bg-yellow-50 text-yellow-800 border-yellow-200",
    dot: "bg-yellow-400",
    pulse: true,
  },
  EN_PROCESO: {
    label: "En proceso",
    cls: "bg-[#1A7A30]/10 text-[#1B3C22] border-[#1A7A30]/20",
    dot: "bg-[#1A7A30]",
    pulse: true,
  },
  COMPLETADO: {
    label: "Completado",
    cls: "bg-emerald-50 text-emerald-800 border-emerald-200",
    dot: "bg-emerald-500",
    pulse: false,
  },
};

function getAvatarColors(tipo: "clientes" | "proveedores") {
  return tipo === "clientes"
    ? "bg-green-100 text-[#1B3C22]"
    : "bg-purple-100 text-purple-700";
}

function getProgressColor(pct: number) {
  if (pct < 30) return "bg-red-500";
  if (pct < 70) return "bg-amber-400";
  return "bg-emerald-500";
}

export default function TablaTerceros({ tipo, terceros: inicial }: Props) {
  const [busqueda, setBusqueda] = useState("");
  const [enviando, setEnviando] = useState<string | null>(null);

  const filtrados = inicial.filter(
    (t) =>
      t.razonSocial.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.numeroDocumento.includes(busqueda)
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

  return (
    <div className="space-y-4">
      {/* Barra de acciones */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Buscar por nombre, email o documento..."
            className="pl-9 h-10 border-slate-200 focus:border-[#1A7A30] focus:ring-[#1A7A30]/20 transition-colors"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <Link
          href={`/admin/${tipo}/nuevo`}
          className={buttonVariants({
            className:
              "bg-[#1A7A30] hover:bg-[#155E25] text-white shadow-sm shadow-green-900/10 transition-all",
          })}
        >
          <Plus className="h-4 w-4 mr-2" />
          {tipo === "clientes" ? "Nuevo Cliente" : "Nuevo Proveedor"}
        </Link>
      </div>

      {/* Tabla */}
      <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#1B3C22] hover:bg-[#1B3C22] border-none">
              <TableHead className="text-slate-200 font-semibold text-xs uppercase tracking-wider">
                Razón Social
              </TableHead>
              <TableHead className="text-slate-200 font-semibold text-xs uppercase tracking-wider">
                Documento
              </TableHead>
              <TableHead className="text-slate-200 font-semibold text-xs uppercase tracking-wider">
                Email
              </TableHead>
              <TableHead className="text-slate-200 font-semibold text-xs uppercase tracking-wider">
                Estado
              </TableHead>
              <TableHead className="text-slate-200 font-semibold text-xs uppercase tracking-wider">
                Progreso
              </TableHead>
              <TableHead className="text-slate-200 font-semibold text-xs uppercase tracking-wider text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
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

                return (
                  <TableRow
                    key={t.id}
                    className="group hover:bg-[#1A7A30]/5 transition-colors duration-150 border-l-2 border-transparent hover:border-[#1A7A30]"
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
                          onClick={() => reenviarLink(t.id, t.razonSocial)}
                          disabled={enviando === t.id}
                          title="Reenviar link de formulario"
                          className="h-8 w-8 p-0 text-slate-500 hover:text-[#1A7A30] hover:bg-green-50 transition-colors"
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
                          className={buttonVariants({
                            size: "sm",
                            variant: "ghost",
                            className:
                              "h-8 w-8 p-0 text-slate-500 hover:text-[#1A7A30] hover:bg-green-50 transition-colors",
                          })}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
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
