"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Upload, FileText, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface TipoDoc {
  tipo: string;
  label: string;
  requerido: boolean;
}

/** Documentos para Persona Jurídica (empresa/sociedad) */
const DOCS_JURIDICA: TipoDoc[] = [
  { tipo: "formulario_firmado",      label: "Formulario de Vinculación Firmado",                                  requerido: true  },
  { tipo: "dui_representante",       label: "Fotocopia DUI/Pasaporte del Representante Legal",                    requerido: true  },
  { tipo: "nit_representante",       label: "Tarjeta de Identificación Tributaria (NIT) del Representante Legal", requerido: true  },
  { tipo: "credencial_administrador",label: "Credencial vigente de Elección de Administrador / Junta Directiva",  requerido: true  },
  { tipo: "escritura_constitucion",  label: "Escritura de Constitución de la Sociedad",                           requerido: true  },
  { tipo: "matricula_comercio",      label: "Matrícula de Comercio Vigente",                                      requerido: true  },
  { tipo: "comprobante_domicilio",   label: "Comprobante de Domicilio de la Empresa",                             requerido: true  },
  { tipo: "nit_nrc_empresa",         label: "Fotocopia de NIT y Número de Registro Fiscal (NRC)",                 requerido: true  },
  { tipo: "pasaporte_extranjero",    label: "Copia de Pasaporte o Carné de Residencia (si aplica)",               requerido: false },
  { tipo: "acuerdo_decreto",         label: "Acuerdo/Decreto/Acta (Asociaciones, ONGs, Cooperativas)",            requerido: false },
  { tipo: "poder_apoderado",         label: "Fotocopia de Poder (si firma un apoderado)",                         requerido: false },
  { tipo: "dui_nit_apoderado",       label: "Fotocopia DUI y NIT del Apoderado",                                  requerido: false },
];

/** Documentos para Persona Natural */
const DOCS_NATURAL: TipoDoc[] = [
  { tipo: "formulario_firmado",    label: "Formulario de Vinculación Firmado",                    requerido: true  },
  { tipo: "dui_representante",     label: "Fotocopia DUI/Pasaporte",                              requerido: true  },
  { tipo: "nit_representante",     label: "Tarjeta de Identificación Tributaria (NIT)",           requerido: true  },
  { tipo: "comprobante_domicilio", label: "Comprobante de Domicilio",                             requerido: true  },
  // Opcionales para natural — no aplica Junta Directiva ni Escritura de Constitución
  { tipo: "matricula_comercio",    label: "Matrícula de Comercio Vigente (si aplica)",            requerido: false },
  { tipo: "nit_nrc_empresa",       label: "Fotocopia de NIT y Número de Registro Fiscal (NRC) (si aplica)", requerido: false },
  { tipo: "pasaporte_extranjero",  label: "Copia de Pasaporte o Carné de Residencia (si aplica)", requerido: false },
  { tipo: "poder_apoderado",       label: "Fotocopia de Poder (si firma un apoderado)",           requerido: false },
  { tipo: "dui_nit_apoderado",     label: "Fotocopia DUI y NIT del Apoderado",                   requerido: false },
];

interface DocSubido {
  tipo: string;
  nombreArchivo: string;
  tamanoBytes: number;
}

interface Props {
  formulario: Record<string, unknown>;
  guardando: boolean;
  onGuardar: (datos: Record<string, unknown>, siguiente?: boolean) => Promise<boolean>;
  onAnterior: () => void;
  token: string;
  tipo: "CLIENTE" | "PROVEEDOR";
}

