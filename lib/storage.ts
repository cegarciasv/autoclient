import fs from "fs";
import path from "path";

const NAS_BASE = process.env.NAS_BASE_PATH || "/mnt/nas/gruporemor/expedientes";

function sanitizarNombre(nombre: string): string {
  return nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
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

export function asegurarDirectorio(rutaDir: string): void {
  if (!fs.existsSync(rutaDir)) {
    fs.mkdirSync(rutaDir, { recursive: true });
  }
}

export async function guardarArchivo(
  rutaDir: string,
  nombreArchivo: string,
  buffer: Buffer
): Promise<string> {
  asegurarDirectorio(rutaDir);
  const nombreSanitizado = sanitizarNombre(path.parse(nombreArchivo).name) + ".pdf";
  const rutaCompleta = path.join(rutaDir, nombreSanitizado);
  fs.writeFileSync(rutaCompleta, buffer);
  return rutaCompleta;
}

export function eliminarArchivo(ruta: string): void {
  if (fs.existsSync(ruta)) {
    fs.unlinkSync(ruta);
  }
}
