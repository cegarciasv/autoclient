import Image from "next/image";
import {
  ShieldCheck,
  Zap,
  BarChart3,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const ERROR_MESSAGES: Record<string, string> = {
  no_access: "No tiene acceso autorizado. Contacte al administrador.",
  server_error: "Error al iniciar sesión. Intente nuevamente.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const errorMessage = error ? ERROR_MESSAGES[error] ?? null : null;

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* ── Panel izquierdo (solo desktop) ── */}
      <div className="hidden lg:flex flex-col justify-between bg-[#1E3A8A] px-10 py-8 relative overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#2563EB]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#2563EB]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          {/* Grid sutil */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Logo */}
        <div className="relative">
          <Image
            src="/logo.png"
            alt="Transporte Sebastián"
            width={500}
            height={342}
            className="w-auto max-h-[28vh] object-contain"
            priority
          />
        </div>

        {/* Contenido central */}
        <div className="relative space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Panel de
              <br />
              <span className="text-[#60A5FA]">Administración</span>
            </h2>
            <p className="text-slate-400 text-base leading-relaxed max-w-sm">
              Gestiona el proceso de vinculación de clientes y proveedores desde
              un solo lugar, con trazabilidad completa y en tiempo real.
            </p>
          </div>

          {/* Bullet points */}
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-[#2563EB]/20 rounded-lg flex items-center justify-center mt-0.5">
                <ShieldCheck className="h-4 w-4 text-[#60A5FA]" />
              </span>
              <div>
                <p className="text-white text-sm font-medium">
                  Seguridad empresarial
                </p>
                <p className="text-slate-500 text-xs mt-0.5">
                  Acceso controlado con sesiones cifradas y auditoría de
                  actividad.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-[#2563EB]/20 rounded-lg flex items-center justify-center mt-0.5">
                <Zap className="h-4 w-4 text-[#60A5FA]" />
              </span>
              <div>
                <p className="text-white text-sm font-medium">
                  Eficiencia operativa
                </p>
                <p className="text-slate-500 text-xs mt-0.5">
                  Automatiza el envío de formularios y reduce tiempos de
                  onboarding.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-[#2563EB]/20 rounded-lg flex items-center justify-center mt-0.5">
                <BarChart3 className="h-4 w-4 text-[#60A5FA]" />
              </span>
              <div>
                <p className="text-white text-sm font-medium">
                  Control y visibilidad
                </p>
                <p className="text-slate-500 text-xs mt-0.5">
                  Seguimiento del progreso de cada tercero con reportes
                  detallados.
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* Footer izquierdo */}
        <div className="relative flex items-center gap-2 text-xs text-slate-600">
          <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />
          Todos los sistemas operativos
        </div>
      </div>

      {/* ── Panel derecho ── */}
      <div className="flex flex-col items-center justify-center min-h-screen lg:min-h-0 bg-slate-50 px-6 py-8">
        {/* Logo visible solo en móvil */}
        <div className="lg:hidden mb-6">
          <Image
            src="/logo.png"
            alt="Transporte Sebastián"
            width={400}
            height={274}
            className="w-auto max-h-[18vh] object-contain"
            priority
          />
        </div>

        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-200/60 overflow-hidden">
            {/* Header */}
            <div className="px-8 pt-8 pb-6 border-b border-slate-100 text-center">
              <h1 className="text-2xl font-bold text-slate-900">
                Acceso administrativo
              </h1>
              <p className="text-sm text-slate-500 mt-1.5">
                Inicie sesión con su cuenta Microsoft 365 de Transporte Sebastián
              </p>
            </div>

            {/* Body */}
            <div className="px-8 py-6 space-y-5">
              {/* Error banner */}
              {errorMessage && (
                <div className="flex items-start gap-2.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-red-500" />
                  <span className="leading-tight">{errorMessage}</span>
                </div>
              )}

              {/* Microsoft login button */}
              <a
                href="/api/auth/microsoft/login"
                className="flex items-center justify-center gap-3 w-full h-12 rounded-xl bg-white border border-[#e2e8f0] text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 21 21"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                  <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                  <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                  <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                </svg>
                Iniciar sesión con Microsoft 365
              </a>
            </div>

            {/* Footer seguridad */}
            <div className="px-8 pb-6">
              <div className="flex items-center gap-2 text-xs text-slate-400 justify-center">
                <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                Conexión segura &middot; Sesión cifrada
              </div>
            </div>
          </div>

          {/* Copyright */}
          <p className="text-center text-xs text-slate-400 mt-6">
            &copy; {new Date().getFullYear()} Transporte Sebastián &middot; Todos los
            derechos reservados
          </p>
        </div>
      </div>
    </div>
  );
}
