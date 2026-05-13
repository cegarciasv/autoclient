import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.JWT_FORMULARIO_SECRET || "fallback-formulario-secret"
);
const COOKIE_PREFIX = "form_session_";

export interface FormularioPayload {
  terceroId: string;
  token: string;
  tipo: string;
  [key: string]: unknown;
}

export async function crearSesionFormulario(payload: FormularioPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(SECRET);
}

export async function verificarSesionFormulario(
  jwt: string
): Promise<FormularioPayload | null> {
  try {
    const { payload } = await jwtVerify(jwt, SECRET);
    return payload as unknown as FormularioPayload;
  } catch {
    return null;
  }
}

export async function obtenerSesionFormulario(
  urlToken: string
): Promise<FormularioPayload | null> {
  const cookieStore = await cookies();
  const jwt = cookieStore.get(`${COOKIE_PREFIX}${urlToken}`)?.value;
  if (!jwt) return null;
  return verificarSesionFormulario(jwt);
}

export function nombreCookieFormulario(urlToken: string): string {
  return `${COOKIE_PREFIX}${urlToken}`;
}
