import crypto from "crypto";

export function generarTokenUnico(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function tokenExpiraEn(dias: number): Date {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return fecha;
}
