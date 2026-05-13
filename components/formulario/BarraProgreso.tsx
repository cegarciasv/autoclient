"use client";

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
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">Progreso del formulario</span>
        <span className="font-bold text-[#1e3a5f]">{progreso}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-[#1e3a5f] h-2 rounded-full transition-all duration-500"
          style={{ width: `${progreso}%` }}
        />
      </div>
      <div className="flex items-start gap-1">
        {pasos.map(({ paso, label }) => {
          const completado = paso < pasoActual;
          const actual = paso === pasoActual;
          return (
            <div key={paso} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                  ${completado ? "bg-[#1e3a5f] border-[#1e3a5f] text-white" : ""}
                  ${actual ? "bg-white border-[#1e3a5f] text-[#1e3a5f]" : ""}
                  ${!completado && !actual ? "bg-white border-gray-300 text-gray-400" : ""}`}
              >
                {completado ? "✓" : paso}
              </div>
              <span
                className={`text-center leading-tight hidden sm:block
                  ${actual ? "text-[#1e3a5f] font-semibold" : "text-gray-400"}
                  text-[10px]`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
