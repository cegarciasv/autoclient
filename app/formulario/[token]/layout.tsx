import Image from "next/image";
import { ShieldCheck } from "lucide-react";

export default function FormularioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#1E3A8A] to-[#2B5BE2] text-white py-4 px-6 shadow-lg">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Image
            src="/logo-dark.png"
            alt="Transebastian"
            width={240}
            height={240}
            className="h-20 w-auto object-contain"
            priority
          />
          <div className="border-l border-white/20 pl-4">
            <p className="text-xs text-white/80 leading-tight">Formulario de Vinculación</p>
          </div>
        </div>
      </header>

      {/* Banda decorativa */}
      <div className="h-[3px] bg-[#F26A1A] w-full" />

      <main className="bg-slate-50 flex-1 py-8 px-4">
        <div className="max-w-3xl mx-auto">{children}</div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-4 px-6">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <Image
            src="/logo.png"
            alt="Transebastian"
            width={40}
            height={40}
            className="h-9 w-9 object-contain opacity-70"
          />
          <span className="text-xs text-slate-400">
            © {new Date().getFullYear()} Transebastian · Todos los derechos reservados
          </span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-xs text-slate-400">Proceso seguro con cifrado SSL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
