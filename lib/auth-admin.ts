import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET no está definido. Configura esta variable de entorno.");
}
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "dev-fallback-admin-secret-32chars!!");
const COOKIE = "admin_session";

export interface AdminPayload {
  id: string;
  email: string;
  rol: string;
  [key: string]: unknown;
}

export async function crearSesionAdmin(payload: AdminPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(SECRET);
}

export async function verificarSesionAdmin(token: string): Promise<AdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as AdminPayload;
  } catch {
    return null;
  }
}

export async function obtenerAdminActual(): Promise<AdminPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  if (!token) return null;
  return verificarSesionAdmin(token);
}

export function nombreCookieAdmin(): string {
  return COOKIE;
}
