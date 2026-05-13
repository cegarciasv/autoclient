import { CheckCircle2 } from "lucide-react";

export default function CompletadoPage() {
  return (
    <div className="max-w-md mx-auto text-center space-y-6 py-8">
      <div className="flex justify-center">
        <div className="bg-green-50 rounded-full p-5">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">¡Proceso completado!</h1>
        <p className="text-gray-600">
          Su formulario de vinculación ha sido enviado exitosamente a Grupo Remor.
        </p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-left space-y-2">
        <p className="text-sm font-medium text-gray-700">¿Qué sigue?</p>
        <ul className="text-sm text-gray-500 space-y-1 list-disc list-inside">
          <li>Nuestro equipo revisará su expediente</li>
          <li>Recibirá una notificación por correo electrónico con el resultado</li>
          <li>En caso de requerirse información adicional, le contactaremos</li>
        </ul>
      </div>

      <p className="text-xs text-gray-400">
        Si tiene consultas, comuníquese con su representante de Grupo Remor.
      </p>
    </div>
  );
}
