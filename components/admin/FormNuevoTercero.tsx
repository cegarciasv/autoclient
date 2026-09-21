"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, FileText, Mail, Save, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Campos = { razonSocial: string; tipoDocumento: "NIT" | "DUI" | "PASAPORTE"; numeroDocumento: string; email: string };
interface Props { tipo: "CLIENTE" | "PROVEEDOR"; id?: string; initial?: Campos }

export default function FormNuevoTercero({ tipo, id, initial }: Props) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [form, setForm] = useState<Campos>(initial ?? { razonSocial: "", tipoDocumento: "NIT", numeroDocumento: "", email: "" });
  const ruta = tipo === "PROVEEDOR" ? "proveedores" : "clientes";
  const nombre = tipo === "PROVEEDOR" ? "proveedor" : "cliente";
  const editando = Boolean(id);

  function set<K extends keyof Campos>(campo: K, valor: Campos[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (cargando) return;
    setCargando(true);
    try {
      const res = await fetch(editando ? `/api/admin/terceros/${id}` : "/api/admin/terceros", {
        method: editando ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editando ? form : { ...form, tipo }),
      });
      const data = await res.json().catch(() => ({})) as { error?: string; id?: string };
      if (!res.ok) throw new Error(data.error || "No se pudo guardar el registro");
      toast.success(editando ? "Datos actualizados" : "Registro creado. Se intentó enviar el enlace por correo.");
      router.push(`/admin/${ruta}/${id ?? data.id}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error de conexión");
    } finally {
      setCargando(false);
    }
  }

  return <div className="grid max-w-5xl gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
    <form onSubmit={handleSubmit} className="surface-card overflow-hidden">
      <div className="border-b border-[#e2e8ec] px-5 py-5 sm:px-7">
        <p className="eyebrow mb-2">Datos de registro</p>
        <h2 className="text-lg font-bold text-[#142033]">Información del {nombre}</h2>
        <p className="mt-1 text-sm text-[#52657a]">Completa los datos de identificación y contacto.</p>
      </div>
      <div className="space-y-6 px-5 py-6 sm:px-7">
        <div className="space-y-2">
          <Label htmlFor="razonSocial" className="flex items-center gap-2 text-[#142033]"><Building2 className="size-4 text-[var(--brand-primary)]" /> Razón social o nombre <span className="text-red-600">*</span></Label>
          <Input id="razonSocial" value={form.razonSocial} onChange={(e) => set("razonSocial", e.target.value)} placeholder="Ej. Empresa S.A. de C.V." required minLength={2} maxLength={191} className="h-11 rounded-lg bg-[#f8fafb]" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tipoDocumento" className="flex items-center gap-2 text-[#142033]"><FileText className="size-4 text-[var(--brand-primary)]" /> Tipo de documento <span className="text-red-600">*</span></Label>
            <Select value={form.tipoDocumento} onValueChange={(value) => set("tipoDocumento", value as Campos["tipoDocumento"])}>
              <SelectTrigger id="tipoDocumento" className="h-11 w-full rounded-lg bg-[#f8fafb]"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="NIT">NIT</SelectItem><SelectItem value="DUI">DUI</SelectItem><SelectItem value="PASAPORTE">Pasaporte</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="numeroDocumento" className="text-[#142033]">Número de documento <span className="text-red-600">*</span></Label>
            <Input id="numeroDocumento" value={form.numeroDocumento} onChange={(e) => set("numeroDocumento", e.target.value)} placeholder="Número de identificación" required minLength={5} maxLength={191} className="h-11 rounded-lg bg-[#f8fafb]" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2 text-[#142033]"><Mail className="size-4 text-[var(--brand-primary)]" /> Correo electrónico <span className="text-red-600">*</span></Label>
          <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="contacto@empresa.com" required maxLength={191} className="h-11 rounded-lg bg-[#f8fafb]" />
        </div>
      </div>
      <div className="flex flex-col-reverse gap-3 border-t border-[#e2e8ec] bg-[#f8fafb] px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
        <Button type="button" variant="outline" onClick={() => router.back()} className="min-h-11 rounded-lg"><ArrowLeft className="size-4" /> Cancelar</Button>
        <Button type="submit" disabled={cargando} className="brand-button min-h-11 rounded-lg px-5"><Save className="size-4" /> {cargando ? "Guardando..." : editando ? "Guardar cambios" : "Crear y enviar enlace"}</Button>
      </div>
    </form>
    <aside className="surface-card h-fit p-5">
      <span className="grid size-10 place-items-center rounded-xl bg-[#e9f4ef] text-[var(--brand-primary)]"><ShieldCheck className="size-5" /></span>
      <h3 className="mt-4 text-sm font-bold text-[#142033]">{editando ? "Qué cambia al guardar" : "Después de crear el registro"}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[#52657a]">{editando
        ? "Se actualizan los datos de registro. Las respuestas y documentos enviados en el formulario se conservan. Si cambias el correo, puedes reenviar el enlace desde el listado."
        : "El sistema crea el expediente e intenta enviar al correo indicado el enlace para completar el formulario."}</p>
    </aside>
  </div>;
}
