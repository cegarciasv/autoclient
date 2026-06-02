import Image from "next/image";
import { ShieldCheck } from "lucide-react";

export default function FormularioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 py-3 px-6">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Image
            src="/logo.png"
            alt="Transebastian"
            width={120}
            height={120}
            className="h-12 w-12 object-contain"
            priority
          />
          <div className="border-l border-slate-200 pl-4">
            <p className="text-xs text-[#1E3A8A] font-semibold leading-tight">Formulario de Vinculación</p>
            <p className="text-[10px] text-slate-400 leading-tight">Transebastian</p>
          </div>
        </div>
      </header>

      {/* Banda de color de marca */}
      <div className="h-[3px] bg-gradient-to-r from-[#1E3A8A] via-[#2B5BE2] to-[#F26A1A] w-full" />

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
