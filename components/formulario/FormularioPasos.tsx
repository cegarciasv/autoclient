"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import PasoInfoGeneral from "./pasos/PasoInfoGeneral";
import PasoAccionistas from "./pasos/PasoAccionistas";
import PasoInfoFinanciera from "./pasos/PasoInfoFinanciera";
import PasoReferencias from "./pasos/PasoReferencias";
import PasoEncuestaProveedor from "./pasos/PasoEncuestaProveedor";
import PasoDescargaFirma from "./pasos/PasoDescargaFirma";
import PasoCargaDocumentos from "./pasos/PasoCargaDocumentos";
import BarraProgreso from "./BarraProgreso";

interface Props {
  token: string;
  pasoActual: number;
  totalPasos: number;
  progreso: number;
  tipo: "CLIENTE" | "PROVEEDOR";
  formulario: Record<string, unknown>;
}

const ETIQUETAS_PASOS: Record<number, string> = {
  1: "Información General",
  2: "Accionistas",
  3: "Info. Financiera",
  4: "Referencias",
  5: "Encuesta Proveedor",
  6: "Descarga y Firma",
  7: "Documentos",
};

function etiquetasPasos(tipo: "CLIENTE" | "PROVEEDOR") {
  if (tipo === "CLIENTE") {
    return [1, 2, 3, 4, 5, 6].map((n) => ({
      paso: n,
      label: n === 5 ? "Descarga y Firma" : n === 6 ? "Documentos" : ETIQUETAS_PASOS[n],
    }));
  }
  return [1, 2, 3, 4, 5, 6, 7].map((n) => ({ paso: n, label: ETIQUETAS_PASOS[n] }));
}

export default function FormularioPasos({
  token, pasoActual, totalPasos, progreso, tipo, formulario,
}: Props) {
  const router = useRouter();
  const [guardando, setGuardando] = useState(false);

  async function guardarPaso(datos: Record<string, unknown>, siguiente = true) {
    setGuardando(true);
    try {
      const res = await fetch(`/api/formulario/${token}/paso/${pasoActual}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Error al guardar");
        return false;
      }

      const data = await res.json();
      if (siguiente) {
        const proxPaso = pasoActual + 1;
        router.push(`/formulario/${token}/paso/${proxPaso}`);
        router.refresh();
      } else {
        toast.success("Progreso guardado");
        router.refresh();
      }
      return true;
    } catch {
      toast.error("Error de conexión");
      return false;
    } finally {
      setGuardando(false);
    }
  }

  function irAnterior() {
    router.push(`/formulario/${token}/paso/${pasoActual - 1}`);
  }

  const pasos = etiquetasPasos(tipo);
  const pasoActualReal =
    tipo === "CLIENTE" && pasoActual >= 5 ? pasoActual + 1 : pasoActual;

  const pasoProps = { formulario, guardando, onGuardar: guardarPaso, onAnterior: irAnterior, token };

  function renderizarPaso() {
    // Para CLIENTES: el paso 5 es "Descarga y Firma", paso 6 es "Documentos"
    // Para PROVEEDORES: paso 5 es "Encuesta", paso 6 es "Descarga y Firma", paso 7 es "Documentos"
    if (tipo === "CLIENTE") {
      if (pasoActual === 5) return <PasoDescargaFirma {...pasoProps} tipo={tipo} />;
      if (pasoActual === 6) return <PasoCargaDocumentos {...pasoProps} tipo={tipo} />;
    } else {
      if (pasoActual === 6) return <PasoDescargaFirma {...pasoProps} tipo={tipo} />;
      if (pasoActual === 7) return <PasoCargaDocumentos {...pasoProps} tipo={tipo} />;
    }

    switch (pasoActual) {
      case 1: return <PasoInfoGeneral {...pasoProps} />;
      case 2: return <PasoAccionistas {...pasoProps} />;
      case 3: return <PasoInfoFinanciera {...pasoProps} />;
      case 4: return <PasoReferencias {...pasoProps} />;
      case 5: return tipo === "PROVEEDOR" ? <PasoEncuestaProveedor {...pasoProps} /> : null;
      default: return null;
    }
  }

  return (
    <div className="space-y-6">
      <BarraProgreso
        pasos={pasos}
        pasoActual={pasoActual}
        progreso={progreso}
      />
      {renderizarPaso()}
    </div>
  );
}
