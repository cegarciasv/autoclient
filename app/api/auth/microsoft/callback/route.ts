import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { crearSesionAdmin, nombreCookieAdmin } from "@/lib/auth-admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    const storedState = request.cookies.get("ms_oauth_state")?.value;
    if (!state || !storedState || state !== storedState) {
      return NextResponse.redirect(
        new URL("/admin/login?error=server_error", request.url),
      );
    }

    const tenantId = process.env.MICROSOFT_TENANT_ID!;
    const clientId = process.env.MICROSOFT_CLIENT_ID!;
    const clientSecret = process.env.MICROSOFT_CLIENT_SECRET!;
    const appUrl = process.env.APP_URL!;

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
      return NextResponse.redirect(
        new URL("/admin/login?error=server_error", request.url),
      );
    }

    const tokenData = (await tokenResponse.json()) as { id_token: string };
    const idToken = tokenData.id_token;

    const idTokenPayload = JSON.parse(
      Buffer.from(idToken.split(".")[1], "base64url").toString(),
    ) as { email: string; preferred_username?: string; oid: string };

    const email = idTokenPayload.email ?? idTokenPayload.preferred_username;
    const oid = idTokenPayload.oid;

    if (!email) {
      return NextResponse.redirect(
        new URL("/admin/login?error=server_error", request.url),
      );
    }

    const user = await prisma.adminUser.findUnique({ where: { email } });

    if (!user || !user.activo) {
      return NextResponse.redirect(
        new URL("/admin/login?error=no_access", request.url),
      );
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

    const response = NextResponse.redirect(
      new URL("/admin/dashboard", request.url),
    );

    response.cookies.set(nombreCookieAdmin(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8, // 8 hours
      path: "/",
    });

    response.cookies.delete("ms_oauth_state");

    return response;
  } catch {
    return NextResponse.redirect(
      new URL("/admin/login?error=server_error", request.url),
    );
  }
}
