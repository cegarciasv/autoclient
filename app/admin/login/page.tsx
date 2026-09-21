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
    <div className="min-h-screen lg:grid lg:grid-cols-[1.08fr_0.92fr] workspace-canvas">
      {/* ── Panel izquierdo (solo desktop) ── */}
      <div className="hidden lg:flex flex-col justify-between bg-[var(--brand-dark)] px-12 xl:px-16 py-12 relative overflow-hidden text-white">
        {/* Decoración de fondo */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[36rem] h-[36rem] border-[90px] border-white/5 rounded-full" />
          <div className="absolute -bottom-56 -left-32 w-[42rem] h-[42rem] border-[1px] border-white/15 rounded-full" />
          {/* Grid sutil */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        {/* Logo */}
        <div className="relative">
          <Image
            src="/api/branding/logo"
            unoptimized
            alt="Logo de la empresa"
            width={280}
            height={90}
            className="h-20 w-auto object-contain object-left"
            priority
          />
        </div>

        {/* Contenido central */}
        <div className="relative space-y-9 max-w-[600px]">
          <div className="space-y-5">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/60">01 / Espacio de trabajo</p>
            <h2 className="display-title text-5xl xl:text-6xl text-white">
              Cada vinculación,
              <br />
              <span className="italic text-[var(--brand-accent)]">en orden.</span>
            </h2>
            <p className="text-white/70 text-base leading-relaxed max-w-md">
              Un espacio claro para acompañar a clientes y proveedores desde el primer contacto hasta su expediente completo.
            </p>
          </div>

          {/* Bullet points */}
          <ul className="space-y-4 border-t border-white/15 pt-7">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center mt-0.5">
                <ShieldCheck className="h-4 w-4 text-[var(--brand-accent)]" />
              </span>
              <div>
                <p className="text-white text-sm font-medium">
                  Seguridad empresarial
                </p>
                <p className="text-white/55 text-xs mt-0.5">
                  Acceso controlado con sesiones cifradas y auditoría de
                  actividad.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center mt-0.5">
                <Zap className="h-4 w-4 text-[var(--brand-accent)]" />
              </span>
              <div>
                <p className="text-white text-sm font-medium">
                  Eficiencia operativa
                </p>
                <p className="text-white/55 text-xs mt-0.5">
                  Automatiza el envío de formularios y reduce tiempos de
                  onboarding.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center mt-0.5">
                <BarChart3 className="h-4 w-4 text-[var(--brand-accent)]" />
              </span>
              <div>
                <p className="text-white text-sm font-medium">
                  Control y visibilidad
                </p>
                <p className="text-white/55 text-xs mt-0.5">
                  Seguimiento del progreso de cada tercero con reportes
                  detallados.
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* Footer izquierdo */}
        <div className="relative flex items-center gap-2 text-xs text-white/50">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          Acceso protegido para personal autorizado
        </div>
      </div>

      {/* ── Panel derecho ── */}
      <div className="flex flex-col items-center justify-center min-h-screen lg:min-h-0 px-6 py-12">
        {/* Logo visible solo en móvil */}
        <div className="lg:hidden mb-10 rounded-2xl bg-[var(--brand-dark)] px-7 py-4 shadow-lg shadow-slate-900/10">
          <Image
            src="/api/branding/logo"
            unoptimized
            alt="Logo de la empresa"
            width={280}
            height={88}
            className="h-16 w-auto object-contain"
            priority
          />
        </div>

        <div className="w-full max-w-md">
          {/* Card */}
          <div className="surface-card overflow-hidden">
            {/* Header */}
            <div className="px-8 pt-8 pb-6 border-b border-slate-100 text-center">
              <p className="eyebrow mb-3">Bienvenido</p>
              <h1 className="display-title text-3xl text-slate-900">
                Acceso administrativo
              </h1>
              <p className="text-sm text-slate-500 mt-1.5">
                Inicie sesión con su cuenta Microsoft 365
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
                className="flex items-center justify-center gap-3 w-full min-h-12 rounded-xl bg-[var(--brand-dark)] text-white text-sm font-semibold hover:opacity-90 transition-opacity brand-focus"
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
            &copy; {new Date().getFullYear()} &middot; Todos los
            derechos reservados
          </p>
        </div>
      </div>
    </div>
  );
}
