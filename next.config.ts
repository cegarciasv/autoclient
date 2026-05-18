import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Genera output standalone para Docker (copia sólo lo necesario en .next/standalone)
  output: "standalone",

  // Fija la raíz del workspace al directorio del proyecto. Sin esto, Next detecta
  // un package-lock.json fuera de la app y anida el standalone en subcarpetas,
  // dejando server.js fuera de la ruta esperada por el Dockerfile.
  turbopack: {
    root: path.resolve(__dirname),
  },

  // Paquetes que Turbopack NO debe bundlear — necesitan el sistema de archivos real
  // o tienen módulos nativos que no sobreviven al proceso de bundling.
  serverExternalPackages: [
    "pdfkit",           // busca fuentes .afm en su propio node_modules
    "mariadb",          // usa net/tls de Node.js directamente
    "@prisma/adapter-mariadb", // depende de mariadb
  ],
};

export default nextConfig;
