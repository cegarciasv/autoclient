import { NextResponse } from "next/server";
import { nombreCookieAdmin } from "@/lib/auth-admin";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(nombreCookieAdmin());
  return response;
}
