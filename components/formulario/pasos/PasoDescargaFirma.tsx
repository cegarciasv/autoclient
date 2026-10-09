"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, CheckCircle2, FileText, Pen, Upload } from "lucide-react";
import { toast } from "sonner";

interface Props {
  formulario: Record<string, unknown>;
  guardando: boolean;
  onGuardar: (datos: Record<string, unknown>, siguiente?: boolean) => Promise<boolean>;
  onAnterior: () => void;
  token: string;
  tipo: "CLIENTE" | "PROVEEDOR";
  cartasActivas?: boolean;
}

const CARTAS_AUTORIZACION = [
  {
    persona: "JURIDICA",
    label: "Carta de Autorización de Investigación — Persona Jurídica",
    href: "/plantillas/carta-autorizacion-investigacion-persona-juridica.pdf",
  },
  {
    persona: "NATURAL",
    label: "Carta de Autorización de Investigación — Persona Natural",
    href: "/plantillas/carta-autorizacion-investigacion-persona-natural.pdf",
  },
];

export default function PasoDescargaFirma({ formulario, onGuardar, onAnterior, token, tipo, guardando, cartasActivas }: Props) {
  const [descargando, setDescargando] = useState(false);
  const mostrarCartas = tipo === "PROVEEDOR" && !!cartasActivas;
  const tipoPersona = (formulario.tercero as Record<string, unknown> | undefined)?.tipoPersona as string | undefined;
  const cartas = CARTAS_AUTORIZACION.filter((c) => !tipoPersona || c.persona === tipoPersona);
  const [descargado, setDescargado] = useState(false);

  async function descargarPDF() {
    setDescargando(true);
    try {
      const res = await fetch(`/api/formulario/${token}/pdf`);
      if (!res.ok) {
        toast.error("Error al generar el PDF");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `formulario_vinculacion_${tipo.toLowerCase()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setDescargado(true);
      toast.success("PDF descargado correctamente");
    } catch {
      toast.error("Error al descargar el PDF");
    } finally {
      setDescargando(false);
    }
  }

  async function continuar() {
    await onGuardar({}, true);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-[var(--brand-dark)]">Descarga y Firma del Formulario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-gray-600">
            Ha completado todos los campos del formulario. El siguiente paso es descargar el PDF generado,
            firmarlo e incluirlo como uno de los documentos requeridos en el paso final.
          </p>

          {/* Pasos de instrucciones */}
          <div className="space-y-3">
            {[
              {
                icon: <Download className="h-5 w-5 text-[var(--brand-dark)]" />,
                titulo: "1. Descargue el PDF",
                desc: "Haga clic en el botón de abajo para generar y descargar su formulario de vinculación.",
              },
              {
                icon: <Pen className="h-5 w-5 text-[var(--brand-dark)]" />,
                titulo: "2. Fírmelo",
                desc: "Imprima el documento, fírmelo en todas las páginas requeridas y escanéelo en formato PDF.",
              },
              {
                icon: <Upload className="h-5 w-5 text-[var(--brand-dark)]" />,
                titulo: "3. Súbalo junto con los documentos",
                desc: "En el siguiente paso podrá cargar el formulario firmado y todos los documentos requeridos.",
              },
            ].map((paso, i) => (
              <div key={i} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
                <div className="bg-white border border-gray-200 rounded-full p-2 shrink-0">
                  {paso.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{paso.titulo}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{paso.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Botón de descarga */}
          <div className="flex flex-col items-center gap-3 pt-2">
            <Button
              type="button"
              onClick={descargarPDF}
              disabled={descargando}
              className="bg-[var(--brand-primary)] hover:bg-[var(--brand-dark)] w-full sm:w-auto px-8"
              size="lg"
            >
              {descargando ? (
                <>Generando PDF...</>
              ) : (
                <>
                  <FileText className="h-5 w-5 mr-2" />
                  Descargar Formulario PDF
                </>
              )}
            </Button>

            {descargado && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle2 className="h-4 w-4" />
                PDF descargado — recuerde firmarlo antes de subirlo
              </div>
            )}
          </div>

          {mostrarCartas && (
            <div className="space-y-3 rounded-lg border border-gray-200 p-4">
              <div>
                <p className="text-sm font-semibold text-gray-800">Carta de Autorización de Investigación</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Descargue la carta, llénela, fírmela y escanéela en PDF. La subirá junto con los demás documentos en el siguiente paso.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {cartas.map((c) => (
                  <a
                    key={c.href}
                    href={c.href}
                    download
                    className="inline-flex items-center gap-2 rounded-md border border-[var(--brand-primary)] px-4 py-2 text-sm font-medium text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5"
                  >
                    <Download className="h-4 w-4 shrink-0" />
                    {c.label}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-800">
              <strong>Importante:</strong> El formulario firmado
              {mostrarCartas ? " y la carta de autorización firmada son documentos requeridos obligatorios" : " es un documento requerido obligatorio"}.
              Sin {mostrarCartas ? "ellos" : "él"}, no podrá completar el proceso de vinculación.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pb-4">
        <Button type="button" variant="outline" onClick={onAnterior}>
          ← Anterior
        </Button>
        <Button
          type="button"
          disabled={guardando}
          className="bg-[var(--brand-primary)] hover:bg-[var(--brand-dark)]"
          onClick={continuar}
        >
          {guardando ? "Guardando..." : "Continuar a documentos →"}
        </Button>
      </div>
    </div>
  );
}
