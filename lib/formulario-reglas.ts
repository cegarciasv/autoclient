// Reglas de obligatoriedad compartidas entre el formulario (navegador) y el servidor.

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Las columnas de texto de la BD son VARCHAR(191)
export const MAX_TEXTO = 191;

// Obligatorios para todos los terceros
export const CAMPOS_REQUERIDOS_BASE = [
  "razonSocial", "nit", "actividadReal", "tipoActividadEconomica",
  "direccionPrincipal", "departamento", "ciudad", "correoElectronico", "productoServicio",
];

// Obligatorios solo para persona jurídica
export const CAMPOS_REQUERIDOS_JURIDICA = [
  "nombreComercial", "tipoEmpresa", "nrc",
  "rlPrimerApellido", "rlSegundoApellido", "rlNombres",
  "rlTipoIdentificacion", "rlNumeroDocumento", "rlFechaExpedicion",
  "rlLugarExpedicion", "rlGenero", "rlEstadoCivil",
  "rlFechaNacimiento", "rlLugarNacimiento",
];

// Obligatorios solo para proveedores
export const CAMPOS_REQUERIDOS_PROVEEDOR = [
  "codigoActividadEconomica", "categoriaContribuyente",
  "telefonoCelular",
  "nombreContacto", "correoVendedor", "correoComprobantes",
  "numeroCuentaBancaria", "titularCuenta", "tipoCuenta", "banco",
];

export const CAMPOS_CORREO = ["correoElectronico", "correoVendedor", "correoComprobantes"];

export const LABELS_CAMPO: Record<string, string> = {
  razonSocial:              "Razón Social / Nombre",
  nit:                      "NIT",
  actividadReal:            "Giro / Actividad Real",
  tipoActividadEconomica:   "Tipo de Actividad Económica",
  direccionPrincipal:       "Dirección Principal",
  departamento:             "Departamento",
  ciudad:                   "Ciudad / Municipio",
  correoElectronico:        "Correo Electrónico",
  productoServicio:         "Producto / Servicio principal",
  nrc:                      "N° de Registro IVA / NRC",
  codigoActividadEconomica: "Código de Actividad Económica",
  categoriaContribuyente:   "Categoría de Contribuyente",
  telefonoCelular:          "Teléfono Celular",
  nombreContacto:           "Nombre de Contacto",
  correoVendedor:           "Correo del Vendedor",
  correoComprobantes:       "Correo de Comprobantes de Pago",
  numeroCuentaBancaria:     "Número de Cuenta Bancaria",
  titularCuenta:            "Titular de la Cuenta",
  tipoCuenta:               "Tipo de Cuenta",
  banco:                    "Banco",
  nombreComercial:          "Nombre Comercial",
  tipoEmpresa:              "Tipo de Empresa",
  rlPrimerApellido:         "Primer Apellido (Representante Legal)",
  rlSegundoApellido:        "Segundo Apellido (Representante Legal)",
  rlNombres:                "Nombres (Representante Legal)",
  rlTipoIdentificacion:     "Tipo de Identificación (Representante Legal)",
  rlNumeroDocumento:        "Número de Documento (Representante Legal)",
  rlFechaExpedicion:        "Fecha de Expedición (Representante Legal)",
  rlLugarExpedicion:        "Lugar de Expedición (Representante Legal)",
  rlGenero:                 "Género (Representante Legal)",
  rlEstadoCivil:            "Estado Civil (Representante Legal)",
  rlFechaNacimiento:        "Fecha de Nacimiento (Representante Legal)",
  rlLugarNacimiento:        "Lugar de Nacimiento (Representante Legal)",
};

type Registro = Record<string, unknown>;

export interface DatosCompletitud {
  tipo: "CLIENTE" | "PROVEEDOR";
  tipoPersona: string | null;
  infoGeneral: Registro | null;
  accionistas: Registro[];
  referencias: Registro[];
  encuesta: Registro | null;
}

function vacio(valor: unknown): boolean {
  if (valor == null) return true;
  // Las fechas obligatorias vacías se guardan como 1900-01-01 (la columna no admite NULL)
  if (valor instanceof Date) return isNaN(valor.getTime()) || valor.getFullYear() === 1900;
  if (typeof valor === "string") return valor.trim() === "";
  return false;
}

/** Devuelve la lista de secciones/campos que faltan para poder finalizar el formulario. */
export function validarCompletitud(d: DatosCompletitud): string[] {
  const problemas: string[] = [];
  const esJuridica = d.tipoPersona !== "NATURAL";

  const ig = d.infoGeneral;
  if (!ig) {
    problemas.push("Información General");
  } else {
    const requeridos = new Set([
      ...CAMPOS_REQUERIDOS_BASE,
      ...(esJuridica ? CAMPOS_REQUERIDOS_JURIDICA : []),
      ...(d.tipo === "PROVEEDOR" ? CAMPOS_REQUERIDOS_PROVEEDOR : []),
    ]);
    const faltantes = [...requeridos].filter((c) => vacio(ig[c]));
    const correosInvalidos = CAMPOS_CORREO.filter((c) => !vacio(ig[c]) && !EMAIL_REGEX.test(String(ig[c])));
    const detalle = [
      ...faltantes.map((c) => LABELS_CAMPO[c] ?? c),
      ...correosInvalidos.map((c) => `${LABELS_CAMPO[c] ?? c} (formato inválido)`),
    ];
    if (detalle.length > 0) problemas.push(`Información General: ${detalle.join(", ")}`);
  }

  // Accionistas: obligatorios para persona jurídica; para persona natural son opcionales
  const incompleto = (a: Registro) =>
    vacio(a.tipoIdentificacion) || vacio(a.numeroDocumento) || vacio(a.nombreRazonSocial) || vacio(a.declaracionPais);
  if (esJuridica && d.accionistas.length === 0) {
    problemas.push("Accionistas: registre al menos uno");
  } else if (d.accionistas.some(incompleto)) {
    problemas.push("Accionistas: hay datos incompletos");
  }
  const totalParticipacion = d.accionistas.reduce((suma, a) => suma + Number(a.porcentajeParticipacion ?? 0), 0);
  if (totalParticipacion > 100.001) problemas.push("Accionistas: la suma de participaciones supera 100%");

  const refIncompleta = (r: Registro) => vacio(r.nombreRazonSocial) || vacio(r.telefonoCelular) || vacio(r.direccion);
  if (d.referencias.length < 2 || d.referencias.some(refIncompleta)) {
    problemas.push("Referencias comerciales: se requieren al menos 2, con todos sus datos obligatorios");
  }

  if (d.tipo === "PROVEEDOR") {
    const e = d.encuesta;
    if (!e || vacio(e.trayectoriaExperiencia) || vacio(e.creditoOtorga) || vacio(e.presenciaRegional)) {
      problemas.push("Encuesta de proveedor: faltan campos obligatorios");
    }
  }

  return problemas;
}
