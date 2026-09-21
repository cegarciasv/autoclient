import { CheckCircle2 } from "lucide-react";

export default function CompletadoPage() {
  return (
    <div className="surface-card max-w-2xl mx-auto text-center space-y-6 px-6 py-10 sm:px-12 sm:py-14">
      <div className="flex justify-center">
        <div className="bg-[#e9f4ef] rounded-full p-5">
          <CheckCircle2 className="h-12 w-12 text-[var(--brand-primary)]" />
        </div>
      </div>

      <div className="space-y-2">
        <p className="eyebrow">Vinculación</p>
        <h1 className="text-3xl font-bold text-[#142033]">¡Proceso completado!</h1>
        <p className="text-[#52657a]">
          Su formulario de vinculación ha sido enviado exitosamente.
        </p>
      </div>

      <div className="bg-[#f8fafb] border border-[#e2e8ec] rounded-lg p-5 text-left space-y-2">
        <p className="text-sm font-semibold text-[#142033]">¿Qué sigue?</p>
        <ul className="text-sm text-[#52657a] space-y-1 list-disc list-inside">
          <li>Nuestro equipo revisará su expediente</li>
          <li>Recibirá una notificación por correo electrónico con el resultado</li>
          <li>En caso de requerirse información adicional, le contactaremos</li>
        </ul>
      </div>

      <p className="text-xs text-gray-400">
        Si tiene consultas, comuníquese con su representante.
      </p>
    </div>
  );
}
