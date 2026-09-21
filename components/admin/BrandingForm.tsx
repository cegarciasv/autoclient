"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Colors = { colorPrimary: string; colorDark: string; colorAccent: string };

const fields: { key: keyof Colors; label: string; help: string }[] = [
  { key: "colorPrimary", label: "Color principal", help: "Botones y elementos destacados" },
  { key: "colorDark", label: "Color oscuro", help: "Barra lateral y encabezados" },
  { key: "colorAccent", label: "Color de acento", help: "Detalles y estados activos" },
];

export default function BrandingForm({ initial }: { initial: Colors & { actualizado: Date | null } }) {
  const [colors, setColors] = useState<Colors>(initial);
  const [logo, setLogo] = useState<File | null>(null);
  const [preview, setPreview] = useState("/api/branding/logo");
  const [saving, setSaving] = useState(false);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const data = new FormData();
    for (const field of fields) data.set(field.key, colors[field.key]);
    if (logo) data.set("logo", logo);
    try {
      const response = await fetch("/api/admin/branding", { method: "POST", body: data });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "No se pudo guardar la configuración");
      toast.success("Marca actualizada");
      setLogo(null);
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <section className="surface-card p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-slate-900">Logo</h2>
          <p className="text-sm text-slate-500">PNG, JPG o WebP, hasta 2 MB. Se muestra en el panel, acceso y formulario.</p>
        </div>
        <div className="rounded-lg p-6 flex items-center justify-center min-h-32" style={{ backgroundColor: colors.colorDark }}>
          {/* El logo se sirve desde una ruta propia y conserva sus proporciones. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Vista previa del logo" className="max-h-24 max-w-full object-contain" />
        </div>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            if (file && file.size > 2 * 1024 * 1024) {
              toast.error("El logo no puede superar 2 MB");
              event.target.value = "";
              return;
            }
            setLogo(file);
            if (file) {
              if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
              setPreview(URL.createObjectURL(file));
            }
          }}
          className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:font-medium file:text-slate-700 hover:file:bg-slate-200"
        />
      </section>
      <section className="surface-card p-6 space-y-5">
        <div>
          <h2 className="font-semibold text-slate-900">Colores</h2>
          <p className="text-sm text-slate-500">Elige los tres colores que identifican a la empresa.</p>
        </div>
        {fields.map(({ key, label, help }) => (
          <div key={key} className="flex items-center justify-between gap-4">
            <div>
              <label htmlFor={key} className="text-sm font-medium text-slate-800">{label}</label>
              <p className="text-xs text-slate-500">{help}</p>
            </div>
            <input id={key} type="color" value={colors[key]} onChange={(event) => setColors({ ...colors, [key]: event.target.value })} className="h-11 w-16 cursor-pointer rounded-md border bg-white p-1" />
          </div>
        ))}
      </section>
      <Button type="submit" disabled={saving} className="brand-button min-h-11 px-6">{saving ? "Guardando..." : "Guardar cambios"}</Button>
    </form>
  );
}
