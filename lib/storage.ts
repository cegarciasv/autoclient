import fs from "fs/promises";
import { existsSync, mkdirSync } from "fs";
import path from "path";

const NAS_BASE = process.env.NAS_BASE_PATH || "/mnt/nas/gruporemor/expedientes";

/** Elimina tildes y caracteres especiales para nombres de archivo seguros */
function sanitizarNombre(nombre: string): string {
  return nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")   // ← rango correcto para marcas diacríticas
    .replace(/[^a-zA-Z0-9_\-]/g, "_")
    .slice(0, 50);
}

export function obtenerRutaExpediente(
  terceroId: string,
  razonSocial: string,
  tipo: "clientes" | "proveedores"
): string {
  const carpeta = `${terceroId}_${sanitizarNombre(razonSocial)}`;
  return path.join(NAS_BASE, tipo, carpeta);
}

/** Crea el directorio si no existe (síncrono, sólo en preparación) */
export function asegurarDirectorio(rutaDir: string): void {
  if (!existsSync(rutaDir)) {
    mkdirSync(rutaDir, { recursive: true });
  }
}

/** Guarda un archivo en el NAS de forma asíncrona (no bloquea el event loop) */
export async function guardarArchivo(
  rutaDir: string,
  nombreArchivo: string,
  buffer: Buffer
): Promise<string> {
  asegurarDirectorio(rutaDir);
  const nombreSanitizado =
    sanitizarNombre(path.parse(nombreArchivo).name) + ".pdf";
  const rutaCompleta = path.join(rutaDir, nombreSanitizado);
  await fs.writeFile(rutaCompleta, buffer);   // ← async: no bloquea
  return rutaCompleta;
}

/** Elimina un archivo si existe */
export async function eliminarArchivo(ruta: string): Promise<void> {
  try {
    await fs.unlink(ruta);
  } catch {
    // Si no existe, ignorar
  }
}
