import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// Se valida en runtime (no en build-time) para evitar errores durante next build.
function getSecret(): Uint8Array {
  const raw = process.env.JWT_SECRET;
  if (!raw) {
    throw new Error("JWT_SECRET no está definido. Configura esta variable de entorno.");
  }
  return new TextEncoder().encode(raw);
}

const COOKIE = "admin_session";

export interface AdminPayload {
  id: string;
  email: string;
  nombre: string;
  rol: string;
  [key: string]: unknown;
}

export async function crearSesionAdmin(payload: AdminPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecret());
}

export async function verificarSesionAdmin(token: string): Promise<AdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
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
