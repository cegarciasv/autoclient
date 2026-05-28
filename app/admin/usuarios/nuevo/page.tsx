import { obtenerAdminActual } from "@/lib/auth-admin";
import { redirect } from "next/navigation";
import FormNuevoUsuario from "@/components/admin/FormNuevoUsuario";

export default async function NuevoUsuarioPage() {
  const session = await obtenerAdminActual();
  if (!session || session.rol !== "ADMIN") redirect("/admin/dashboard");

  return <FormNuevoUsuario />;
}
