import "dotenv/config";
import nodemailer from "nodemailer";

async function main() {
  console.log("🔍 Probando credenciales SMTP...");
  console.log(`   Host: ${process.env.SMTP_HOST}`);
  console.log(`   Port: ${process.env.SMTP_PORT}`);
  console.log(`   User: "${process.env.SMTP_USER}"`);
  console.log(`   Pass: ${process.env.SMTP_PASSWORD?.replace(/./g, "*")}`);
  console.log(`   From: ${process.env.SMTP_FROM}\n`);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  try {
    await transporter.verify();
    console.log("✅ Conexión SMTP exitosa!");

    const destino = process.argv[2];
    if (destino) {
      console.log(`\n📨 Enviando correo de prueba a ${destino}...`);
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: destino,
        subject: "Grupo Remor — Prueba de SMTP",
        text: "Si recibes este correo, la configuración SMTP está funcionando correctamente.",
        html: "<p>Si recibes este correo, la configuración SMTP está funcionando correctamente.</p>",
      });
      console.log(`✅ Enviado. Message ID: ${info.messageId}`);
    } else {
      console.log("\n💡 Para enviar un correo de prueba ejecute:");
      console.log("   npx tsx scripts/probar-smtp.ts su-correo@dominio.com");
    }
  } catch (err) {
    console.error("\n❌ Falló la autenticación SMTP:");
    console.error(err);
    process.exit(1);
  }
}

main();
