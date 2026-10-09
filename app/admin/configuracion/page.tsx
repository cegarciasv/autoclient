import { redirect } from "next/navigation";
import { obtenerAdminActual } from "@/lib/auth-admin";
import { obtenerBranding, cartasAutorizacionActivas } from "@/lib/branding";
import BrandingForm from "@/components/admin/BrandingForm";

export default async function ConfiguracionPage() {
  const admin = await obtenerAdminActual();
  if (admin?.rol !== "ADMIN") redirect("/admin/dashboard");
  const [branding, cartas] = await Promise.all([obtenerBranding(), cartasAutorizacionActivas()]);
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="space-y-2">
        <p className="eyebrow">Preferencias / Apariencia</p>
        <h1 className="display-title text-[32px] text-slate-900">Configuración de marca</h1>
        <p className="text-sm text-slate-500">Personaliza el logo, los colores y los documentos opcionales de esta instalación.</p>
      </div>
      <BrandingForm initial={branding} cartasInicial={cartas} />
    </div>
  );
}
