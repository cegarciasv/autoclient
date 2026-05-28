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
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login") && !pathname.startsWith("/api/auth/")) {
    const token = request.cookies.get("admin_session")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    try {
      const { payload } = await jwtVerify(token, ADMIN_SECRET);

      // Control de acceso por rol: solo ADMIN puede acceder a /admin/usuarios
      if (pathname.startsWith("/admin/usuarios") && payload.rol !== "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
    } catch {
      const response = NextResponse.redirect(new URL("/admin/login", request.url));
      response.cookies.delete("admin_session");
      return response;
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
