import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const branding = await prisma.branding.findUnique({
    where: { id: 1 },
    select: { logoData: true, logoMime: true, actualizado: true },
  });
  if (!branding?.logoData || !branding.logoMime) {
    return new Response(null, {
      status: 307,
      headers: { Location: new URL("/logo.png", req.url).toString(), "Cache-Control": "no-store" },
    });
  }
  return new Response(new Uint8Array(branding.logoData), {
    headers: {
      "Content-Type": branding.logoMime,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
