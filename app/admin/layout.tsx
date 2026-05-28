import { obtenerAdminActual } from "@/lib/auth-admin";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await obtenerAdminActual();
  return (
    <AdminLayoutClient session={session}>
      {children}
    </AdminLayoutClient>
  );
}
