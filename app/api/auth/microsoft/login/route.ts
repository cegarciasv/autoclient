import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest) {
  const tenantId = process.env.MICROSOFT_TENANT_ID!;
  const clientId = process.env.MICROSOFT_CLIENT_ID!;
  const appUrl = process.env.APP_URL!;

  const state = crypto.randomUUID();

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: `${appUrl}/api/auth/microsoft/callback`,
    response_mode: "query",
    scope: "openid profile email User.Read",
    state,
  });

  const microsoftUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?${params.toString()}`;

  const response = NextResponse.redirect(microsoftUrl);
  response.cookies.set("ms_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 5, // 5 minutes
    path: "/",
  });

  return response;
}
