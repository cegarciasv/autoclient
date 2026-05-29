"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, User, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  token: string;
  onSeleccion: (tipo: "NATURAL" | "JURIDICA") => void;
}

const opciones = [
  {
    tipo: "JURIDICA" as const,
    icon: Building2,
    titulo: "Persona Jurídica",
    subtitulo: "Empresa, sociedad o entidad legal",
    ejemplos: ["Sociedad Anónima (S.A.)", "Sociedad de Responsabilidad Limitada", "ONG / Asociación", "Cooperativa"],
    color: "from-[#1B3C22] to-[#1A7A30]",
    ring: "ring-[#1A7A30]",
    badge: "bg-[#1A7A30]/10 text-[#1B3C22]",
  },
  {
    tipo: "NATURAL" as const,
    icon: User,
    titulo: "Persona Natural",
    subtitulo: "Individuo que actúa a título personal",
    ejemplos: ["Empresario individual", "Profesional independiente", "Comerciante natural", "Proveedor personal"],
    color: "from-slate-700 to-slate-900",
    ring: "ring-slate-700",
    badge: "bg-slate-100 text-slate-700",
  },
] as const;

export default function ModalTipoPersona({ token, onSeleccion }: Props) {
  const [guardando, setGuardando] = useState<"NATURAL" | "JURIDICA" | null>(null);
  const [seleccionado, setSeleccionado] = useState<"NATURAL" | "JURIDICA" | null>(null);

  async function elegir(tipo: "NATURAL" | "JURIDICA") {
    if (guardando) return;
    setSeleccionado(tipo);
    setGuardando(tipo);

    try {
      const res = await fetch(`/api/formulario/${token}/tipo-persona`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipoPersona: tipo }),
      });

      if (!res.ok) {
        toast.error("Error al guardar la selección");
        setGuardando(null);
        setSeleccionado(null);
        return;
      }

      // Pequeña pausa para que la animación de selección se vea
      await new Promise((r) => setTimeout(r, 350));
      onSeleccion(tipo);
    } catch {
      toast.error("Error de conexión");
      setGuardando(null);
      setSeleccionado(null);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1B3C22] to-[#1A7A30] px-8 py-7">
            <h2 className="text-xl font-bold text-white">¿Cómo desea vincularse?</h2>
            <p className="text-sm text-white/70 mt-1">
              Seleccione el tipo de persona que mejor describe su situación. Esta elección determina los documentos requeridos.
            </p>
          </div>

          {/* Cards */}
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {opciones.map((op) => {
              const Icon = op.icon;
              const esteGuardando = guardando === op.tipo;
              const esteSeleccionado = seleccionado === op.tipo;

              return (
                <motion.button
                  key={op.tipo}
                  onClick={() => elegir(op.tipo)}
                  disabled={!!guardando}
                  whileHover={!guardando ? { scale: 1.02 } : {}}
                  whileTap={!guardando ? { scale: 0.98 } : {}}
                  className={[
                    "relative text-left rounded-xl border-2 p-5 transition-all duration-200 focus:outline-none",
                    "disabled:cursor-not-allowed",
                    esteSeleccionado
                      ? `border-transparent ring-2 ${op.ring} shadow-lg`
                      : "border-slate-200 hover:border-slate-300 hover:shadow-md",
                  ].join(" ")}
                >
                  {/* Icon */}
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${op.color} mb-4`}>
                    {esteGuardando ? (
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    ) : (
                      <Icon className="h-6 w-6 text-white" />
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{op.titulo}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 mb-3">{op.subtitulo}</p>

                  {/* Ejemplos */}
                  <ul className="space-y-1">
                    {op.ejemplos.map((ej) => (
                      <li key={ej} className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${op.badge}`}>
                          {ej}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Arrow indicator */}
                  <div className="absolute bottom-4 right-4">
                    <ChevronRight className={`h-4 w-4 transition-colors ${esteSeleccionado ? "text-[#1A7A30]" : "text-slate-300"}`} />
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="px-6 pb-6">
            <p className="text-center text-xs text-slate-400">
              Esta selección puede ser actualizada con el administrador si fue realizada por error.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
