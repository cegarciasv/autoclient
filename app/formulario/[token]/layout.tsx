import Image from "next/image";
import { ShieldCheck } from "lucide-react";

export default function FormularioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f7f8] flex flex-col">
      {/* Header */}
      <header className="bg-[var(--brand-dark)] text-white border-b border-white/10 px-5 sm:px-8">
        <div className="w-full max-w-[1200px] mx-auto min-h-[76px] flex items-center gap-4">
          <Image
            src="/api/branding/logo"
            unoptimized
            alt="Logo de la empresa"
            width={160}
            height={50}
            className="h-12 w-auto max-w-[160px] object-contain"
            priority
          />
          <div className="border-l border-white/20 pl-4">
            <p className="text-xs sm:text-sm font-medium text-white/80 leading-tight">Formulario de vinculación</p>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full px-4 py-8 sm:px-8 sm:py-10 lg:py-12">
        <div className="w-full max-w-[1200px] mx-auto">{children}</div>
      </main>

      <footer className="bg-white border-t border-[#e2e8ec] px-5 py-4 sm:px-8">
        <div className="w-full max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-xs text-[#8493a5]">
            © {new Date().getFullYear()} · Todos los derechos reservados
          </span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-[var(--brand-primary)]" />
            <span className="text-xs text-[#8493a5]">Acceso protegido</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
