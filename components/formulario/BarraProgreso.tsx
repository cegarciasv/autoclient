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
    <div className="space-y-3">
      {/* Cabecera: "Paso X de Y — Label" + porcentaje */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500 font-medium">
          Paso{" "}
          <span className="text-slate-800 font-semibold">{pasoActual}</span>{" "}
          de{" "}
          <span className="text-slate-800 font-semibold">{pasos.length}</span>
          {" "}—{" "}
          <span className="text-[#1A7A30] font-semibold">{labelActual}</span>
        </span>
        <span className="font-bold text-[#1A7A30]">{progreso}%</span>
      </div>

      {/* Barra de progreso elegante */}
      <div className="w-full h-1.5 rounded-full bg-slate-100">
        <div
          className="h-1.5 rounded-full bg-gradient-to-r from-[#1A7A30] to-[#1B3C22] transition-all duration-500"
          style={{ width: `${progreso}%` }}
        />
      </div>

      {/* Círculos de paso con líneas conectoras */}
      <div className="flex items-start">
        {pasos.map(({ paso, label }, idx) => {
          const completado = paso < pasoActual;
          const actual     = paso === pasoActual;
          return (
            <div key={paso} className="flex items-start flex-1">
              {/* Círculo + label */}
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                    ${completado ? "bg-[#1A7A30] border-[#1A7A30] text-white shadow-sm" : ""}
                    ${actual     ? "bg-white border-[#1A7A30] text-[#1A7A30] shadow-md ring-4 ring-[#1A7A30]/10" : ""}
                    ${!completado && !actual ? "bg-white border-slate-200 text-slate-400" : ""}`}
                >
                  {completado ? <Check className="h-4 w-4" /> : paso}
                </div>
                <span
                  className={`text-[10px] text-center leading-tight hidden sm:block
                    ${actual ? "text-[#1A7A30] font-semibold" : "text-slate-400"}`}
                >
                  {label}
                </span>
              </div>

              {/* Línea conectora (no después del último) */}
              {idx < pasos.length - 1 && (
                <div className="flex-1 flex items-center" style={{ marginTop: "18px" }}>
                  <div
                    className={`h-0.5 w-full transition-all duration-500
                      ${paso < pasoActual ? "bg-[#1A7A30]" : "bg-slate-200"}`}
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
