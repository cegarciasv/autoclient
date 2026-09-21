"use client";

import { Check } from "lucide-react";

interface Paso {
  paso: number;
  label: string;
}

interface Props {
  pasos: Paso[];
  pasoActual: number;
  progreso: number;
}

export default function BarraProgreso({ pasos, pasoActual, progreso }: Props) {
  const labelActual = pasos.find((p) => p.paso === pasoActual)?.label ?? "";

  return (
    <div className="surface-card space-y-5 p-5 sm:p-7">
      {/* Cabecera: "Paso X de Y — Label" + porcentaje */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-2">Formulario de vinculación</p>
          <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-[#142033]">{labelActual}</h1>
        </div>
        <span className="text-sm font-semibold text-[#52657a]">Paso {pasoActual} de {pasos.length} <span className="ml-2 text-[var(--brand-primary)]">{progreso}%</span></span>
      </div>

      {/* Barra de progreso elegante */}
      <div className="w-full h-2 rounded-full bg-[#e2e8ec]" role="progressbar" aria-valuenow={progreso} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso del formulario">
        <div
          className="h-2 rounded-full bg-[var(--brand-primary)] transition-all duration-500"
          style={{ width: `${progreso}%` }}
        />
      </div>

      {/* Círculos de paso con líneas conectoras */}
      <div className="flex items-start pt-1">
        {pasos.map(({ paso, label }, idx) => {
          const completado = paso < pasoActual;
          const actual     = paso === pasoActual;
          return (
            <div key={paso} className="flex items-start flex-1">
              {/* Círculo + label */}
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div
                  aria-current={actual ? "step" : undefined}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border transition-all
                    ${completado ? "bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white" : ""}
                    ${actual     ? "bg-[#e9f4ef] border-[var(--brand-primary)] text-[var(--brand-primary)]" : ""}
                    ${!completado && !actual ? "bg-white border-[#e2e8ec] text-[#8493a5]" : ""}`}
                >
                  {completado ? <Check className="h-4 w-4" /> : paso}
                </div>
                <span
                  className={`text-[11px] text-center leading-tight hidden sm:block
                    ${actual ? "text-[var(--brand-primary)] font-semibold" : "text-[#8493a5]"}`}
                >
                  {label}
                </span>
              </div>

              {/* Línea conectora (no después del último) */}
              {idx < pasos.length - 1 && (
                <div className="flex-1 flex items-center" style={{ marginTop: "18px" }}>
                  <div
                    className={`h-0.5 w-full transition-all duration-500
                      ${paso < pasoActual ? "bg-[var(--brand-primary)]" : "bg-slate-200"}`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
