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

export function esColorHex(valor: unknown): valor is string {
  return typeof valor === "string" && /^#[0-9a-fA-F]{6}$/.test(valor);
}
