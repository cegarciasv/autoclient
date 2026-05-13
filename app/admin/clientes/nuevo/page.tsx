import FormNuevoTercero from "@/components/admin/FormNuevoTercero";

export default function NuevoClientePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Cliente</h1>
        <p className="text-sm text-gray-500 mt-1">
          Registra un cliente y envía el link de vinculación por email
        </p>
      </div>
      <FormNuevoTercero tipo="CLIENTE" />
    </div>
  );
}
