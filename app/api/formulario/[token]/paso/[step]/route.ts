import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerSesionFormulario } from "@/lib/auth-formulario";

const TOTAL_PASOS_CLIENTE = 6;
const TOTAL_PASOS_PROVEEDOR = 7;

type Ctx = { params: Promise<{ token: string; step: string }> };

export async function GET(request: NextRequest, ctx: Ctx) {
  const { token, step } = await ctx.params;
  const sesion = await obtenerSesionFormulario(token);
  if (!sesion) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const formulario = await prisma.formulario.findUnique({
    where: { terceroId: sesion.terceroId },
    include: {
      infoGeneral: true,
      accionistas: true,
      clientesPrincipales: true,
      infoFinanciera: true,
      referencias: true,
      encuestaProveedor: true,
      documentos: true,
      tercero: { select: { razonSocial: true, tipo: true, tipoDocumento: true, numeroDocumento: true, email: true } },
    },
  });

  if (!formulario) return NextResponse.json({ error: "Formulario no encontrado" }, { status: 404 });

  return NextResponse.json({ formulario, paso: Number(step) });
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  const { token, step } = await ctx.params;
  const sesion = await obtenerSesionFormulario(token);
  if (!sesion) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const pasoNum = Number(step);
  const formulario = await prisma.formulario.findUnique({
    where: { terceroId: sesion.terceroId },
  });
  if (!formulario) return NextResponse.json({ error: "Formulario no encontrado" }, { status: 404 });

  const totalPasos = sesion.tipo === "PROVEEDOR" ? TOTAL_PASOS_PROVEEDOR : TOTAL_PASOS_CLIENTE;
  const nuevoPasoActual = Math.max(formulario.pasoActual, pasoNum + 1);
  const progreso = Math.round((pasoNum / totalPasos) * 100);

  try {
    switch (pasoNum) {
      case 1:
        await guardarPaso1(formulario.id, body as Record<string, unknown>);
        break;
      case 2:
        await guardarPaso2(formulario.id, body as Record<string, unknown>);
        break;
      case 3:
        await guardarPaso3(formulario.id, body as Record<string, unknown>);
        break;
      case 4:
        await guardarPaso4(formulario.id, body as Record<string, unknown>);
        break;
      case 5:
        if (sesion.tipo === "PROVEEDOR") await guardarPaso5(formulario.id, body as Record<string, unknown>);
        break;
    }

    await prisma.formulario.update({
      where: { id: formulario.id },
      data: { pasoActual: nuevoPasoActual, progreso },
    });

    return NextResponse.json({ ok: true, pasoActual: nuevoPasoActual, progreso });
  } catch (err) {
    console.error(`Error guardando paso ${pasoNum}:`, err);
    return NextResponse.json({ error: "Error al guardar los datos" }, { status: 500 });
  }
}

/** Convierte string a Date; retorna null si está vacío o es inválido */
function toDate(v: unknown): Date | null {
  if (!v || v === "") return null;
  const d = new Date(v as string);
  return isNaN(d.getTime()) ? null : d;
}

/** Convierte número en string a Decimal; retorna null si está vacío */
function toDecimal(v: unknown): number | null {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

async function guardarPaso1(formularioId: string, data: Record<string, unknown>) {
  const { infoGeneral, clientesPrincipales } = data as {
    infoGeneral: Record<string, unknown>;
    clientesPrincipales: Array<{ nombreRazonSocial: string; porcentajeParticipacion: string }>;
  };

  if (infoGeneral) {
    // Campos DateTime: convertir strings a Date (null si vacío)
    const FECHA_FALLBACK = new Date("1900-01-01"); // placeholder para pruebas
    const ig = {
      ...infoGeneral,
      rlFechaExpedicion:  toDate(infoGeneral.rlFechaExpedicion)  ?? FECHA_FALLBACK,
      rlFechaVencimiento: toDate(infoGeneral.rlFechaVencimiento) ?? null,
      rlFechaNacimiento:  toDate(infoGeneral.rlFechaNacimiento)  ?? FECHA_FALLBACK,
    };
    await prisma.infoGeneral.upsert({
      where: { formularioId },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      create: { formularioId, ...(ig as any) },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      update: ig as any,
    });
  }

  if (Array.isArray(clientesPrincipales)) {
    await prisma.clientePrincipal.deleteMany({ where: { formularioId } });
    if (clientesPrincipales.length > 0) {
      await prisma.clientePrincipal.createMany({
        data: clientesPrincipales.map((c) => ({ ...c, formularioId })),
      });
    }
  }
}

async function guardarPaso2(formularioId: string, data: Record<string, unknown>) {
  const accionistas = data.accionistas as Array<Record<string, unknown>>;
  if (Array.isArray(accionistas)) {
    await prisma.accionista.deleteMany({ where: { formularioId } });
    if (accionistas.length > 0) {
      await prisma.accionista.createMany({
        data: accionistas.map((a) => ({
          ...a,
          porcentajeParticipacion: toDecimal(a.porcentajeParticipacion) ?? 0,
          formularioId,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any)),
      });
    }
  }
}

async function guardarPaso3(formularioId: string, data: Record<string, unknown>) {
  const raw = (data.infoFinanciera ?? data) as Record<string, unknown>;
  // Convertir strings a decimales (Prisma Decimal requiere número, no string vacío)
  const infoFinanciera = {
    ...raw,
    totalActivo:            toDecimal(raw.totalActivo)            ?? 0,
    totalPasivo:            toDecimal(raw.totalPasivo)            ?? 0,
    totalPatrimonio:        toDecimal(raw.totalPatrimonio)        ?? 0,
    ingresosMensuales:      toDecimal(raw.ingresosMensuales)      ?? 0,
    egresosMensuales:       toDecimal(raw.egresosMensuales)       ?? 0,
    otrosIngresosMensuales: toDecimal(raw.otrosIngresosMensuales) ?? null,
  };
  await prisma.infoFinanciera.upsert({
    where: { formularioId },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    create: { formularioId, ...(infoFinanciera as any) },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    update: infoFinanciera as any,
  });
}

async function guardarPaso4(formularioId: string, data: Record<string, unknown>) {
  const referencias = data.referencias as Array<Record<string, unknown>>;
  if (Array.isArray(referencias)) {
    await prisma.referenciaComercial.deleteMany({ where: { formularioId } });
    if (referencias.length > 0) {
      await prisma.referenciaComercial.createMany({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: referencias.map((r) => ({ ...r, formularioId } as any)),
      });
    }
  }
}

async function guardarPaso5(formularioId: string, data: Record<string, unknown>) {
  const encuesta = (data.encuestaProveedor ?? data) as Record<string, unknown>;
  await prisma.encuestaProveedor.upsert({
    where: { formularioId },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    create: { formularioId, ...(encuesta as any) },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    update: encuesta as any,
  });
}
