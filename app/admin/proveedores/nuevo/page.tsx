import FormNuevoTercero from "@/components/admin/FormNuevoTercero";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NuevoProveedorPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="space-y-3">
        <Link href="/admin/proveedores" className="inline-flex items-center gap-2 text-sm font-medium text-[#52657a] hover:text-[var(--brand-primary)]"><ArrowLeft className="size-4" /> Volver a proveedores</Link>
        <p className="eyebrow">Directorio / Proveedores</p>
        <h1 className="text-[32px] font-bold tracking-tight text-[#142033]">Nuevo proveedor</h1>
        <p className="text-sm text-[#52657a]">Registra un proveedor y envíale el enlace de vinculación.</p>
      </div>
      <FormNuevoTercero tipo="PROVEEDOR" />
    </div>
  );
}
