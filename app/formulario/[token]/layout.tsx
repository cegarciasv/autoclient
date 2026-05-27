import Image from "next/image";
import { ShieldCheck } from "lucide-react";

export default function FormularioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#1B3C22] to-[#1A7A30] text-white py-4 px-6 shadow-lg">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Image
            src="/logo.png"
            alt="Grupo Remor"
            width={160}
            height={50}
            className="h-12 w-auto object-contain"
            priority
          />
          <div className="border-l border-white/20 pl-4">
            <p className="text-xs text-white/70 leading-tight">Formulario de Vinculación</p>
          </div>
        </div>
      </header>

      {/* Banda decorativa */}
      <div className="h-[3px] bg-[#1A7A30] w-full" />

      <main className="bg-slate-50 flex-1 py-8 px-4">
        <div className="max-w-3xl mx-auto">{children}</div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-4 px-6">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <Image
            src="/logo.png"
            alt="Grupo Remor"
            width={90}
            height={28}
            className="h-7 w-auto object-contain opacity-70"
          />
          <span className="text-xs text-slate-400">
            © {new Date().getFullYear()} Grupo Remor · Todos los derechos reservados
          </span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
            <span className="text-xs text-slate-400">Proceso seguro con cifrado SSL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
