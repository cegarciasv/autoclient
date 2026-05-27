"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText, Eye, Download, ChevronLeft, ChevronRight,
  Loader2, AlertCircle, ExternalLink, X, Files,
} from "lucide-react";

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
  formulario_firmado:       "Formulario firmado",
  dui_representante:        "DUI Representante Legal",
  nit_representante:        "NIT Representante Legal",
  credencial_administrador: "Credencial Administrador",
  escritura_constitucion:   "Escritura de Constitución",
  matricula_comercio:       "Matrícula de Comercio",
  comprobante_domicilio:    "Comprobante de Domicilio",
  nit_nrc_empresa:          "NIT y NRC Empresa",
  nit_empresa:              "NIT Empresa",
  pasaporte_extranjero:     "Pasaporte / Carné Extranjero",
  acuerdo_decreto:          "Acuerdo / Decreto / Acta",
  poder_apoderado:          "Poder del Apoderado",
  dui_nit_apoderado:        "DUI y NIT del Apoderado",
  dui_apoderado:            "DUI Apoderado",
  nit_apoderado:            "NIT Apoderado",
  otro:                     "Otro documento",
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

  function cerrar() {
    setActivo(null);
    setCargando(false);
    setError(false);
  }

  const navegar = useCallback((dir: "prev" | "next") => {
    const nuevoIdx = dir === "prev" ? idx - 1 : idx + 1;
    if (nuevoIdx >= 0 && nuevoIdx < documentos.length) {
      abrirDoc(documentos[nuevoIdx]);
    }
  }, [idx, documentos]);

  // Navegación con teclado
  useEffect(() => {
    if (!activo) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") navegar("prev");
      if (e.key === "ArrowRight") navegar("next");
      if (e.key === "Escape") cerrar();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activo, navegar]);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (activo) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [activo]);

  return (
    <>
      {/* ── Lista de documentos ── */}
      <div className="space-y-1">
        {documentos.map((doc, i) => (
          <div
            key={doc.id}
            className="flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-all group cursor-default"
          >
            {/* Número + icono */}
            <div className="flex-shrink-0 relative">
              <div className="h-10 w-10 bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl flex items-center justify-center shadow-sm">
                <FileText className="h-5 w-5 text-red-500" />
              </div>
              <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-slate-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                {i + 1}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate leading-tight">
                {doc.nombreArchivo}
              </p>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                <span className="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-medium">
                  {etiqueta(doc.tipo)}
                </span>
                <span>{fmtTamano(doc.tamanoBytes)}</span>
              </p>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => abrirDoc(doc)}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#1e3a5f] text-white text-xs font-medium hover:bg-[#162d4a] transition-colors shadow-sm"
              >
                <Eye className="h-3.5 w-3.5" />
                Ver
              </button>
              <a
                href={urlDoc(doc.id)}
                download={doc.nombreArchivo}
                title="Descargar"
                className="flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors shadow-sm"
              >
                <Download className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* ── Modal visor pantalla completa ── */}
      {activo && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-slate-950"
          role="dialog"
          aria-modal="true"
        >
          {/* ── Barra superior ── */}
          <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 bg-slate-900 border-b border-slate-700/60 shadow-lg">

            {/* Ícono + info del documento */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="h-9 w-9 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="h-4.5 w-4.5 text-red-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate leading-tight">
                  {activo.nombreArchivo}
                </p>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                  <span>{etiqueta(activo.tipo)}</span>
                  <span className="text-slate-600">·</span>
                  <span>{fmtTamano(activo.tamanoBytes)}</span>
                  {documentos.length > 1 && (
                    <>
                      <span className="text-slate-600">·</span>
                      <span className="flex items-center gap-1">
                        <Files className="h-3 w-3" />
                        {idx + 1} de {documentos.length}
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Controles centrados: prev / índice / next */}
            {documentos.length > 1 && (
              <div className="flex items-center gap-1 bg-slate-800 rounded-xl p-1 border border-slate-700/50">
                <button
                  disabled={!hasPrev}
                  onClick={() => navegar("prev")}
                  title="Anterior (←)"
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs">Anterior</span>
                </button>
                <div className="px-2 py-1 bg-slate-700/60 rounded-lg">
                  <span className="text-xs font-mono text-slate-300 tabular-nums">
                    {idx + 1}/{documentos.length}
                  </span>
                </div>
                <button
                  disabled={!hasNext}
                  onClick={() => navegar("next")}
                  title="Siguiente (→)"
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <span className="hidden sm:inline text-xs">Siguiente</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Acciones derecha */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <a
                href={urlDoc(activo.id)}
                download={activo.nombreArchivo}
                className="flex items-center gap-2 h-9 px-4 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-colors border border-slate-600/50"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Descargar</span>
              </a>
              <a
                href={urlDoc(activo.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 h-9 px-4 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-colors border border-slate-600/50"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">Nueva pestaña</span>
              </a>
              <div className="w-px h-6 bg-slate-700 mx-1" />
              <button
                onClick={cerrar}
                title="Cerrar (Esc)"
                className="flex items-center justify-center h-9 w-9 rounded-lg bg-slate-700/60 hover:bg-red-500/20 hover:text-red-400 text-slate-400 transition-colors border border-slate-600/50"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          {/* ── Miniaturas laterales (si hay más de 1 doc) ── */}
          <div className="flex flex-1 min-h-0">
            {documentos.length > 1 && (
              <div className="w-52 flex-shrink-0 bg-slate-900 border-r border-slate-700/40 overflow-y-auto hidden lg:block">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3 pt-3 pb-2">
                  Documentos ({documentos.length})
                </p>
                <div className="space-y-0.5 px-2 pb-3">
                  {documentos.map((doc, i) => (
                    <button
                      key={doc.id}
                      onClick={() => abrirDoc(doc)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-start gap-2.5 ${
                        activo.id === doc.id
                          ? "bg-blue-600 text-white shadow-md"
                          : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                      }`}
                    >
                      <span className={`flex-shrink-0 text-[10px] font-bold w-4 mt-0.5 ${
                        activo.id === doc.id ? "text-blue-200" : "text-slate-600"
                      }`}>
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate leading-tight">
                          {etiqueta(doc.tipo)}
                        </p>
                        <p className={`text-[10px] mt-0.5 truncate ${
                          activo.id === doc.id ? "text-blue-200" : "text-slate-500"
                        }`}>
                          {fmtTamano(doc.tamanoBytes)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Área del visor ── */}
            <div className="flex-1 relative bg-slate-800 min-w-0">

              {/* Spinner de carga */}
              {cargando && !error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10 gap-4">
                  <Loader2 className="h-10 w-10 text-blue-400 animate-spin" />
                  <p className="text-sm text-slate-400">Cargando documento...</p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10 gap-5">
                  <div className="h-16 w-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-red-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-200">No se pudo cargar el documento</p>
                    <p className="text-xs text-slate-500 mt-1">El archivo podría no estar disponible.</p>
                  </div>
                  <a
                    href={urlDoc(activo.id)}
                    download={activo.nombreArchivo}
                    className="flex items-center gap-2 h-9 px-5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Descargar en su lugar
                  </a>
                </div>
              )}

              {/* iFrame PDF */}
              <iframe
                key={activo.id}
                src={`${urlDoc(activo.id)}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                className="w-full h-full border-0"
                title={activo.nombreArchivo}
                onLoad={() => setCargando(false)}
                onError={() => { setCargando(false); setError(true); }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
