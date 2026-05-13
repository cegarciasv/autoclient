import { redirect } from "next/navigation";
import { obtenerAdminActual } from "@/lib/auth-admin";

export default async function RootPage() {
  const admin = await obtenerAdminActual();
  if (admin) redirect("/admin/dashboard");
  redirect("/admin/login");
}