export default function PasoCargaDocumentos({ formulario, onAnterior, token }: Props) {
  // Determinar lista de documentos según tipo de persona
  const tipoPersona = (formulario.tercero as Record<string, unknown> | null)?.tipoPersona as string | undefined;
  const DOCUMENTOS = tipoPersona === "NATURAL" ? DOCS_NATURAL : DOCS_JURIDICA;

  const docsIniciales: DocSubido[] = Array.isArray(formulario.documentos)
    ? (formulario.documentos as { tipo: string; nombreArchivo: string; tamanoBytes: number }[]).map((d) => ({
        tipo: d.tipo,
        nombreArchivo: d.nombreArchivo,
        tamanoBytes: d.tamanoBytes,
      }))
    : [];

  const [docs, setDocs] = useState<DocSubido[]>(docsIniciales);
  const [subiendo, setSubiendo] = useState<string | null>(null);
  const [finalizando, setFinalizando] = useState(false);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function docSubido(tipo: string): DocSubido | undefined {
    return docs.find((d) => d.tipo === tipo);
  }

  async function subirArchivo(tipo: string, file: File) {
    if (file.type !== "application/pdf") {
      toast.error("Solo se aceptan archivos en formato PDF");
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      toast.error("El archivo no puede superar los 100 MB");
      return;
    }

    setSubiendo(tipo);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("tipo", tipo);

      const res = await fetch(`/api/formulario/${token}/documentos`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Error al subir el archivo");
        return;
      }

      const data = await res.json();
      setDocs((prev) => {
        const sin = prev.filter((d) => d.tipo !== tipo);
        return [...sin, { tipo, nombreArchivo: data.nombreArchivo, tamanoBytes: data.tamanoBytes }];
      });
      toast.success("Documento cargado correctamente");
    } catch {
      toast.error("Error de conexión al subir el archivo");
    } finally {
      setSubiendo(null);
    }
  }

  async function finalizar() {
    const faltantes = DOCUMENTOS.filter((d) => d.requerido && !docSubido(d.tipo));
    if (faltantes.length > 0) {
      toast.error(`Faltan ${faltantes.length} documento(s) requerido(s) por cargar`);
      return;
    }

    setFinalizando(true);
    try {
      const res = await fetch(`/api/formulario/${token}/finalizar`, { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Error al finalizar");
        return;
      }
      toast.success("¡Formulario completado exitosamente!");
      window.location.href = `/formulario/${token}/completado`;
    } catch {
      toast.error("Error de conexión");
    } finally {
      setFinalizando(false);
    }
  }

  const requeridos = DOCUMENTOS.filter((d) => d.requerido);
  const opcionales = DOCUMENTOS.filter((d) => !d.requerido);
  const completados = requeridos.filter((d) => docSubido(d.tipo)).length;

  return (
    <div className="space-y-6">
      {/* Progreso */}
      <Card className="border-[#2B5BE2]/30 bg-[#2B5BE2]/5">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-[#1E3A8A]">Documentos requeridos cargados</p>
            <span className="text-sm font-bold text-[#1E3A8A]">{completados} / {requeridos.length}</span>
          </div>
          <div className="w-full bg-[#2B5BE2]/20 rounded-full h-2">
            <div
              className="bg-[#2B5BE2] h-2 rounded-full transition-all"
              style={{ width: `${(completados / requeridos.length) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Documentos requeridos */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-[#1E3A8A]">Documentos Requeridos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {requeridos.map((doc) => (
            <DocRow
              key={doc.tipo}
              doc={doc}
              subido={docSubido(doc.tipo)}
              subiendo={subiendo === doc.tipo}
              onSeleccionar={() => inputRefs.current[doc.tipo]?.click()}
              onArchivo={(file) => subirArchivo(doc.tipo, file)}
              inputRef={(el) => { inputRefs.current[doc.tipo] = el; }}
            />
          ))}
        </CardContent>
      </Card>

      {/* Documentos opcionales */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-[#1E3A8A]">Documentos Opcionales (si aplica)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {opcionales.map((doc) => (
            <DocRow
              key={doc.tipo}
              doc={doc}
              subido={docSubido(doc.tipo)}
              subiendo={subiendo === doc.tipo}
              onSeleccionar={() => inputRefs.current[doc.tipo]?.click()}
              onArchivo={(file) => subirArchivo(doc.tipo, file)}
              inputRef={(el) => { inputRefs.current[doc.tipo] = el; }}
            />
          ))}
        </CardContent>
      </Card>

      {completados === requeridos.length && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
          <p className="text-sm text-blue-700">
            Todos los documentos requeridos han sido cargados. Puede finalizar el proceso.
          </p>
        </div>
      )}

      <div className="flex justify-between pb-4">
        <Button type="button" variant="outline" onClick={onAnterior}>
          ← Anterior
        </Button>
        <Button
          type="button"
          disabled={finalizando || completados < requeridos.length}
          className="bg-blue-700 hover:bg-blue-800"
          onClick={finalizar}
        >
          {finalizando ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Finalizando...</>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Finalizar y enviar
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function DocRow({
  doc, subido, subiendo, onSeleccionar, onArchivo, inputRef,
}: {
  doc: TipoDoc;
  subido: DocSubido | undefined;
  subiendo: boolean;
  onSeleccionar: () => void;
  onArchivo: (file: File) => void;
  inputRef: (el: HTMLInputElement | null) => void;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <input
        type="file"
        accept="application/pdf"
        className="hidden"
        ref={inputRef}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onArchivo(f); e.target.value = ""; }}
      />

      <div className="shrink-0">
        {subiendo ? (
          <Loader2 className="h-5 w-5 text-[#2B5BE2] animate-spin" />
        ) : subido ? (
          <CheckCircle2 className="h-5 w-5 text-blue-500" />
        ) : doc.requerido ? (
          <AlertCircle className="h-5 w-5 text-amber-400" />
        ) : (
          <FileText className="h-5 w-5 text-gray-300" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm ${subido ? "text-gray-700" : "text-gray-600"} leading-snug`}>
          {doc.label}
          {doc.requerido && <span className="text-red-500 ml-0.5">*</span>}
        </p>
        {subido && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">
            {subido.nombreArchivo} · {(subido.tamanoBytes / 1024 / 1024).toFixed(2)} MB
          </p>
        )}
      </div>

      <Button
        type="button"
        variant={subido ? "outline" : "default"}
        size="sm"
        disabled={subiendo}
        onClick={onSeleccionar}
        className={subido ? "" : "bg-[#2B5BE2] hover:bg-[#1E47C0]"}
      >
        {subiendo ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : subido ? (
          <>
            <Upload className="h-3 w-3 mr-1" /> Reemplazar
          </>
        ) : (
          <>
            <Upload className="h-3 w-3 mr-1" /> Subir
          </>
        )}
      </Button>
    </div>
  );
}
