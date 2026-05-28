import { prisma } from "@/lib/prisma";
import { obtenerAdminActual } from "@/lib/auth-admin";
import { redirect, notFound } from "next/navigation";
import FormEditarUsuario from "@/components/admin/FormEditarUsuario";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditarUsuarioPage({ params }: Props) {
  const { id } = await params;
  const session = await obtenerAdminActual();
  if (!session || session.rol !== "ADMIN") redirect("/admin/dashboard");

  const usuario = await prisma.adminUser.findUnique({
    where: { id },
    select: {
      id: true,
      nombre: true,
      email: true,
      rol: true,
      activo: true,
      creadoEn: true,
    },
  });

  if (!usuario) notFound();

  const esSelf = session.id === usuario.id;

  return (
    <FormEditarUsuario
      usuario={{ ...usuario, creadoEn: usuario.creadoEn.toISOString() }}
      esSelf={esSelf}
    />
  );
}
