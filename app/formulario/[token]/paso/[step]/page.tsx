import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { obtenerSesionFormulario } from "@/lib/auth-formulario";
import FormularioPasos from "@/components/formulario/FormularioPasos";

export default async function PasoPage({
  params,
}: {
  params: Promise<{ token: string; step: string }>;
}) {
  const { token, step } = await params;
  const sesion = await obtenerSesionFormulario(token);

  if (!sesion) redirect(`/formulario/${token}`);

  const pasoNum = Number(step);
  if (isNaN(pasoNum) || pasoNum < 1 || pasoNum > 6) notFound();

  const formulario = await prisma.formulario.findUnique({
    where: { terceroId: sesion.terceroId },
    include: {
      infoGeneral: true,
      accionistas: true,
      clientesPrincipales: true,
      infoFinanciera: true,
      referencias: true,
      encuestaProveedor: true,
      documentos: { select: { tipo: true, nombreArchivo: true, tamanoBytes: true } },
      tercero: {
        select: { razonSocial: true, tipo: true, tipoDocumento: true, numeroDocumento: true, email: true },
      },
    },
  });

  if (!formulario) redirect(`/formulario/${token}`);

  const totalPasos = sesion.tipo === "PROVEEDOR" ? 6 : 5;

  return (
    <FormularioPasos
      token={token}
      pasoActual={pasoNum}
      totalPasos={totalPasos}
      progreso={formulario.progreso}
      tipo={sesion.tipo as "CLIENTE" | "PROVEEDOR"}
      formulario={JSON.parse(JSON.stringify(formulario))}
    />
  );
}
