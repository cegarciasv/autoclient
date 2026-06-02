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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios del Sistema</h1>
          <p className="text-sm text-gray-500 mt-1">Gestión de acceso al panel administrativo</p>
        </div>
        <Link
          href="/admin/usuarios/nuevo"
          className={buttonVariants({
            className:
              "bg-[#2872C7] hover:bg-[#1F5FA8] text-white font-semibold gap-2",
          })}
        >
          <UserPlus className="h-4 w-4" />
          Nuevo Usuario
        </Link>
      </div>

      <Card className="border border-slate-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-slate-800">
            {usuarios.length} usuario{usuarios.length !== 1 ? "s" : ""} registrado{usuarios.length !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
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
                      <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-0 font-semibold">
                        ADMIN
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0 font-semibold">
                        EJECUTIVO
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {u.activo ? (
                      <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border border-blue-200 font-semibold">
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
                      className="text-sm font-medium text-[#2872C7] hover:text-[#1F5FA8] hover:underline"
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
