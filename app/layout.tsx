import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { obtenerBranding } from "@/lib/branding";
import type { CSSProperties } from "react";

export const metadata: Metadata = {
  title: "Formulario de Vinculación",
  description: "Sistema de vinculación de clientes y proveedores",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const branding = await obtenerBranding();
  const brandStyle = {
    "--brand-primary": branding.colorPrimary,
    "--brand-dark": branding.colorDark,
    "--brand-accent": branding.colorAccent,
    "--primary": branding.colorPrimary,
    "--ring": branding.colorPrimary,
  } as CSSProperties;
  return (
    <html lang="es" className="h-full antialiased" style={brandStyle}>
      <body className="min-h-full font-sans bg-background text-foreground">
        {children}
        <Toaster richColors position="top-right" closeButton />
      </body>
    </html>
  );
}
