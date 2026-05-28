import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { crearSesionAdmin, nombreCookieAdmin } from "@/lib/auth-admin";

/** Construye URL usando APP_URL (dominio público) en vez de request.url
 *  que dentro de Docker/EasyPanel apunta a 0.0.0.0 */
function appRedirect(path: string) {
  const base = (process.env.APP_URL ?? "").replace(/\/$/, "");
  return NextResponse.redirect(`${base}${path}`);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    const storedState = request.cookies.get("ms_oauth_state")?.value;
    if (!state || !storedState || state !== storedState) {
      return appRedirect("/admin/login?error=server_error");
    }

    const tenantId = process.env.MICROSOFT_TENANT_ID!;
    const clientId = process.env.MICROSOFT_CLIENT_ID!;
    const clientSecret = process.env.MICROSOFT_CLIENT_SECRET!;
    const appUrl = (process.env.APP_URL ?? "").replace(/\/$/, "");

    const tokenBody = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      code: code!,
      redirect_uri: `${appUrl}/api/auth/microsoft/callback`,
    });

    const tokenResponse = await fetch(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: tokenBody.toString(),
      },
    );

    if (!tokenResponse.ok) {
      const errBody = await tokenResponse.text();
      console.error("Microsoft token error:", tokenResponse.status, errBody);
      return appRedirect("/admin/login?error=server_error");
    }

    const tokenData = (await tokenResponse.json()) as { id_token: string };
    const idToken = tokenData.id_token;

    const idTokenPayload = JSON.parse(
      Buffer.from(idToken.split(".")[1], "base64url").toString(),
    ) as { email?: string; preferred_username?: string; oid: string };

    const email = idTokenPayload.email ?? idTokenPayload.preferred_username;
    const oid = idTokenPayload.oid;

    if (!email) {
      console.error("Microsoft id_token no contiene email ni preferred_username");
      return appRedirect("/admin/login?error=server_error");
    }

    const user = await prisma.adminUser.findUnique({ where: { email } });

    if (!user || !user.activo) {
      return appRedirect("/admin/login?error=no_access");
    }

    if (!user.microsoftId) {
      await prisma.adminUser.update({
        where: { id: user.id },
        data: { microsoftId: oid },
      });
    }

    const token = await crearSesionAdmin({
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol,
    });

    const response = appRedirect("/admin/dashboard");

    response.cookies.set(nombreCookieAdmin(), token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 8, // 8 horas
      path: "/",
    });

    response.cookies.delete("ms_oauth_state");

    return response;
  } catch (err) {
    console.error("OAuth callback error:", err);
    return appRedirect("/admin/login?error=server_error");
  }
}
