"use client";

import { useState } from "react";
import {
  FileText, Eye, Download, ChevronLeft, ChevronRight,
  Loader2, AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface DocItem {
  id: string;
  nombreArchivo: string;
  tipo: string;
  tamanoBytes: number;
}

interface Props {
  terceroId: string;
  documentos: DocItem[];
}

const ETIQUETAS: Record<string, string> = {
  formulario_firmado:      "Formulario firmado",
  dui_representante:       "DUI Representante Legal",
  nit_representante:       "NIT Representante Legal",
  credencial_administrador:"Credencial Administrador",
  escritura_constitucion:  "Escritura de Constitución",
  matricula_comercio:      "Matrícula de Comercio",
  comprobante_domicilio:   "Comprobante de Domicilio",
  nit_empresa:             "NIT Empresa",
  pasaporte_extranjero:    "Pasaporte / Carné Extranjero",
  poder_apoderado:         "Poder del Apoderado",
  dui_apoderado:           "DUI Apoderado",
  nit_apoderado:           "NIT Apoderado",
  otro:                    "Otro documento",
};

function etiqueta(tipo: string) {
  return ETIQUETAS[tipo] ?? tipo;
}

function fmtTamano(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function VisorDocumentos({ terceroId, documentos }: Props) {
  const [activo, setActivo] = useState<DocItem | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(false);

  const idx = activo ? documentos.findIndex((d) => d.id === activo.id) : -1;
  const hasPrev = idx > 0;
  const hasNext = idx < documentos.length - 1;

  function urlDoc(docId: string) {
    return `/api/admin/terceros/${terceroId}/documentos/${docId}`;
  }

  function abrirDoc(doc: DocItem) {
    setCargando(true);
    setError(false);
    setActivo(doc);
  }

  function navegar(direccion: "prev" | "next") {
    const nuevoIdx = direccion === "prev" ? idx - 1 : idx + 1;
    if (nuevoIdx >= 0 && nuevoIdx < documentos.length) {
      abrirDoc(documentos[nuevoIdx]);
    }
  }

  return (
    <>
      {/* ── Lista de documentos ── */}
      <div className="divide-y divide-slate-50">
        {documentos.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center gap-3 py-3 px-1 group hover:bg-slate-50/80 rounded-lg transition-colors"
          >
            {/* Icono PDF */}
            <div className="flex-shrink-0 h-9 w-9 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center">
              <FileText className="h-4 w-4 text-red-500" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate leading-tight">
                {doc.nombreArchivo}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {etiqueta(doc.tipo)} · {fmtTamano(doc.tamanoBytes)}
              </p>
            </div>

            {/* Acciones — visibles en hover */}
            <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2.5 text-xs gap-1 border-slate-200 text-slate-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
                onClick={() => abrirDoc(doc)}
              >
                <Eye className="h-3.5 w-3.5" />
                Ver
              </Button>
              <a
                href={urlDoc(doc.id)}
                download={doc.nombreArchivo}
                title="Descargar"
                className="inline-flex items-center justify-center h-7 w-7 rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* ── Modal visor ── */}
      <Dialog open={!!activo} onOpenChange={(open) => { if (!open) setActivo(null); }}>
        <DialogContent className="max-w-5xl w-[95vw] h-[92vh] flex flex-col p-0 gap-0 overflow-hidden rounded-xl">

          {/* Header del modal */}
          <DialogHeader className="px-5 py-3 border-b border-slate-100 bg-white flex-shrink-0">
            <div className="flex items-center gap-3">
              {/* Ícono */}
              <div className="h-8 w-8 bg-red-50 border border-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="h-4 w-4 text-red-500" />
              </div>

              {/* Nombre y tipo */}
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-sm font-semibold text-slate-900 truncate leading-tight">
                  {activo?.nombreArchivo}
                </DialogTitle>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activo ? etiqueta(activo.tipo) : ""}
                  {activo ? ` · ${fmtTamano(activo.tamanoBytes)}` : ""}
                </p>
              </div>

              {/* Controles de navegación + descarga */}
              <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                {documentos.length > 1 && (
                  <div className="flex items-center gap-1 border border-slate-200 rounded-lg overflow-hidden">
                    <button
                      disabled={!hasPrev}
                      onClick={() => navegar("prev")}
                      className="h-7 w-7 flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Documento anterior"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-xs text-slate-500 tabular-nums px-1.5 border-x border-slate-200">
                      {idx + 1}/{documentos.length}
                    </span>
                    <button
                      disabled={!hasNext}
                      onClick={() => navegar("next")}
                      className="h-7 w-7 flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Documento siguiente"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {activo && (
                  <a href={urlDoc(activo.id)} download={activo.nombreArchivo}>
                    <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs gap-1 border-slate-200">
                      <Download className="h-3.5 w-3.5" />
                      Descargar
                    </Button>
                  </a>
                )}

                <a href={activo ? urlDoc(activo.id) : "#"} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs gap-1 border-slate-200">
                    Abrir en nueva pestaña
                  </Button>
                </a>
              </div>
            </div>
          </DialogHeader>

          {/* Área del visor */}
          <div className="flex-1 bg-slate-200 relative overflow-hidden">

            {/* Indicador de carga */}
            {cargando && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-10">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
                  <p className="text-sm text-slate-500">Cargando documento...</p>
                </div>
              </div>
            )}

            {/* Error de carga */}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
                <div className="flex flex-col items-center gap-3 max-w-sm text-center">
                  <div className="h-12 w-12 bg-red-50 border border-red-200 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">No se pudo cargar el documento</p>
                    <p className="text-xs text-slate-400 mt-1">
                      El archivo podría no estar disponible o estar dañado.
                    </p>
                  </div>
                  {activo && (
                    <a href={urlDoc(activo.id)} download={activo.nombreArchivo}>
                      <Button size="sm" variant="outline">
                        <Download className="h-3.5 w-3.5 mr-1.5" />
                        Descargar en su lugar
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* iframe del PDF */}
            {activo && (
              <iframe
                key={activo.id}
                src={`${urlDoc(activo.id)}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                className="w-full h-full border-0"
                title={activo.nombreArchivo}
                onLoad={() => setCargando(false)}
                onError={() => { setCargando(false); setError(true); }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
