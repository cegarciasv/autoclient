import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Genera output standalone para Docker (copia sólo lo necesario en .next/standalone)
  output: "standalone",

  // Paquetes que Turbopack NO debe bundlear — necesitan el sistema de archivos real
  // o tienen módulos nativos que no sobreviven al proceso de bundling.
  serverExternalPackages: [
    "pdfkit",           // busca fuentes .afm en su propio node_modules
    "mariadb",          // usa net/tls de Node.js directamente
    "@prisma/adapter-mariadb", // depende de mariadb
  ],
};

export default nextConfig;
