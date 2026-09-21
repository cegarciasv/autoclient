import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import FormNuevoTercero from "@/components/admin/FormNuevoTercero";

export default async function EditarClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tercero = await prisma.tercero.findUnique({
    where: { id },
    select: { id: true, tipo: true, razonSocial: true, tipoDocumento: true, numeroDocumento: true, email: true },
  });
  if (!tercero || tercero.tipo !== "CLIENTE") notFound();
  return <div className="space-y-6">
    <div className="space-y-3">
      <Link href={`/admin/clientes/${id}`} className="inline-flex items-center gap-2 text-sm font-medium text-[#52657a] hover:text-[var(--brand-primary)]"><ArrowLeft className="size-4" /> Volver al expediente</Link>
      <p className="eyebrow">Directorio / Clientes</p>
      <h1 className="text-[32px] font-bold tracking-tight text-[#142033]">Editar cliente</h1>
      <p className="text-sm text-[#52657a]">Actualiza los datos de registro de {tercero.razonSocial}.</p>
    </div>
    <FormNuevoTercero tipo="CLIENTE" id={id} initial={tercero} />
  </div>;
}
