import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret"
);
const FORM_SECRET = new TextEncoder().encode(
  process.env.JWT_FORMULARIO_SECRET || "fallback-formulario-secret"
);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteger rutas del panel admin
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = request.cookies.get("admin_session")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    try {
      await jwtVerify(token, ADMIN_SECRET);
    } catch {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // Proteger los pasos del formulario (requieren sesión de formulario)
  const matchPaso = pathname.match(/^\/formulario\/([^/]+)\/paso\//);
  if (matchPaso) {
    const urlToken = matchPaso[1];
    const cookieName = `form_session_${urlToken}`;
    const jwt = request.cookies.get(cookieName)?.value;
    if (!jwt) {
      return NextResponse.redirect(new URL(`/formulario/${urlToken}`, request.url));
    }
    try {
      await jwtVerify(jwt, FORM_SECRET);
    } catch {
      return NextResponse.redirect(new URL(`/formulario/${urlToken}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/formulario/:token/paso/:path*"],
};
