import { prisma } from "@/lib/prisma";
import { obtenerAdminActual } from "@/lib/auth-admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserPlus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const session = await obtenerAdminActual();
  if (!session || session.rol !== "ADMIN") redirect("/admin/dashboard");

  const usuarios = await prisma.adminUser.findMany({
    orderBy: { creadoEn: "desc" },
    select: {
      id: true,
      nombre: true,
      email: true,
      rol: true,
      activo: true,
      creadoEn: true,
      microsoftId: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <p className="eyebrow">Administración / Accesos</p>
          <h1 className="display-title text-[32px] text-slate-900">Usuarios del sistema</h1>
          <p className="text-sm text-slate-500">Gestión de acceso al panel administrativo</p>
        </div>
        <Link
          href="/admin/usuarios/nuevo"
          className={buttonVariants({
            className:
              "brand-button min-h-11 rounded-xl px-5 font-semibold gap-2",
          })}
        >
          <UserPlus className="h-4 w-4" />
          Nuevo usuario
        </Link>
      </div>

      <Card className="surface-card overflow-x-auto">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-slate-800">
            {usuarios.length} usuario{usuarios.length !== 1 ? "s" : ""} registrado{usuarios.length !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold text-slate-700">Nombre</TableHead>
                <TableHead className="font-semibold text-slate-700">Email</TableHead>
                <TableHead className="font-semibold text-slate-700">Rol</TableHead>
                <TableHead className="font-semibold text-slate-700">Estado</TableHead>
                <TableHead className="font-semibold text-slate-700">Creado</TableHead>
                <TableHead className="font-semibold text-slate-700 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-400 py-10">
                    No hay usuarios registrados
                  </TableCell>
                </TableRow>
              )}
              {usuarios.map((u) => (
                <TableRow key={u.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="font-medium text-slate-900">{u.nombre}</TableCell>
                  <TableCell className="text-slate-600">{u.email}</TableCell>
                  <TableCell>
                    {u.rol === "ADMIN" ? (
                      <Badge className="bg-[#e9f4ef] text-[var(--brand-dark)] hover:bg-[#e9f4ef] border-0 font-semibold">
                        ADMIN
                      </Badge>
                    ) : (
                      <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-0 font-semibold">
                        EJECUTIVO
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {u.activo ? (
                      <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-200 font-semibold">
                        Activo
                      </Badge>
                    ) : (
                      <Badge className="bg-red-50 text-red-700 hover:bg-red-50 border border-red-200 font-semibold">
                        Inactivo
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {new Date(u.creadoEn).toLocaleDateString("es-SV", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/admin/usuarios/${u.id}`}
                      className="text-sm font-medium text-[var(--brand-primary)] hover:text-[var(--brand-dark)] hover:underline"
                    >
                      Editar
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
