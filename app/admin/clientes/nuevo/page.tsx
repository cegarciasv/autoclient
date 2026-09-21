import FormNuevoTercero from "@/components/admin/FormNuevoTercero";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NuevoClientePage() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Link href="/admin/clientes" className="inline-flex items-center gap-2 text-sm font-medium text-[#52657a] hover:text-[var(--brand-primary)]"><ArrowLeft className="size-4" /> Volver a clientes</Link>
        <p className="eyebrow">Directorio / Clientes</p>
        <h1 className="text-[32px] font-bold tracking-tight text-[#142033]">Nuevo cliente</h1>
        <p className="text-sm text-[#52657a]">Registra un cliente y envíale el enlace de vinculación.</p>
      </div>
      <FormNuevoTercero tipo="CLIENTE" />
    </div>
  );
}
