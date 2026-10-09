import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { obtenerSesionFormulario } from "@/lib/auth-formulario";
import { LABELS_CAMPO, MAX_TEXTO } from "@/lib/formulario-reglas";

const TOTAL_PASOS_CLIENTE = 5;
const TOTAL_PASOS_PROVEEDOR = 6;

type Ctx = { params: Promise<{ token: string; step: string }> };
type Tx = Prisma.TransactionClient;

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

/* ── Esquemas: solo se aceptan los campos conocidos (el resto se descarta) ── */

// Los campos obligatorios se exigen al finalizar (lib/formulario-reglas.ts), no al guardar,
// para que "Guardar borrador" funcione con datos incompletos.
const txt = z.string().max(MAX_TEXTO).nullish();
const bool = z.boolean().nullish();
const numeroOTexto = z.union([z.string().max(MAX_TEXTO), z.number()]).nullish();

const CAMPOS_TEXTO_IG = [
  "razonSocial", "nombreComercial", "nit", "actividadReal", "tipoEmpresa", "tipoActividadEconomica",
  "productoServicio", "direccionPrincipal", "departamento", "ciudad", "correoElectronico",
  "telefonoFijo", "telefonoCelular",
  "rlPrimerApellido", "rlSegundoApellido", "rlNombres", "rlTipoIdentificacion", "rlNumeroDocumento",
  "rlLugarExpedicion", "rlGenero", "rlEstadoCivil", "rlLugarNacimiento",
  "nrc", "codigoActividadEconomica", "categoriaContribuyente", "nombreContacto",
  "correoVendedor", "correoComprobantes", "numeroCuentaBancaria", "titularCuenta", "tipoCuenta", "banco",
] as const;
const CAMPOS_BOOL_IG = [
  "obligacionesTributarias", "sistemaLAFT",
  "pepRecursosPublicos", "pepFamiliaresPublicos", "pepCargosPublicos", "pepSistemaLAFT",
] as const;
const CAMPOS_FECHA_IG = ["rlFechaExpedicion", "rlFechaVencimiento", "rlFechaNacimiento"] as const;

const infoGeneralSchema = z.object({
  tipoPersona: z.enum(["NATURAL", "JURIDICA"]).nullish(),
  ...Object.fromEntries(CAMPOS_TEXTO_IG.map((c) => [c, txt])),
  ...Object.fromEntries(CAMPOS_BOOL_IG.map((c) => [c, bool])),
  ...Object.fromEntries(CAMPOS_FECHA_IG.map((c) => [c, txt])),
});

const paso1Schema = z.object({
  infoGeneral: infoGeneralSchema.nullish(),
  clientesPrincipales: z.array(z.object({
    nombreRazonSocial: txt,
    porcentajeParticipacion: numeroOTexto,
  })).max(50).nullish(),
});

const paso2Schema = z.object({
  accionistas: z.array(z.object({
    tipoIdentificacion: txt,
    numeroDocumento: txt,
    nombreRazonSocial: txt,
    recursosPublicos: bool,
    cargoPoder: bool,
    reconocidoPublicamente: bool,
    declaracionPais: txt,
    porcentajeParticipacion: numeroOTexto,
  })).max(50),
});

const paso3Schema = z.object({
  referencias: z.array(z.object({
    nombreRazonSocial: txt,
    telefonoFijo: txt,
    telefonoCelular: txt,
    direccion: txt,
  })).max(30),
});

const encuestaSchema = z.object({
  trayectoriaExperiencia: txt,
  certificacionesInternacionales: bool,
  detallesCertificaciones: txt,
  polizasSeguros: bool,
  detallesPolizas: txt,
  prestacionesLey: bool,
  programaSeguridadSalud: bool,
  creditoOtorga: txt,
  garantiasFianzas: bool,
  presenciaRegional: txt,
  campanasReciclaje: bool,
  detallesReciclaje: txt,
});

