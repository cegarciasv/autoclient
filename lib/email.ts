/**
 * Envío de correos vía Microsoft Graph API
 * Usa las mismas credenciales de la App Registration de Entra ID.
 * Requiere permiso de aplicación: Mail.Send (con admin consent).
 *
 * Variables de entorno necesarias:
 *   MICROSOFT_CLIENT_ID
 *   MICROSOFT_CLIENT_SECRET
 *   MICROSOFT_TENANT_ID
 *   MAIL_FROM          → buzón desde el que se envía (ej: formularios@transportesebastian.com.sv)
 *   APP_URL            → URL base de la app
 */

// ─── Token cache en memoria ───────────────────────────────────────────────────
// Evita pedir un token nuevo en cada correo (duran 3600 s por defecto).
let cachedToken: { value: string; expira: number } | null = null;

async function obtenerAccessToken(): Promise<string> {
  const ahora = Date.now();
  if (cachedToken && cachedToken.expira > ahora + 60_000) {
    return cachedToken.value;
  }

  const tenantId = process.env.MICROSOFT_TENANT_ID;
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error("Faltan variables de entorno de Microsoft Entra (TENANT_ID, CLIENT_ID, CLIENT_SECRET)");
  }

  const res = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials",
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Error obteniendo token de Microsoft: ${res.status} ${err}`);
  }

  const data = await res.json() as { access_token: string; expires_in: number };
  cachedToken = {
    value: data.access_token,
    expira: ahora + data.expires_in * 1000,
  };
  return cachedToken.value;
}

// ─── Función base de envío ────────────────────────────────────────────────────

async function enviarCorreo(
  destinatario: string,
  subject: string,
  html: string
): Promise<void> {
  const from = process.env.MAIL_FROM;
  if (!from) throw new Error("Variable de entorno MAIL_FROM no definida");

  const token = await obtenerAccessToken();

  const res = await fetch(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(from)}/sendMail`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          subject,
          body: { contentType: "HTML", content: html },
          toRecipients: [{ emailAddress: { address: destinatario } }],
          from: { emailAddress: { address: from } },
        },
        saveToSentItems: false,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Graph sendMail error ${res.status}: ${err}`);
  }
}

// ─── Emails públicos ──────────────────────────────────────────────────────────

export async function enviarLinkFormulario(
  destinatario: string,
  razonSocial: string,
  token: string,
  tipo: "CLIENTE" | "PROVEEDOR"
) {
  const url = `${process.env.APP_URL}/formulario/${token}`;
  const tipoTexto = tipo === "CLIENTE" ? "cliente" : "proveedor";
  const tipoLabel = tipo === "CLIENTE" ? "de Cliente" : "de Proveedor";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #1B3C22; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">TRANSPORTE SEBASTIÁN</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <p>Estimado/a <strong>${razonSocial}</strong>,</p>
        <p>
          Le solicitamos completar el siguiente <strong>Formulario de Vinculación ${tipoLabel}</strong>
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
        Correo enviado automáticamente — Transporte Sebastián
      </div>
    </div>
  `;

  try {
    await enviarCorreo(destinatario, `Transporte Sebastián — Formulario de Vinculación ${tipoLabel}`, html);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `\n⚠️  Graph API no disponible. Modo desarrollo activo.\n` +
        `📨 Email destino: ${destinatario}\n` +
        `🔗 Link del formulario: ${url}\n` +
        `(Copie y pegue este link en su navegador para acceder)\n`
      );
      return;
    }
    throw err;
  }
}

export async function enviarOTP(
  destinatario: string,
  razonSocial: string,
  codigo: string
) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #1B3C22; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">TRANSPORTE SEBASTIÁN</h1>
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
        Correo enviado automáticamente — Transporte Sebastián
      </div>
    </div>
  `;

  try {
    await enviarCorreo(destinatario, "Transporte Sebastián — Código de verificación", html);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `\n⚠️  Graph API no disponible. Modo desarrollo activo.\n` +
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

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #1B3C22; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">TRANSPORTE SEBASTIÁN</h1>
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
        Correo enviado automáticamente — Transporte Sebastián
      </div>
    </div>
  `;

  try {
    await enviarCorreo(destinatario, "Transporte Sebastián — Acceso al Sistema Interno", html);
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`⚠️  Graph API no disponible. Email de acceso para: ${destinatario} (${nombre}, ${rolTexto})`);
      return;
    }
    throw err;
  }
}
