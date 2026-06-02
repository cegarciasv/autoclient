import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Transebastian — Formulario de Vinculación",
  description: "Sistema de vinculación de clientes y proveedores de Transebastian",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full font-sans bg-slate-50 text-slate-900">
        {children}
        <Toaster richColors position="top-right" closeButton />
      </body>
    </html>
  );
}
