import { redirect } from "next/navigation";
import { obtenerAdminActual } from "@/lib/auth-admin";
import { obtenerBranding } from "@/lib/branding";
import BrandingForm from "@/components/admin/BrandingForm";

export default async function ConfiguracionPage() {
  const admin = await obtenerAdminActual();
  if (admin?.rol !== "ADMIN") redirect("/admin/dashboard");
  const branding = await obtenerBranding();
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configuración de marca</h1>
        <p className="text-sm text-slate-500 mt-1">Personaliza el logo y los colores de esta instalación.</p>
      </div>
      <BrandingForm initial={branding} />
    </div>
  );
}
