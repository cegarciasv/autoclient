"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, ShieldCheck, Check, FileText, LogIn } from "lucide-react";

// ─── Mini stepper horizontal ───────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Documento", icon: FileText },
  { id: 2, label: "Código",    icon: KeyRound },
  { id: 3, label: "Acceso",   icon: LogIn },
];

function MiniStepper({ active }: { active: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-6">
      {STEPS.map((step, idx) => {
        const done    = step.id < active;
        const current = step.id === active;
        const Icon    = step.icon;
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all
                  ${done    ? "bg-[#2563EB] border-[#2563EB] text-white" : ""}
                  ${current ? "bg-white border-[#2563EB] text-[#2563EB] shadow-md ring-4 ring-[#2563EB]/10" : ""}
                  ${!done && !current ? "bg-white border-slate-200 text-slate-300" : ""}`}
              >
                {done ? <Check className="h-4 w-4" /> : <Icon className="h-3.5 w-3.5" />}
              </div>
              <span
                className={`text-[10px] font-medium leading-none
                  ${current ? "text-[#2563EB] font-semibold" : "text-slate-400"}`}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`h-0.5 w-8 mx-1 mb-4 rounded-full transition-all
                  ${step.id < active ? "bg-[#2563EB]" : "bg-slate-200"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Error message ─────────────────────────────────────────────────────────
function ErrorMsg({ text }: { text: string }) {
  return (
    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
      {text}
    </p>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default function FormularioLoginPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const [etapa, setEtapa] = useState<"documento" | "otp">("documento");
  const [documento, setDocumento] = useState("");
  const [emailOculto, setEmailOculto] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function verificarDocumento(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCargando(true);

    const res = await fetch(`/api/formulario/${token}/verificar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numeroDocumento: documento }),
    });

    setCargando(false);

    if (res.ok) {
      const data = await res.json().catch(() => ({ email: "" }));
      setEmailOculto(data.email);
      setEtapa("otp");
    } else {
      const data = await res.json().catch(() => ({ error: "" }));
      setError(data.error || `Error al verificar el documento (${res.status})`);
    }
  }

  async function verificarOTP(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCargando(true);

    const res = await fetch(`/api/formulario/${token}/otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo: otp }),
    });

    setCargando(false);

    if (res.ok) {
      router.push(`/formulario/${token}/paso/1`);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({ error: "" }));
      setError(data.error || `Código incorrecto (${res.status})`);
    }
  }

  const stepActual = etapa === "documento" ? 1 : 2;
  const HeroIcon   = etapa === "documento" ? ShieldCheck : KeyRound;

  return (
    <div className="max-w-md mx-auto">
      {/* Hero icon */}
      <div className="flex justify-center mb-5">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] flex items-center justify-center shadow-lg ring-4 ring-[#2563EB]/10">
          <HeroIcon className="h-8 w-8 text-white" />
        </div>
      </div>

      <Card className="shadow-xl border-0 rounded-2xl overflow-hidden">
        <CardHeader className="text-center pb-2 pt-6 px-6">
          <MiniStepper active={stepActual as 1 | 2 | 3} />
          <CardTitle className="text-xl text-slate-800">
            {etapa === "documento" ? "Acceso al Formulario" : "Verificación de Identidad"}
          </CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            {etapa === "documento"
              ? "Ingrese su número de documento para continuar"
              : `Ingrese el código enviado a ${emailOculto}`}
          </p>
        </CardHeader>

        <CardContent className="px-6 pb-6 pt-4">
          {etapa === "documento" ? (
            <form onSubmit={verificarDocumento} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="documento">Número de Identificación</Label>
                <Input
                  id="documento"
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                  placeholder="Sin guiones, espacios ni puntos"
                  autoFocus
                  required
                  className="h-11"
                />
                <p className="text-xs text-slate-400">
                  Ingrese NIT, DUI o Pasaporte según el tipo registrado
                </p>
              </div>
              {error && <ErrorMsg text={error} />}
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] hover:from-[#1D4ED8] hover:to-[#2563EB] transition-all"
                disabled={cargando}
              >
                {cargando ? "Verificando..." : "Continuar"}
              </Button>
            </form>
          ) : (
            <form onSubmit={verificarOTP} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="otp" className="text-center block">Código de verificación</Label>
                <Input
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="0  0  0  0  0  0"
                  maxLength={6}
                  className="text-center text-3xl tracking-[0.5em] font-mono h-14 border-2 focus:border-[#2563EB]"
                  autoFocus
                  required
                />
                <p className="text-xs text-slate-400 text-center">
                  El código es válido por 15 minutos
                </p>
              </div>
              {error && <ErrorMsg text={error} />}
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] hover:from-[#1D4ED8] hover:to-[#2563EB] transition-all"
                disabled={cargando || otp.length !== 6}
              >
                {cargando ? "Verificando..." : "Ingresar al Formulario"}
              </Button>
              <button
                type="button"
                onClick={() => { setEtapa("documento"); setError(""); setOtp(""); }}
                className="w-full text-sm text-slate-500 hover:text-slate-700 underline underline-offset-2"
              >
                Volver al paso anterior
              </button>
            </form>
          )}
        </CardContent>
      </Card>

      <p className="text-center text-xs text-slate-400 mt-5">
        Si tiene problemas para acceder, contacte a su representante de Transporte Sebastián
      </p>
    </div>
  );
}
