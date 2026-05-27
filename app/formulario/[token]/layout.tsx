import { Building2, ShieldCheck } from "lucide-react";

export default function FormularioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 text-white py-5 px-6 shadow-lg">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-white/20">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-base leading-tight tracking-wide">GRUPO REMOR</p>
            <p className="text-xs text-blue-300 leading-tight">Formulario de Vinculación de Clientes</p>
          </div>
        </div>
      </header>

      {/* Banda decorativa */}
      <div className="h-[3px] bg-blue-600 w-full" />

      <main className="bg-slate-50 flex-1 py-8 px-4">
        <div className="max-w-3xl mx-auto">{children}</div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-4 px-6">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-800">
              <Building2 className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs text-slate-500 font-medium">GRUPO REMOR</span>
          </div>
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