function mensajeError(error: z.ZodError): string {
  const issue = error.issues[0];
  const campo = String(issue.path[issue.path.length - 1] ?? "");
  const etiqueta = LABELS_CAMPO[campo] ?? campo;
  if (issue.code === "too_big") {
    return issue.origin === "array"
      ? "Hay demasiados registros en esta sección"
      : `${etiqueta}: máximo ${MAX_TEXTO} caracteres`;
  }
  return `Dato inválido${etiqueta ? ` en ${etiqueta}` : ""}`;
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  const { token, step } = await ctx.params;
  const sesion = await obtenerSesionFormulario(token);
  if (!sesion) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const totalPasos = sesion.tipo === "PROVEEDOR" ? TOTAL_PASOS_PROVEEDOR : TOTAL_PASOS_CLIENTE;
  const pasoNum = Number(step);
  if (!Number.isInteger(pasoNum) || pasoNum < 1 || pasoNum > totalPasos) {
    return NextResponse.json({ error: "Paso inválido" }, { status: 400 });
  }

  const formulario = await prisma.formulario.findUnique({
    where: { terceroId: sesion.terceroId },
  });
  if (!formulario) return NextResponse.json({ error: "Formulario no encontrado" }, { status: 404 });

  const nuevoPasoActual = Math.min(Math.max(formulario.pasoActual, pasoNum + 1), totalPasos);

  // El progreso nunca retrocede: si el formulario ya está más avanzado (o completado), se respeta.
  // Un formulario COMPLETADO (estado = COMPLETADO) siempre muestra 100%.
  const progresoCalculado = Math.min(100, Math.round((pasoNum / totalPasos) * 100));
  const estaCompletado = formulario.estado === "COMPLETADO";
  const progreso = estaCompletado ? 100 : Math.max(formulario.progreso, progresoCalculado);

  // Se validan los datos ANTES de abrir la transacción
  let guardarDatos: ((tx: Tx) => Promise<void>) | null = null;
  switch (pasoNum) {
    case 1: {
      const r = paso1Schema.safeParse(body);
      if (!r.success) return NextResponse.json({ error: mensajeError(r.error) }, { status: 400 });
      guardarDatos = (tx) => guardarPaso1(tx, formulario.id, formulario.terceroId, r.data);
      break;
    }
    case 2: {
      const r = paso2Schema.safeParse(body);
      if (!r.success) return NextResponse.json({ error: mensajeError(r.error) }, { status: 400 });
      const fueraDeRango = r.data.accionistas.some((a) => {
        const pct = toDecimal(a.porcentajeParticipacion) ?? 0;
        return pct < 0 || pct > 100;
      });
      if (fueraDeRango) {
        return NextResponse.json({ error: "El % de participación debe estar entre 0 y 100" }, { status: 400 });
      }
      guardarDatos = (tx) => guardarPaso2(tx, formulario.id, r.data);
      break;
    }
    case 3: {
      const r = paso3Schema.safeParse(body);
      if (!r.success) return NextResponse.json({ error: mensajeError(r.error) }, { status: 400 });
      guardarDatos = (tx) => guardarPaso3(tx, formulario.id, r.data);
      break;
    }
    case 4: {
      if (sesion.tipo !== "PROVEEDOR") break;
      const crudo = "encuestaProveedor" in body ? (body as { encuestaProveedor: unknown }).encuestaProveedor : body;
      const r = encuestaSchema.safeParse(crudo);
      if (!r.success) return NextResponse.json({ error: mensajeError(r.error) }, { status: 400 });
      guardarDatos = (tx) => guardarPaso4(tx, formulario.id, r.data);
      break;
    }
  }

  try {
    // Datos y progreso se guardan juntos: si algo falla no se pierde lo que ya había
    await prisma.$transaction(async (tx) => {
      if (guardarDatos) await guardarDatos(tx);
      await tx.formulario.update({
        where: { id: formulario.id },
        data: { pasoActual: nuevoPasoActual, progreso },
      });
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

// Las fechas obligatorias de la BD no admiten NULL: sin dato se guarda este valor (1900-01-01)
const FECHA_SIN_DATO = new Date("1900-01-01");

const IG_POR_DEFECTO = {
  razonSocial: "", nit: "", actividadReal: "", tipoEmpresa: "", tipoActividadEconomica: "",
  productoServicio: "", direccionPrincipal: "", departamento: "", ciudad: "", correoElectronico: "",
  rlFechaExpedicion: FECHA_SIN_DATO, rlFechaNacimiento: FECHA_SIN_DATO,
};

type Paso1 = z.infer<typeof paso1Schema>;

async function guardarPaso1(tx: Tx, formularioId: string, terceroId: string, data: Paso1) {
  // El esquema se arma a partir de listas de campos, por eso se tipa de forma explícita
  const ig = data.infoGeneral as (Record<string, unknown> & { tipoPersona?: "NATURAL" | "JURIDICA" | null }) | null | undefined;

  if (ig) {
    // tipoPersona vive en Tercero, no en InfoGeneral
    if (ig.tipoPersona) {
      await tx.tercero.update({ where: { id: terceroId }, data: { tipoPersona: ig.tipoPersona } });
    }

    const valores: Record<string, unknown> = {};
    for (const c of [...CAMPOS_TEXTO_IG, ...CAMPOS_BOOL_IG]) {
      if (ig[c] != null) valores[c] = ig[c];
    }
    if (ig.rlFechaExpedicion != null) valores.rlFechaExpedicion = toDate(ig.rlFechaExpedicion) ?? FECHA_SIN_DATO;
    if (ig.rlFechaVencimiento != null) valores.rlFechaVencimiento = toDate(ig.rlFechaVencimiento);
    if (ig.rlFechaNacimiento != null) valores.rlFechaNacimiento = toDate(ig.rlFechaNacimiento) ?? FECHA_SIN_DATO;

    await tx.infoGeneral.upsert({
      where: { formularioId },
      create: { ...IG_POR_DEFECTO, ...valores, formularioId } as Prisma.InfoGeneralUncheckedCreateInput,
      update: valores as Prisma.InfoGeneralUncheckedUpdateInput,
    });
  }

  if (data.clientesPrincipales) {
    await tx.clientePrincipal.deleteMany({ where: { formularioId } });
    const filas = data.clientesPrincipales
      .filter((c) => (c.nombreRazonSocial ?? "").trim() !== "")
      .map((c) => ({
        formularioId,
        nombreRazonSocial: c.nombreRazonSocial ?? "",
        porcentajeParticipacion: String(c.porcentajeParticipacion ?? "") || "0",
      }));
    if (filas.length > 0) await tx.clientePrincipal.createMany({ data: filas });
  }
}

async function guardarPaso2(tx: Tx, formularioId: string, data: z.infer<typeof paso2Schema>) {
  await tx.accionista.deleteMany({ where: { formularioId } });
  if (data.accionistas.length > 0) {
    await tx.accionista.createMany({
      data: data.accionistas.map((a) => ({
        formularioId,
        tipoIdentificacion: a.tipoIdentificacion ?? "",
        numeroDocumento: a.numeroDocumento ?? "",
        nombreRazonSocial: a.nombreRazonSocial ?? "",
        recursosPublicos: a.recursosPublicos ?? false,
        cargoPoder: a.cargoPoder ?? false,
        reconocidoPublicamente: a.reconocidoPublicamente ?? false,
        declaracionPais: a.declaracionPais ?? "",
        porcentajeParticipacion: toDecimal(a.porcentajeParticipacion) ?? 0,
      })),
    });
  }
}

async function guardarPaso3(tx: Tx, formularioId: string, data: z.infer<typeof paso3Schema>) {
  await tx.referenciaComercial.deleteMany({ where: { formularioId } });
  if (data.referencias.length > 0) {
    await tx.referenciaComercial.createMany({
      data: data.referencias.map((r) => ({
        formularioId,
        nombreRazonSocial: r.nombreRazonSocial ?? "",
        telefonoFijo: r.telefonoFijo ?? "",
        telefonoCelular: r.telefonoCelular ?? "",
        direccion: r.direccion ?? "",
      })),
    });
  }
}

const ENCUESTA_POR_DEFECTO = {
  trayectoriaExperiencia: "", creditoOtorga: "", presenciaRegional: "",
  certificacionesInternacionales: false, polizasSeguros: false, prestacionesLey: false,
  programaSeguridadSalud: false, garantiasFianzas: false, campanasReciclaje: false,
};

async function guardarPaso4(tx: Tx, formularioId: string, data: z.infer<typeof encuestaSchema>) {
  const valores = Object.fromEntries(Object.entries(data).filter(([, v]) => v != null));
  await tx.encuestaProveedor.upsert({
    where: { formularioId },
    create: { ...ENCUESTA_POR_DEFECTO, ...valores, formularioId } as Prisma.EncuestaProveedorUncheckedCreateInput,
    update: valores as Prisma.EncuestaProveedorUncheckedUpdateInput,
  });
}
