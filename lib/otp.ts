import crypto from "crypto";

export function generarOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export function otpExpiraEn(minutos = 15): Date {
  const fecha = new Date();
  fecha.setMinutes(fecha.getMinutes() + minutos);
  return fecha;
}
