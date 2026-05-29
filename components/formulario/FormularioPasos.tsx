"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import PasoInfoGeneral from "./pasos/PasoInfoGeneral";
import PasoAccionistas from "./pasos/PasoAccionistas";
import PasoReferencias from "./pasos/PasoReferencias";
import PasoEncuestaProveedor from "./pasos/PasoEncuestaProveedor";
import PasoDescargaFirma from "./pasos/PasoDescargaFirma";
import PasoCargaDocumentos from "./pasos/PasoCargaDocumentos";
import BarraProgreso from "./BarraProgreso";
import ModalTipoPersona from "./ModalTipoPersona";

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
  3: "Referencias",
  4: "Encuesta Proveedor",
  5: "Descarga y Firma",
  6: "Documentos",
};

function etiquetasPasos(tipo: "CLIENTE" | "PROVEEDOR") {
  if (tipo === "CLIENTE") {
    return [1, 2, 3, 4, 5].map((n) => ({
      paso: n,
      label: n === 4 ? "Descarga y Firma" : n === 5 ? "Documentos" : ETIQUETAS_PASOS[n],
    }));
  }
  return [1, 2, 3, 4, 5, 6].map((n) => ({ paso: n, label: ETIQUETAS_PASOS[n] }));
}

export default function FormularioPasos({
  token, pasoActual, totalPasos, progreso, tipo, formulario,
}: Props) {
  const router = useRouter();
  const [guardando, setGuardando] = useState(false);
  const direccion = useRef<1 | -1>(1); // 1=adelante, -1=atrás

  // Mostrar modal de selección de tipo persona solo si no fue seleccionado aún
  const tercero = formulario.tercero as Record<string, unknown> | undefined;
  const tipoPersonaSinSeleccionar = pasoActual === 1 && !tercero?.tipoPersona;

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
        direccion.current = 1;
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
    direccion.current = -1;
    router.push(`/formulario/${token}/paso/${pasoActual - 1}`);
  }

  const pasos = etiquetasPasos(tipo);
  const pasoProps = { formulario, guardando, onGuardar: guardarPaso, onAnterior: irAnterior, token };

  function renderizarPaso() {
    // Para CLIENTES: paso 4 = "Descarga y Firma", paso 5 = "Documentos"
    // Para PROVEEDORES: paso 4 = "Encuesta", paso 5 = "Descarga y Firma", paso 6 = "Documentos"
    if (tipo === "CLIENTE") {
      if (pasoActual === 4) return <PasoDescargaFirma {...pasoProps} tipo={tipo} />;
      if (pasoActual === 5) return <PasoCargaDocumentos {...pasoProps} tipo={tipo} />;
    } else {
      if (pasoActual === 5) return <PasoDescargaFirma {...pasoProps} tipo={tipo} />;
      if (pasoActual === 6) return <PasoCargaDocumentos {...pasoProps} tipo={tipo} />;
    }

    switch (pasoActual) {
      case 1: return <PasoInfoGeneral {...pasoProps} />;
      case 2: return <PasoAccionistas {...pasoProps} />;
      case 3: return <PasoReferencias {...pasoProps} />;
      case 4: return tipo === "PROVEEDOR" ? <PasoEncuestaProveedor {...pasoProps} /> : null;
      default: return null;
    }
  }

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <div className="space-y-6">
      {/* Modal tipo persona: aparece en paso 1 si el usuario aún no eligió */}
      {tipoPersonaSinSeleccionar && (
        <ModalTipoPersona
          token={token}
          onSeleccion={() => {
            // Full browser navigation — fuerza remonte completo del componente
            // para que useForm tome el nuevo tipoPersona desde el servidor
            window.location.href = `/formulario/${token}/paso/1`;
          }}
        />
      )}

      <BarraProgreso pasos={pasos} pasoActual={pasoActual} progreso={progreso} />
      <AnimatePresence mode="wait" custom={direccion.current}>
        <motion.div
          key={pasoActual}
          custom={direccion.current}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          {renderizarPaso()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
