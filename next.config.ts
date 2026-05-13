import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Genera output standalone para Docker (copia sólo lo necesario en .next/standalone)
  output: "standalone",

  // pdfkit necesita acceso real al sistema de archivos (busca sus fuentes .afm en node_modules).
  // Sin esto, Next.js/Turbopack lo virtualiza y falla con ENOENT en los archivos de fuentes.
  serverExternalPackages: ["pdfkit"],
};

export default nextConfig;
