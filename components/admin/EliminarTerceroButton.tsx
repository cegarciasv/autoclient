"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Props {
  id: string;
  nombre: string;
  tipo: "clientes" | "proveedores";
  compact?: boolean;
  desdeDetalle?: boolean;
}

export default function EliminarTerceroButton({ id, nombre, tipo, compact = false, desdeDetalle = false }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  async function eliminar() {
    setEliminando(true);
    try {
      const res = await fetch(`/api/admin/terceros/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({})) as { error?: string };
      if (!res.ok) throw new Error(data.error || "No se pudo eliminar el registro");
      setOpen(false);
      toast.success("Registro eliminado");
      if (desdeDetalle) router.push(`/admin/${tipo}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error de conexión");
    } finally {
      setEliminando(false);
    }
  }

  return <>
    <Button type="button" variant={compact ? "ghost" : "outline"} onClick={() => setOpen(true)}
      title={compact ? "Eliminar registro" : undefined}
      aria-label={`Eliminar ${nombre}`}
      className={compact
        ? "size-10 p-0 text-[#a54b43] hover:bg-red-50 hover:text-[#8f3d35]"
        : "min-h-11 rounded-lg border-red-200 text-[#a54b43] hover:bg-red-50"}>
      <Trash2 className="size-4" />{!compact && " Eliminar"}
    </Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-[#142033]">Eliminar registro</DialogTitle>
          <DialogDescription className="leading-relaxed">
            Se eliminará el registro de <strong>{nombre}</strong> y su enlace dejará de funcionar. Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="border-0 bg-white">
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={eliminando}>Cancelar</Button>
          <Button type="button" onClick={eliminar} disabled={eliminando} className="bg-[#a54b43] text-white hover:bg-[#8f3d35]">
            {eliminando ? "Eliminando..." : "Eliminar registro"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>;
}
