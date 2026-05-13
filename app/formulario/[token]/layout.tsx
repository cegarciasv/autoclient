import { Building2 } from "lucide-react";

export default function FormularioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-[#1e3a5f] text-white py-4 px-6 shadow-md">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Building2 className="h-6 w-6 text-blue-300" />
          <div>
            <p className="font-bold text-sm leading-tight">GRUPO REMOR</p>
            <p className="text-xs text-blue-200">Formulario de Vinculación</p>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8 px-4">
        <div className="max-w-3xl mx-auto">{children}</div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-3 px-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Grupo Remor · Formulario enviado automáticamente
      </footer>
    </div>
  );
}
