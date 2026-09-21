"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, FileText, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const STEPS = [
  { id: 1, label: "Documento", icon: FileText },
  { id: 2, label: "Código", icon: KeyRound },
  { id: 3, label: "Acceso", icon: LockKeyhole },
];

function MiniStepper({ active }: { active: 1 | 2 | 3 }) {
  return <div className="flex items-start justify-between gap-2" aria-label="Pasos de verificación">
    {STEPS.map(({ id, label, icon: Icon }, index) => <div key={id} className="flex flex-1 items-start">
      <div className="flex flex-col items-center gap-2">
        <span aria-current={id === active ? "step" : undefined} className={`grid size-9 place-items-center rounded-full border text-sm ${id < active ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white" : id === active ? "border-[var(--brand-primary)] bg-[#e9f4ef] text-[var(--brand-primary)]" : "border-[#e2e8ec] bg-white text-[#8493a5]"}`}>
          {id < active ? <Check className="size-4" /> : <Icon className="size-4" />}
        </span>
        <span className={`text-xs font-medium ${id === active ? "text-[var(--brand-primary)]" : "text-[#8493a5]"}`}>{label}</span>
      </div>
      {index < STEPS.length - 1 && <span className={`mt-[18px] mx-3 h-px flex-1 ${id < active ? "bg-[var(--brand-primary)]" : "bg-[#e2e8ec]"}`} />}
    </div>)}
  </div>;
}

function ErrorMsg({ text }: { text: string }) {
  return <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{text}</p>;
}

export default function FormularioLoginPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const [etapa, setEtapa] = useState<"documento" | "otp">("documento");
  const [documento, setDocumento] = useState("");
  const [emailOculto, setEmailOculto] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function verificarDocumento(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setCargando(true);
    try {
      const res = await fetch(`/api/formulario/${token}/verificar`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numeroDocumento: documento }),
      });
      const data = await res.json().catch(() => ({})) as { email?: string; error?: string };
      if (!res.ok) throw new Error(data.error || `Error al verificar el documento (${res.status})`);
      setEmailOculto(data.email || "");
      setEtapa("otp");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Error de conexión");
    } finally {
      setCargando(false);
    }
  }

  async function verificarOTP(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setCargando(true);
    try {
      const res = await fetch(`/api/formulario/${token}/otp`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: otp }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(data.error || `Código incorrecto (${res.status})`);
      }
      router.push(`/formulario/${token}/paso/1`);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Error de conexión");
    } finally {
      setCargando(false);
    }
  }

  return <div className="grid min-h-[520px] items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.95fr)] xl:gap-16">
    <div className="max-w-xl">
      <p className="eyebrow">Portal de vinculación</p>
      <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-[#142033] sm:text-4xl lg:text-[42px]">
        Un proceso claro para completar su expediente.
      </h1>
      <p className="mt-5 max-w-lg text-base leading-relaxed text-[#52657a]">
        Verifique su identidad para ingresar al formulario. Podrá avanzar por secciones y consultar su progreso en cada paso.
      </p>
      <div className="mt-8 hidden gap-3 sm:grid sm:grid-cols-3 lg:grid-cols-1">
        {[
          { number: "01", title: "Identifíquese", detail: "Ingrese el documento registrado." },
          { number: "02", title: "Confirme su acceso", detail: "Use el código enviado a su correo." },
          { number: "03", title: "Complete el formulario", detail: "Avance por las secciones del expediente." },
        ].map((item) => <div key={item.number} className="flex gap-3 rounded-xl border border-[#e2e8ec] bg-white px-4 py-3">
          <span className="text-sm font-bold text-[var(--brand-primary)]">{item.number}</span>
          <div><p className="text-sm font-semibold text-[#142033]">{item.title}</p><p className="mt-0.5 text-xs leading-relaxed text-[#52657a]">{item.detail}</p></div>
        </div>)}
      </div>
    </div>

    <div className="surface-card w-full max-w-[520px] lg:justify-self-end">
      <div className="border-b border-[#e2e8ec] px-6 py-6 sm:px-8">
        <MiniStepper active={etapa === "documento" ? 1 : 2} />
      </div>
      <div className="px-6 py-7 sm:px-8 sm:py-8">
        <span className="grid size-11 place-items-center rounded-xl bg-[#e9f4ef] text-[var(--brand-primary)]">
          {etapa === "documento" ? <ShieldCheck className="size-5" /> : <KeyRound className="size-5" />}
        </span>
        <h2 className="mt-5 text-xl font-bold text-[#142033]">{etapa === "documento" ? "Acceso al formulario" : "Verificación de identidad"}</h2>
        <p className="mt-1 text-sm leading-relaxed text-[#52657a]">{etapa === "documento"
          ? "Ingrese su número de documento para continuar."
          : `Ingrese el código enviado a ${emailOculto}.`}</p>

        {etapa === "documento" ? <form onSubmit={verificarDocumento} className="mt-7 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="documento" className="font-semibold text-[#142033]">Número de identificación</Label>
            <Input id="documento" value={documento} onChange={(e) => setDocumento(e.target.value)} placeholder="Sin guiones, espacios ni puntos" autoFocus required className="h-12 rounded-lg bg-[#f8fafb]" />
            <p className="text-xs text-[#8493a5]">Ingrese NIT, DUI o pasaporte según el tipo registrado.</p>
          </div>
          {error && <ErrorMsg text={error} />}
          <Button type="submit" disabled={cargando} className="brand-button h-12 w-full rounded-lg">{cargando ? "Verificando..." : "Continuar"}</Button>
        </form> : <form onSubmit={verificarOTP} className="mt-7 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="otp" className="font-semibold text-[#142033]">Código de verificación</Label>
            <Input id="otp" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="000000" maxLength={6} autoFocus required className="h-14 rounded-lg bg-[#f8fafb] text-center font-mono text-2xl tracking-[0.45em]" />
            <p className="text-xs text-[#8493a5]">El código es válido por 15 minutos.</p>
          </div>
          {error && <ErrorMsg text={error} />}
          <Button type="submit" disabled={cargando || otp.length !== 6} className="brand-button h-12 w-full rounded-lg">{cargando ? "Verificando..." : "Ingresar al formulario"}</Button>
          <button type="button" onClick={() => { setEtapa("documento"); setError(""); setOtp(""); }} className="w-full text-sm font-medium text-[#52657a] hover:text-[var(--brand-primary)]">Volver al paso anterior</button>
        </form>}
      </div>
      <div className="border-t border-[#e2e8ec] bg-[#f8fafb] px-6 py-4 text-xs text-[#52657a] sm:px-8">Si tiene problemas para acceder, contacte a su representante.</div>
    </div>
  </div>;
}
