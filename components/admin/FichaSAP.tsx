"use client";

import { useState } from "react";
import { ClipboardCopy, Check, Printer, ChevronDown, AlertTriangle, CheckCircle2 } from "lucide-react";

interface CampoSAP {
  label: string;
  valor: string | null | undefined;
}

interface Props {
  campos: CampoSAP[];
  defaultAbierto?: boolean;
}

function val(v: string | null | undefined): string {
  if (!v || v === "") return "—";
  return v;
}

export default function FichaSAP({ campos, defaultAbierto = false }: Props) {
  const [copiado, setCopiado] = useState(false);
  const [abierto, setAbierto] = useState(defaultAbierto);

  function copiarTodo() {
    const texto = campos.map((c) => `${c.label}: ${val(c.valor)}`).join("\n");
    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  }

  const incompletos = campos.filter((c) => !c.valor || c.valor === "").length;
  const completos = campos.length - incompletos;
  const porcentaje = Math.round((completos / campos.length) * 100);
  const listo = incompletos === 0;

  return (
    <div>
      {/* ── Cabecera ─────────────────────────────────── */}
      <button
        onClick={() => setAbierto((v) => !v)}
        className="w-full flex items-center gap-4 text-left group"
      >
        {/* Barra de progreso circular + texto */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Mini donut */}
          <div className="relative flex-shrink-0 h-10 w-10">
            <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="none" stroke="#e2e8f0" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15" fill="none"
                stroke={listo ? "#10b981" : incompletos > campos.length / 2 ? "#f59e0b" : "#3b82f6"}
                strokeWidth="3"
                strokeDasharray={`${porcentaje * 0.942} 94.2`}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-slate-600">
              {porcentaje}%
            </span>
          </div>

          {/* Textos */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-800">Datos para SAP</span>
              {listo ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="h-3 w-3" /> Completo
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  <AlertTriangle className="h-3 w-3" /> {incompletos} pendiente{incompletos !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {completos} de {campos.length} campos listos para registrar en SAP
            </p>
          </div>
        </div>

        {/* Chevron */}
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-slate-400 transition-transform duration-200 group-hover:text-slate-600 ${
            abierto ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* ── Contenido colapsable ──────────────────────── */}
      {abierto && (
        <div className="mt-4 space-y-3">
          {/* Acciones */}
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 bg-white text-slate-500 text-xs font-medium hover:bg-slate-50 hover:text-slate-700 transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              Imprimir
            </button>
            <button
              onClick={copiarTodo}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 bg-white text-slate-500 text-xs font-medium hover:bg-slate-50 hover:text-slate-700 transition-colors"
            >
              {copiado ? (
                <><Check className="h-3.5 w-3.5 text-blue-500" /> Copiado</>
              ) : (
                <><ClipboardCopy className="h-3.5 w-3.5" /> Copiar todo</>
              )}
            </button>
          </div>

          {/* Tabla */}
          <div className="rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
            {campos.map((campo, i) => {
              const vacio = !campo.valor || campo.valor === "";
              return (
                <div
                  key={i}
                  className={`group/row flex items-center gap-3 px-4 py-2.5 ${
                    vacio ? "bg-amber-50/60" : i % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                  }`}
                >
                  {/* Indicador lateral */}
                  <span
                    className={`flex-shrink-0 h-1.5 w-1.5 rounded-full ${
                      vacio ? "bg-amber-400" : "bg-blue-400"
                    }`}
                  />

                  {/* Label */}
                  <span className="w-52 flex-shrink-0 text-xs text-slate-500 font-medium leading-5">
                    {campo.label}
                  </span>

                  {/* Valor */}
                  <span
                    className={`flex-1 text-sm leading-5 ${
                      vacio
                        ? "text-amber-500 italic text-xs"
                        : "text-slate-800 font-medium"
                    }`}
                  >
                    {vacio ? "Sin completar" : campo.valor}
                  </span>

                  {/* Copiar individual */}
                  {!vacio && <CopiarBtn texto={campo.valor!} />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function CopiarBtn({ texto }: { texto: string }) {
  const [copiado, setCopiado] = useState(false);
  function copiar() {
    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    });
  }
  return (
    <button
      onClick={copiar}
      title="Copiar valor"
      className="opacity-0 group-hover/row:opacity-100 flex-shrink-0 p-1 rounded hover:bg-slate-100 text-slate-300 hover:text-slate-600 transition-all"
    >
      {copiado
        ? <Check className="h-3.5 w-3.5 text-blue-500" />
        : <ClipboardCopy className="h-3.5 w-3.5" />
      }
    </button>
  );
}
