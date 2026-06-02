"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  terceroId: string;
  estadoActual: string;
  tieneFormulario: boolean;
}

export default function BotonesEstado({ terceroId, estadoActual, tieneFormulario }: Props) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const completado = estadoActual === "COMPLETADO";

  if (!tieneFormulario) return null;

  async function marcarCompletado() {
    setCargando(true);
    try {
      const res = await fetch(`/api/admin/terceros/${terceroId}/completar`, { method: "POST" });
      if (!res.ok) throw new Error();
      toast.success("Formulario marcado como completado");
      router.refresh();
    } catch {
      toast.error("Error al actualizar el estado");
    } finally {
      setCargando(false);
    }
  }

  async function revertirEnProceso() {
    setCargando(true);
    try {
      const res = await fetch(`/api/admin/terceros/${terceroId}/completar`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Estado revertido a En proceso");
      router.refresh();
    } catch {
      toast.error("Error al actualizar el estado");
    } finally {
      setCargando(false);
    }
  }

  if (completado) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled={cargando}
        onClick={revertirEnProceso}
        className="border-amber-200 text-amber-700 hover:bg-amber-50"
      >
        {cargando ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5 mr-1" />}
        Revertir a En proceso
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={cargando}
      onClick={marcarCompletado}
      className="border-blue-200 text-blue-700 hover:bg-blue-50"
    >
      {cargando ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5 mr-1" />}
      Marcar completado
    </Button>
  );
}
