import { prisma } from "@/lib/prisma";

export const DEFAULT_BRANDING = {
  colorPrimary: "#0B6B50",
  colorDark: "#08251D",
  colorAccent: "#4AD49F",
};

export async function obtenerBranding() {
  const branding = await prisma.branding.findUnique({
    where: { id: 1 },
    select: { colorPrimary: true, colorDark: true, colorAccent: true, actualizado: true },
  });
  return branding ?? { ...DEFAULT_BRANDING, actualizado: null };
}

// Consulta aparte (y tolerante a fallos) para que una BD sin la columna nueva no rompa el resto de la marca.
export async function cartasAutorizacionActivas(): Promise<boolean> {
  try {
    const config = await prisma.branding.findUnique({
      where: { id: 1 },
      select: { cartasAutorizacion: true },
    });
    return config?.cartasAutorizacion ?? false;
  } catch {
    return false;
  }
}

export function esColorHex(valor: unknown): valor is string {
  return typeof valor === "string" && /^#[0-9a-fA-F]{6}$/.test(valor);
}
