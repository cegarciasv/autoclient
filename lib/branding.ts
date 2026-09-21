import { prisma } from "@/lib/prisma";

export const DEFAULT_BRANDING = {
  colorPrimary: "#1A7A30",
  colorDark: "#1B3C22",
  colorAccent: "#4ADE80",
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
