import PDFDocument from "pdfkit";

/* ─────────────────────────────────────────────────────────────
   TIPOS
───────────────────────────────────────────────────────────── */
interface DatosFormulario {
  tercero: {
    razonSocial: string;
    tipoDocumento: string;
    numeroDocumento: string;
    email: string;
    tipo: string;
  };
  infoGeneral?: Record<string, unknown> | null;
  accionistas?: Record<string, unknown>[];
  clientesPrincipales?: Record<string, unknown>[];
  infoFinanciera?: Record<string, unknown> | null;
  referencias?: Record<string, unknown>[];
  encuestaProveedor?: Record<string, unknown> | null;
}

/* ─────────────────────────────────────────────────────────────
   HELPERS DE FORMATO
───────────────────────────────────────────────────────────── */
function s(v: unknown): string {
  if (v == null || v === "") return "—";
  if (typeof v === "boolean") return v ? "Sí" : "No";
  return String(v).trim() || "—";
}
function fecha(v: unknown): string {
  if (!v) return "—";
  try {
    const d = new Date(String(v));
    if (isNaN(d.getTime()) || d.getFullYear() === 1900) return "—";
    return d.toLocaleDateString("es-SV");
  } catch { return "—"; }
}
function dinero(v: unknown): string {
  const n = Number(v);
  if (!v || isNaN(n) || n === 0) return "—";
  return `$ ${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}
function bool(v: unknown): string { return v ? "Sí" : "No"; }

/* ─────────────────────────────────────────────────────────────
   GENERADOR PRINCIPAL
───────────────────────────────────────────────────────────── */
export async function generarPDFFormulario(datos: DatosFormulario): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      /* ── Setup ── */
      const doc = new PDFDocument({
        size: "LETTER",
        margins: { top: 0, bottom: 40, left: 50, right: 50 },
        bufferPages: true,
        info: {
          Title: `Formulario de Vinculación — ${datos.tercero.razonSocial}`,
          Author: "Grupo Remor",
          Subject: `Conocimiento de ${datos.tercero.tipo === "PROVEEDOR" ? "Proveedor" : "Cliente"}`,
        },
      });

      const chunks: Buffer[] = [];
      doc.on("data", (c: Buffer) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      /* ── Constantes de diseño ── */
      const W       = doc.page.width;          // 612
      const ML      = 50;                      // margen izquierdo
      const MR      = 50;                      // margen derecho
      const CW      = W - ML - MR;            // 512 — ancho del contenido
      const AZUL    = "#1e3a5f";
      const AZUL2   = "#2d5186";
      const GRIS    = "#4b5563";
      const GRIS_L  = "#9ca3af";
      const LINEA   = "#e5e7eb";
      const FONDO   = "#f8fafc";
      const VERDE   = "#059669";
      const ROJO    = "#dc2626";

      /* ── Estado de posición ── */
      let Y = 0;  // cursor vertical (se actualiza manualmente)

      /* ═══════════════════════════════════════════════
         UTILIDADES DE DIBUJO
      ═══════════════════════════════════════════════ */

      /** Mueve el cursor Y y añade página si es necesario */
      function avanzar(px: number) { Y += px; }

      function checkPagina(necesario = 80) {
        if (Y + necesario > doc.page.height - 50) {
          doc.addPage();
          cabeceraRepetida();
        }
      }

      /** Línea horizontal divisora */
      function linea(y = Y, color = LINEA, grosor = 0.5) {
        doc.moveTo(ML, y).lineTo(W - MR, y)
          .strokeColor(color).lineWidth(grosor).stroke();
      }

      /** Banda azul oscuro de encabezado de página */
      function bandaHeader(esPortada = false) {
        const h = esPortada ? 90 : 48;
        doc.rect(0, 0, W, h).fill(AZUL);

        // Logo / nombre empresa
        doc.fillColor("white")
          .font("Helvetica-Bold").fontSize(esPortada ? 22 : 14)
          .text("GRUPO REMOR", ML, esPortada ? 22 : 14, { width: CW });

        if (esPortada) {
          doc.font("Helvetica").fontSize(10).fillColor("#93c5fd")
            .text("Sistema de Vinculación de Terceros", ML, 50, { width: CW });
        } else {
          const subtitulo = `Formulario de ${datos.tercero.tipo === "PROVEEDOR" ? "Proveedor" : "Cliente"} — ${datos.tercero.razonSocial}`;
          doc.font("Helvetica").fontSize(7.5).fillColor("#93c5fd")
            .text(subtitulo, ML, 30, { width: CW - 60 });

          // Fecha en esquina derecha
          doc.font("Helvetica").fontSize(7).fillColor("#93c5fd")
            .text(new Date().toLocaleDateString("es-SV"), W - MR - 80, 19, { width: 80, align: "right" });
        }

        doc.fillColor("black");
        Y = h + 18;
      }

      /** Cabecera repetida en páginas interiores */
      function cabeceraRepetida() {
        bandaHeader(false);
      }

      /** Título de sección: barra con icono de color */
      function seccion(titulo: string, color = AZUL) {
        checkPagina(60);
        avanzar(6);
        doc.rect(ML, Y, CW, 22).fill(color);
        doc.fillColor("white").font("Helvetica-Bold").fontSize(9)
          .text(titulo.toUpperCase(), ML + 10, Y + 6, { width: CW - 20 });
        doc.fillColor("black");
        avanzar(22 + 10);
      }

      /** Sub-sección más pequeña */
      function subseccion(titulo: string) {
        checkPagina(40);
        avanzar(4);
        doc.rect(ML, Y, 3, 14).fill(AZUL2);
        doc.fillColor(AZUL2).font("Helvetica-Bold").fontSize(8.5)
          .text(titulo, ML + 10, Y + 2, { width: CW - 10 });
        doc.fillColor("black");
        avanzar(18);
      }

      /** Un campo: etiqueta gris + valor negro */
      function campo(label: string, valor: string, x: number, w: number) {
        checkPagina(28);
        doc.fillColor(GRIS_L).font("Helvetica").fontSize(6.5)
          .text(label.toUpperCase(), x, Y, { width: w });
        doc.fillColor(valor === "—" ? GRIS_L : "#111827").font("Helvetica-Bold").fontSize(9)
          .text(valor, x, Y + 8, { width: w });
      }

      /** Dos campos en columna (izquierda y derecha) */
      function fila2(l1: string, v1: string, l2: string, v2: string, altura = 28) {
        checkPagina(altura + 4);
        const mitad = CW / 2 - 6;
        campo(l1, v1, ML, mitad);
        if (l2) campo(l2, v2, ML + CW / 2 + 6, mitad);
        avanzar(altura);
        linea(Y);
        avanzar(6);
      }

      /** Un campo de ancho completo */
      function fila1(label: string, valor: string, altura = 28) {
        checkPagina(altura + 4);
        campo(label, valor, ML, CW);
        avanzar(altura);
        linea(Y);
        avanzar(6);
      }

      /** Fila de tabla con fondo alterno */
      function filaTabla(cols: string[], widths: number[], fila: number, ys: number, alturas: number) {
        if (fila % 2 === 0) {
          doc.rect(ML, ys, CW, alturas).fill(FONDO);
        }
        let x = ML + 6;
        cols.forEach((txt, i) => {
          doc.fillColor(txt === "—" ? GRIS_L : "#111827")
            .font("Helvetica").fontSize(8)
            .text(txt, x, ys + 5, { width: widths[i] - 8 });
          x += widths[i];
        });
      }

      /** Tabla completa */
      function tabla(
        encabezados: string[],
        widths: number[],
        filas: string[][],
        titulo?: string
      ) {
        if (titulo) seccion(titulo);

        const fH = 18; // altura cabecera
        const fR = 22; // altura fila dato

        checkPagina(fH + filas.length * fR + 10);

        // Cabecera de tabla
        doc.rect(ML, Y, CW, fH).fill(AZUL2);
        let x = ML + 6;
        encabezados.forEach((h, i) => {
          doc.fillColor("white").font("Helvetica-Bold").fontSize(7.5)
            .text(h.toUpperCase(), x, Y + 5, { width: widths[i] - 8 });
          x += widths[i];
        });
        avanzar(fH);

        // Filas de datos
        filas.forEach((cols, idx) => {
          checkPagina(fR + 4);
          filaTabla(cols, widths, idx, Y, fR);
          avanzar(fR);
        });

        // Borde inferior
        linea(Y, AZUL2, 1);
        avanzar(12);
      }

      /** Indicador booleano PEP (con color) */
      function pepItem(label: string, valor: boolean) {
        checkPagina(20);
        const color = valor ? ROJO : VERDE;
        const texto = valor ? "SÍ" : "NO";
        doc.rect(ML, Y, 28, 14).fill(color);
        doc.fillColor("white").font("Helvetica-Bold").fontSize(7.5)
          .text(texto, ML, Y + 3.5, { width: 28, align: "center" });
        doc.fillColor(valor ? ROJO : "#111827").font(valor ? "Helvetica-Bold" : "Helvetica")
          .fontSize(8.5)
          .text(label, ML + 34, Y + 3, { width: CW - 34 });
        avanzar(18);
      }

      /* ═══════════════════════════════════════════════
         PORTADA
      ═══════════════════════════════════════════════ */
      bandaHeader(true);

      // Recuadro de identificación del documento
      const tipo = datos.tercero.tipo === "PROVEEDOR" ? "PROVEEDOR" : "CLIENTE";
      const colorTipo = datos.tercero.tipo === "PROVEEDOR" ? "#7c3aed" : AZUL;

      // Badge tipo
      const badgeTexto = `FORMULARIO DE ${tipo}`;
      const badgeW = 170;
      const badgeH = 22;
      doc.rect(ML, Y, badgeW, badgeH).fill(colorTipo);
      doc.fillColor("white").font("Helvetica-Bold").fontSize(9)
        .text(badgeTexto, ML, Y + 7, { width: badgeW, align: "center" });
      avanzar(badgeH + 10);

      // Razón social grande
      doc.fillColor(AZUL).font("Helvetica-Bold").fontSize(18)
        .text(datos.tercero.razonSocial, ML, Y, { width: CW });
      Y += doc.currentLineHeight(true) * Math.ceil(datos.tercero.razonSocial.length / 55) + 6;

      // Línea decorativa
      doc.rect(ML, Y, 60, 3).fill(AZUL);
      avanzar(12);

      // Info básica
      doc.fillColor(GRIS).font("Helvetica").fontSize(9);
      doc.text(`${datos.tercero.tipoDocumento}: ${datos.tercero.numeroDocumento}`, ML, Y);
      avanzar(14);
      doc.text(`Correo: ${datos.tercero.email}`, ML, Y);
      avanzar(20);
      doc.fillColor(GRIS_L).fontSize(8)
        .text(`Fecha de generación: ${new Date().toLocaleDateString("es-SV", { day: "2-digit", month: "long", year: "numeric" })}`, ML, Y);
      avanzar(40);

      // Recuadro aviso confidencialidad
      doc.rect(ML, Y, CW, 36).fill("#fefce8").stroke("#fde68a");
      doc.fillColor("#92400e").font("Helvetica-Bold").fontSize(7.5)
        .text("INFORMACIÓN CONFIDENCIAL", ML + 10, Y + 6, { width: CW - 20 });
      doc.font("Helvetica").fontSize(7).fillColor("#78350f")
        .text(
          "Este documento contiene información confidencial de uso exclusivo de Grupo Remor. " +
          "Queda prohibida su reproducción o distribución sin autorización expresa.",
          ML + 10, Y + 17, { width: CW - 20 }
        );
      avanzar(50);

      // Índice de contenido
      seccion("Contenido del documento", "#374151");
      const secciones = [
        "1. Identificación del Tercero",
        datos.infoGeneral ? "2. Información General de la Empresa" : null,
        datos.infoGeneral ? "3. Representante Legal y Declaración PEP" : null,
        (datos.clientesPrincipales?.length ?? 0) > 0 ? "4. Clientes Principales" : null,
        (datos.accionistas?.length ?? 0) > 0 ? "5. Accionistas / Socios" : null,
        datos.infoFinanciera ? "6. Información Financiera" : null,
        (datos.referencias?.length ?? 0) > 0 ? "7. Referencias Comerciales" : null,
        datos.encuestaProveedor ? "8. Encuesta de Proveedor" : null,
        "9. Declaración y Firma",
      ].filter(Boolean) as string[];

      secciones.forEach((item, i) => {
        doc.fillColor(i % 2 === 0 ? AZUL : GRIS).font("Helvetica").fontSize(8.5)
          .text(`  ${item}`, ML + 10, Y, { width: CW - 10 });
        avanzar(14);
      });

      /* ═══════════════════════════════════════════════
         PÁGINA 2+: CUERPO DEL FORMULARIO
      ═══════════════════════════════════════════════ */
      doc.addPage();
      cabeceraRepetida();

      /* ── 1. IDENTIFICACIÓN ── */
      seccion("1. Identificación del Tercero");
      fila2("Razón Social / Nombre", s(datos.tercero.razonSocial),
            "Tipo de Tercero", s(datos.tercero.tipo));
      fila2(`Tipo de Documento`, s(datos.tercero.tipoDocumento),
            "Número de Documento", s(datos.tercero.numeroDocumento));
      fila1("Correo Electrónico de Contacto", s(datos.tercero.email));

      const ig = datos.infoGeneral;

      if (ig) {
        /* ── 2. INFORMACIÓN GENERAL ── */
        seccion("2. Información General de la Empresa");
        fila2("Razón Social Registrada", s(ig.razonSocial), "Nombre Comercial", s(ig.nombreComercial));
        fila2("NIT (Número de Identificación Tributaria)", s(ig.nit), "Número de IVA / Registro", s(ig.iva));
        fila2("Tipo de Empresa / Sociedad", s(ig.tipoEmpresa), "Tipo de Actividad Económica", s(ig.tipoActividadEconomica));
        fila1("Actividad Real / Giro del Negocio", s(ig.actividadReal), 32);
        fila1("Producto o Servicio Principal", s(ig.productoServicio), 32);
        fila2("Cumple Obligaciones Tributarias", bool(ig.obligacionesTributarias), "Cuenta con Sistema LAFT", bool(ig.sistemaLAFT));

        subseccion("Domicilio y Contacto de la Empresa");
        fila1("Dirección Principal", s(ig.direccionPrincipal), 32);
        fila2("Departamento", s(ig.departamento), "Ciudad / Municipio", s(ig.ciudad));
        fila2("Correo Electrónico Corporativo", s(ig.correoElectronico), "Teléfono Fijo", s(ig.telefonoFijo));
        fila1("Teléfono Celular / Móvil", s(ig.telefonoCelular));

        /* ── 3. REPRESENTANTE LEGAL ── */
        doc.addPage();
        cabeceraRepetida();
        seccion("3. Representante Legal");
        fila2("Nombres", s(ig.rlNombres), "Primer Apellido", s(ig.rlPrimerApellido));
        fila2("Segundo Apellido", s(ig.rlSegundoApellido), "Tipo de Identificación", s(ig.rlTipoIdentificacion));
        fila2("Número de Documento", s(ig.rlNumeroDocumento), "Lugar de Expedición", s(ig.rlLugarExpedicion));
        fila2("Fecha de Expedición", fecha(ig.rlFechaExpedicion), "Fecha de Vencimiento", fecha(ig.rlFechaVencimiento));
        fila2("Fecha de Nacimiento", fecha(ig.rlFechaNacimiento), "Lugar de Nacimiento", s(ig.rlLugarNacimiento));
        fila2("Género", s(ig.rlGenero), "Estado Civil", s(ig.rlEstadoCivil));

        subseccion("Declaración de Persona Políticamente Expuesta (PEP)");
        avanzar(4);
        pepItem("¿Maneja o ha manejado recursos públicos?",         Boolean(ig.pepRecursosPublicos));
        pepItem("¿Tiene familiares con recursos o cargos públicos?",Boolean(ig.pepFamiliaresPublicos));
        pepItem("¿Ocupa o ha ocupado cargos públicos?",            Boolean(ig.pepCargosPublicos));
        pepItem("¿Está vinculado al sistema de prevención LAFT?",  Boolean(ig.pepSistemaLAFT));
        avanzar(8);
      }

      /* ── 4. CLIENTES PRINCIPALES ── */
      if (datos.clientesPrincipales && datos.clientesPrincipales.length > 0) {
        checkPagina(120);
        tabla(
          ["#", "Nombre / Razón Social", "% de Participación"],
          [30, 380, 102],
          datos.clientesPrincipales.map((c, i) => [
            String(i + 1),
            s(c.nombreRazonSocial),
            `${s(c.porcentajeParticipacion)}%`,
          ]),
          "4. Clientes Principales"
        );
      }

      /* ── 5. ACCIONISTAS ── */
      if (datos.accionistas && datos.accionistas.length > 0) {
        checkPagina(120);
        tabla(
          ["#", "Nombre / Razón Social", "Tipo ID", "Documento", "%", "PEP", "País"],
          [22, 160, 52, 78, 40, 36, 124],
          datos.accionistas.map((a, i) => {
            const esPep = a.recursosPublicos || a.cargoPoder || a.reconocidoPublicamente;
            return [
              String(i + 1),
              s(a.nombreRazonSocial),
              s(a.tipoIdentificacion),
              s(a.numeroDocumento),
              `${Number(a.porcentajeParticipacion).toFixed(1)}%`,
              esPep ? "SÍ" : "No",
              s(a.declaracionPais),
            ];
          }),
          "5. Accionistas / Socios"
        );
      }

      /* ── 6. INFORMACIÓN FINANCIERA ── */
      if (datos.infoFinanciera) {
        const fi = datos.infoFinanciera;
        checkPagina(200);
        seccion("6. Información Financiera");

        subseccion("Balance General");
        fila2("Total Activo", dinero(fi.totalActivo), "Total Pasivo", dinero(fi.totalPasivo));
        fila1("Total Patrimonio Neto", dinero(fi.totalPatrimonio));

        subseccion("Flujo de Ingresos y Egresos");
        fila2("Ingresos Mensuales Promedio", dinero(fi.ingresosMensuales), "Egresos Mensuales Promedio", dinero(fi.egresosMensuales));
        fila2("Fuente de Otros Ingresos", s(fi.fuenteOtrosIngresos), "Otros Ingresos Mensuales", dinero(fi.otrosIngresosMensuales));

        subseccion("Operaciones Internacionales");
        fila1("¿Realiza operaciones internacionales?", bool(fi.operacionesInternacionales));
        if (fi.detalleOperaciones) {
          fila1("Detalle de operaciones internacionales", s(fi.detalleOperaciones), 40);
        }
      }

      /* ── 7. REFERENCIAS COMERCIALES ── */
      if (datos.referencias && datos.referencias.length > 0) {
        checkPagina(100);
        seccion("7. Referencias Comerciales");
        datos.referencias.forEach((r, i) => {
          checkPagina(100);
          subseccion(`Referencia ${i + 1}`);
          fila1("Nombre / Razón Social", s(r.nombreRazonSocial));
          fila2("Teléfono Fijo", s(r.telefonoFijo), "Teléfono Celular", s(r.telefonoCelular));
          fila1("Dirección", s(r.direccion));
        });
      }

      /* ── 8. ENCUESTA PROVEEDOR ── */
      if (datos.encuestaProveedor) {
        const ep = datos.encuestaProveedor;
        doc.addPage();
        cabeceraRepetida();
        seccion("8. Encuesta de Proveedor");

        subseccion("Experiencia y Capacidad");
        fila2("Trayectoria / Años de Experiencia", s(ep.trayectoriaExperiencia), "Cantidad de Proyectos Ejecutados", s(ep.cantidadProyectos));
        fila2("Montos de Proyectos", s(ep.montosProyectos), "Market Share Local", s(ep.marketShareLocal));
        fila2("Presencia Regional", s(ep.presenciaRegional), "Market Share Regional", s(ep.marketShareRegional));

        subseccion("Cumplimiento y Certificaciones");
        fila2("Cuenta con Certificaciones Internacionales", bool(ep.certificacionesInternacionales), "Tiene Pólizas de Seguros", bool(ep.polizasSeguros));
        if (ep.detallesCertificaciones) fila1("Detalle de Certificaciones", s(ep.detallesCertificaciones), 36);
        if (ep.detallesPolizas) fila1("Detalle de Pólizas de Seguros", s(ep.detallesPolizas), 36);

        subseccion("Condiciones Laborales y Comerciales");
        fila2("Cumple Prestaciones de Ley", bool(ep.prestacionesLey), "Programa de Seguridad y Salud Ocupacional", bool(ep.programaSeguridadSalud));
        fila2("Crédito que Otorga", s(ep.creditoOtorga), "Cuenta con Garantías / Fianzas", bool(ep.garantiasFianzas));

        subseccion("Responsabilidad Ambiental");
        fila2("Participa en Campañas de Reciclaje", bool(ep.campanasReciclaje), "", "");
        if (ep.detallesReciclaje) fila1("Detalle de Campañas de Reciclaje", s(ep.detallesReciclaje), 36);
      }

      /* ── 9. DECLARACIÓN Y FIRMA ── */
      doc.addPage();
      cabeceraRepetida();
      seccion("9. Declaración Jurada y Firma");

      avanzar(10);
      doc.rect(ML, Y, CW, 60).fill("#f0f9ff").stroke("#bae6fd");
      doc.fillColor("#0c4a6e").font("Helvetica").fontSize(8.5)
        .text(
          "El suscrito, actuando en su calidad de Representante Legal, declara bajo juramento que toda la " +
          "información proporcionada en el presente formulario es veraz, completa y actualizada. Asimismo, " +
          "se compromete a notificar a Grupo Remor cualquier modificación relevante en los datos aquí " +
          "consignados dentro de los treinta (30) días siguientes a su ocurrencia.\n\n" +
          "Autoriza expresamente a Grupo Remor a verificar la información suministrada y a utilizarla " +
          "conforme a sus políticas internas de conocimiento de terceros y prevención de lavado de activos.",
          ML + 10, Y + 8, { width: CW - 20, align: "justify" }
        );
      avanzar(72);

      avanzar(20);

      // Líneas de firma
      const sigW = 200;
      const gap  = CW - sigW * 2;
      const x1   = ML;
      const x2   = ML + sigW + gap;

      doc.moveTo(x1, Y).lineTo(x1 + sigW, Y).strokeColor(AZUL).lineWidth(1).stroke();
      doc.moveTo(x2, Y).lineTo(x2 + sigW, Y).strokeColor(AZUL).lineWidth(1).stroke();
      avanzar(6);

      doc.fillColor(GRIS).font("Helvetica").fontSize(7.5)
        .text("Firma del Representante Legal", x1, Y, { width: sigW, align: "center" });
      doc.text("Lugar, fecha y sello de la empresa", x2, Y, { width: sigW, align: "center" });
      avanzar(20);

      doc.fillColor(GRIS_L).font("Helvetica").fontSize(7)
        .text(`Nombre: ${ig ? `${s(ig.rlNombres)} ${s(ig.rlPrimerApellido)} ${s(ig.rlSegundoApellido)}` : "___________________________"}`, x1, Y, { width: sigW, align: "center" });
      doc.text("Fecha: ___________________", x2, Y, { width: sigW, align: "center" });
      avanzar(16);

      doc.fillColor(GRIS_L).font("Helvetica").fontSize(7)
        .text(`DUI/NIT: ${ig ? s(ig.rlNumeroDocumento) : "___________________________"}`, x1, Y, { width: sigW, align: "center" });
      avanzar(40);

      linea(Y, AZUL, 1);
      avanzar(10);
      doc.fillColor(GRIS_L).font("Helvetica").fontSize(7)
        .text(
          `Documento generado electrónicamente el ${new Date().toLocaleString("es-SV")} | Grupo Remor — Sistema de Vinculación de Terceros`,
          ML, Y, { width: CW, align: "center" }
        );

      /* ═══════════════════════════════════════════════
         NUMERACIÓN DE PÁGINAS
      ═══════════════════════════════════════════════ */
      const total = doc.bufferedPageRange().count;
      for (let i = 0; i < total; i++) {
        doc.switchToPage(i);
        // Saltar portada
        if (i === 0) continue;
        doc.fillColor(GRIS_L).font("Helvetica").fontSize(7)
          .text(
            `Página ${i + 1} de ${total}`,
            0, doc.page.height - 20,
            { width: W, align: "center" }
          );
      }

      doc.end();

    } catch (err) {
      reject(err);
    }
  });
}
