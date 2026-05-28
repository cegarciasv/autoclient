import nodemailer from "nodemailer";

/** Crea un transporter fresco en cada llamada para garantizar que
 *  las variables de entorno estén disponibles en tiempo de ejecución
 *  (en producción Next.js el módulo puede cargarse antes del env). */
function makeTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,          // STARTTLS en puerto 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

export async function enviarLinkFormulario(
  destinatario: string,
  razonSocial: string,
  token: string,
  tipo: "CLIENTE" | "PROVEEDOR"
) {
  const url = `${process.env.APP_URL}/formulario/${token}`;
  const tipoTexto = tipo === "CLIENTE" ? "cliente" : "proveedor";

  try {
    await enviarLinkReal(destinatario, razonSocial, url, tipo, tipoTexto);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `\n⚠️  SMTP no disponible. Modo desarrollo activo.\n` +
        `📨 Email destino: ${destinatario}\n` +
        `🔗 Link del formulario: ${url}\n` +
        `(Copie y pegue este link en su navegador para acceder)\n`
      );
      return;
    }
    throw err;
  }
}

async function enviarLinkReal(
  destinatario: string,
  razonSocial: string,
  url: string,
  tipo: "CLIENTE" | "PROVEEDOR",
  tipoTexto: string
) {
  const transporter = makeTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: destinatario,
    subject: `Grupo Remor — Formulario de Vinculación ${tipo === "CLIENTE" ? "de Cliente" : "de Proveedor"}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1B3C22; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">GRUPO REMOR</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <p>Estimado/a <strong>${razonSocial}</strong>,</p>
          <p>
            Le solicitamos completar el siguiente <strong>Formulario de Vinculación de ${tipoTexto}</strong>
            para conocimiento de nuestras contrapartes y cumplimiento de nuestros procesos internos.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${url}" style="background-color: #1B3C22; color: white; padding: 14px 28px;
               text-decoration: none; border-radius: 6px; font-size: 16px; display: inline-block;">
              Completar Formulario
            </a>
          </div>
          <p style="font-size: 12px; color: #666;">
            Si el botón no funciona, copie y pegue este enlace en su navegador:<br/>
            <a href="${url}">${url}</a>
          </p>
          <p style="font-size: 12px; color: #666;">
            <strong>Nota:</strong> Este enlace es personal e intransferible. Expira en 5 días.
          </p>
        </div>
        <div style="background: #eee; padding: 15px; font-size: 11px; color: #888; text-align: center;">
          Correo enviado automáticamente — Grupo Remor
        </div>
      </div>
    `,
  });
}

export async function enviarOTP(
  destinatario: string,
  razonSocial: string,
  codigo: string
) {
  try {
    await enviarOTPReal(destinatario, razonSocial, codigo);
  } catch (err) {
    // En desarrollo: si SMTP falla, imprime OTP en consola en lugar de propagar el error
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `\n⚠️  SMTP no disponible. Modo desarrollo activo.\n` +
        `📨 Email destino: ${destinatario}\n` +
        `🔐 Código OTP: ${codigo}\n` +
        `(Use este código en la pantalla de verificación)\n`
      );
      return;
    }
    throw err;
  }
}

export async function enviarAccesoSistema(
  destinatario: string,
  nombre: string,
  rol: string
) {
  const rolTexto = rol === "ADMIN" ? "Administrador" : "Ejecutivo";
  const url = `${process.env.APP_URL}/admin/login`;

  try {
    const transporter = makeTransporter();
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: destinatario,
      subject: "Grupo Remor — Acceso al Sistema Interno",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1B3C22; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">GRUPO REMOR</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <p>Estimado/a <strong>${nombre}</strong>,</p>
            <p>Se le ha otorgado acceso al <strong>Sistema Interno de Vinculación</strong> con el rol de <strong>${rolTexto}</strong>.</p>
            <p>Para acceder, haga clic en el siguiente botón e inicie sesión con su cuenta Microsoft 365:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${url}" style="background-color: #1B3C22; color: white; padding: 14px 28px;
                 text-decoration: none; border-radius: 6px; font-size: 16px; display: inline-block;">
                Acceder al Sistema
              </a>
            </div>
            <p style="font-size: 12px; color: #666;">Su correo de Microsoft 365 registrado: <strong>${destinatario}</strong></p>
          </div>
          <div style="background: #eee; padding: 15px; font-size: 11px; color: #888; text-align: center;">
            Correo enviado automáticamente — Grupo Remor
          </div>
        </div>
      `,
    });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`⚠️ SMTP no disponible. Email de acceso para: ${destinatario} (${nombre}, ${rolTexto})`);
      return;
    }
    throw err;
  }
}

async function enviarOTPReal(destinatario: string, razonSocial: string, codigo: string) {
  const transporter = makeTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: destinatario,
    subject: "Grupo Remor — Código de verificación",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1B3C22; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">GRUPO REMOR</h1>
        </div>
        <div style="padding: 30px; background: #f9f9f9; text-align: center;">
          <p>Estimado/a <strong>${razonSocial}</strong>,</p>
          <p>Su código de verificación para acceder al formulario es:</p>
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px;
               color: #1B3C22; margin: 20px 0; padding: 20px;
               background: white; border-radius: 8px; border: 2px solid #1B3C22;">
            ${codigo}
          </div>
          <p style="color: #666; font-size: 13px;">
            Este código es válido por <strong>15 minutos</strong>.<br/>
            Si no solicitó este código, ignore este mensaje.
          </p>
        </div>
        <div style="background: #eee; padding: 15px; font-size: 11px; color: #888; text-align: center;">
          Correo enviado automáticamente — Grupo Remor
        </div>
      </div>
    `,
  });
}
