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
  PENDIENTE: { label: "Pendiente", cls: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  EN_PROCESO: { label: "En proceso", cls: "bg-blue-100 text-blue-800 border-blue-200" },
  COMPLETADO: { label: "Completado", cls: "bg-green-100 text-green-800 border-green-200" },
};

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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre, email o documento..."
            className="pl-9"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <Link href={`/admin/${tipo}/nuevo`} className={buttonVariants({ className: "bg-[#1e3a5f] hover:bg-[#162d4a]" })}>
          <Plus className="h-4 w-4 mr-2" />
          {tipo === "clientes" ? "Nuevo Cliente" : "Nuevo Proveedor"}
        </Link>
      </div>

      {/* Tabla */}
      <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Razón Social</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Progreso</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-gray-400">
                  No se encontraron registros
                </TableCell>
              </TableRow>
            ) : (
              filtrados.map((t) => {
                const estado = ESTADO_MAP[t.estado as keyof typeof ESTADO_MAP] ?? { label: t.estado, cls: "" };
                return (
                  <TableRow key={t.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-800 max-w-[200px] truncate">
                      {t.razonSocial}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      <span className="text-xs text-gray-400 mr-1">{t.tipoDocumento}</span>
                      {t.numeroDocumento}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 max-w-[180px] truncate">
                      {t.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={estado.cls}>
                        {estado.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {t.formulario ? (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5 w-16">
                            <div
                              className="bg-[#1e3a5f] h-1.5 rounded-full"
                              style={{ width: `${t.formulario.progreso}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{t.formulario.progreso}%</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Sin iniciar</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => reenviarLink(t.id, t.razonSocial)}
                          disabled={enviando === t.id}
                          title="Reenviar link"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </Button>
                        <Link href={`/admin/${tipo}/${t.id}`} className={buttonVariants({ size: "sm", variant: "outline" })}>
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
      <p className="text-xs text-gray-400">{filtrados.length} registro(s) encontrado(s)</p>
    </div>
  );
}
