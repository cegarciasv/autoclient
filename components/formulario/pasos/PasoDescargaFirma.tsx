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
    label: "Carta de Autorización (Persona Jurídica)",
    href: "/plantillas/carta-autorizacion-investigacion-persona-juridica.pdf",
    archivo: "carta_autorizacion_investigacion_persona_juridica.pdf",
  },
  {
    persona: "NATURAL",
    label: "Carta de Autorización (Persona Natural)",
    href: "/plantillas/carta-autorizacion-investigacion-persona-natural.pdf",
    archivo: "carta_autorizacion_investigacion_persona_natural.pdf",
  },
];

export default function PasoDescargaFirma({ formulario, onGuardar, onAnterior, token, tipo, guardando, cartasActivas }: Props) {
  const [descargando, setDescargando] = useState(false);
  const mostrarCartas = tipo === "PROVEEDOR" && !!cartasActivas;
  const tipoPersona = (formulario.tercero as Record<string, unknown> | undefined)?.tipoPersona as string | undefined;
  const cartas = CARTAS_AUTORIZACION.filter((c) => !tipoPersona || c.persona === tipoPersona);
  const [descargado, setDescargado] = useState(false);
  const [cartasDescargadas, setCartasDescargadas] = useState<string[]>([]);

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

  function descargarCarta(href: string, archivo: string) {
    const a = document.createElement("a");
    a.href = href;
    a.download = archivo;
    a.click();
    setCartasDescargadas((prev) => (prev.includes(href) ? prev : [...prev, href]));
    toast.success("Carta descargada correctamente");
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
            <div className="flex flex-col items-center gap-3 rounded-lg border-2 border-[var(--brand-primary)]/40 bg-[var(--brand-primary)]/5 p-4 text-center">
              <span className="rounded-full bg-[var(--brand-primary)] px-3 py-0.5 text-xs font-semibold text-white">
                Documento adicional obligatorio para proveedores
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-800">Carta de Autorización de Investigación</p>
                <p className="text-sm text-gray-600 mt-0.5">
                  Descargue la carta, llénela, fírmela y escanéela en PDF. La subirá junto con los demás documentos en el siguiente paso.
                </p>
              </div>
              {cartas.map((c) => (
                <div key={c.href} className="flex flex-col items-center gap-2 w-full">
                  <Button
                    type="button"
                    onClick={() => descargarCarta(c.href, c.archivo)}
                    className="bg-[var(--brand-primary)] hover:bg-[var(--brand-dark)] w-full sm:w-auto px-8"
                    size="lg"
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    Descargar {c.label}
                  </Button>
                  {cartasDescargadas.includes(c.href) && (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <CheckCircle2 className="h-4 w-4" />
                      Carta descargada — recuerde firmarla antes de subirla
                    </div>
                  )}
                </div>
              ))}
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
