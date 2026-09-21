import { NextResponse } from "next/server";
import { obtenerAdminActual } from "@/lib/auth-admin";
import { esColorHex } from "@/lib/branding";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const admin = await obtenerAdminActual();
  if (admin?.rol !== "ADMIN") return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const form = await req.formData();
  const colorPrimary = form.get("colorPrimary");
  const colorDark = form.get("colorDark");
  const colorAccent = form.get("colorAccent");
  if (!esColorHex(colorPrimary) || !esColorHex(colorDark) || !esColorHex(colorAccent)) {
    return NextResponse.json({ error: "Los colores deben tener formato hexadecimal" }, { status: 400 });
  }

  const logo = form.get("logo");
  let logoData: Uint8Array<ArrayBuffer> | undefined;
  let logoMime: string | undefined;
  if (logo instanceof File && logo.size > 0) {
    if (logo.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "El logo no puede superar 2 MB" }, { status: 400 });
    }
    const bytes = new Uint8Array(await logo.arrayBuffer());
    const png = bytes.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((n, i) => bytes[i] === n);
    const jpeg = bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    const webp = bytes.length >= 12 && new TextDecoder("ascii").decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder("ascii").decode(bytes.slice(8, 12)) === "WEBP";
    logoMime = png ? "image/png" : jpeg ? "image/jpeg" : webp ? "image/webp" : undefined;
    if (!logoMime) return NextResponse.json({ error: "Use un logo PNG, JPG o WebP" }, { status: 400 });
    logoData = bytes;
  }

  await prisma.branding.upsert({
    where: { id: 1 },
    create: { id: 1, colorPrimary, colorDark, colorAccent, ...(logoData ? { logoData, logoMime } : {}) },
    update: { colorPrimary, colorDark, colorAccent, ...(logoData ? { logoData, logoMime } : {}) },
  });
  return NextResponse.json({ ok: true });
}
