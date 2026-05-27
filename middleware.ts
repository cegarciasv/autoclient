import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Estos secretos deben coincidir exactamente con los de lib/auth-admin.ts
// y lib/auth-formulario.ts — el middleware corre en Edge Runtime (sin Node.js completo).
const adminSecret = () =>
  new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");

const formSecret = () =>
  new TextEncoder().encode(
    process.env.JWT_FORMULARIO_SECRET || "fallback-formulario-secret"
  );

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  /* ── Proteger /admin/* (excepto /admin/login y /api/auth/admin/*) ── */
  if (
    pathname.startsWith("/admin") &&
    !pathname.startsWith("/admin/login")
  ) {
    const token = req.cookies.get("admin_session")?.value;

    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }

    try {
      await jwtVerify(token, adminSecret());
      return NextResponse.next();
    } catch {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  /* ── Proteger /formulario/[token]/paso/* ── */
  const pasoMatch = pathname.match(/^\/formulario\/([^/]+)\/paso/);
  if (pasoMatch) {
    const urlToken = pasoMatch[1];
    const cookieName = `form_session_${urlToken}`;
    const jwt = req.cookies.get(cookieName)?.value;

    if (!jwt) {
      const url = req.nextUrl.clone();
      url.pathname = `/formulario/${urlToken}`;
      return NextResponse.redirect(url);
    }

    try {
      await jwtVerify(jwt, formSecret());
      return NextResponse.next();
    } catch {
      const url = req.nextUrl.clone();
      url.pathname = `/formulario/${urlToken}`;
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Ejecutar el middleware sólo en las rutas que necesitan protección.
  // Las API routes de formulario y auth no necesitan middleware (tienen su propia auth).
  matcher: [
    "/admin/:path*",
    "/formulario/:token/paso/:path*",
  ],
};
