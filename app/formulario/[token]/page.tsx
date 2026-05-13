"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, ShieldCheck } from "lucide-react";

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

  return (
    <div className="max-w-md mx-auto">
      <Card className="shadow-md">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-3">
            <div className="bg-blue-50 rounded-full p-3">
              {etapa === "documento" ? (
                <ShieldCheck className="h-8 w-8 text-[#1e3a5f]" />
              ) : (
                <KeyRound className="h-8 w-8 text-[#1e3a5f]" />
              )}
            </div>
          </div>
          <CardTitle className="text-xl text-[#1e3a5f]">
            {etapa === "documento" ? "Acceso al Formulario" : "Verificación de Identidad"}
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            {etapa === "documento"
              ? "Ingrese su número de documento para continuar"
              : `Ingrese el código enviado a ${emailOculto}`}
          </p>
        </CardHeader>

        <CardContent>
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
                />
                <p className="text-xs text-gray-400">
                  Ingrese NIT, DUI o Pasaporte según el tipo registrado
                </p>
              </div>
              {error && <ErrorMsg text={error} />}
              <Button
                type="submit"
                className="w-full bg-[#1e3a5f] hover:bg-[#162d4a]"
                disabled={cargando}
              >
                {cargando ? "Verificando..." : "Continuar"}
              </Button>
            </form>
          ) : (
            <form onSubmit={verificarOTP} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="otp">Código de verificación</Label>
                <Input
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-2xl tracking-widest font-mono"
                  autoFocus
                  required
                />
                <p className="text-xs text-gray-400 text-center">
                  El código es válido por 15 minutos
                </p>
              </div>
              {error && <ErrorMsg text={error} />}
              <Button
                type="submit"
                className="w-full bg-[#1e3a5f] hover:bg-[#162d4a]"
                disabled={cargando || otp.length !== 6}
              >
                {cargando ? "Verificando..." : "Ingresar al Formulario"}
              </Button>
              <button
                type="button"
                onClick={() => { setEtapa("documento"); setError(""); setOtp(""); }}
                className="w-full text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Volver
              </button>
            </form>
          )}
        </CardContent>
      </Card>

      <p className="text-center text-xs text-gray-400 mt-4">
        Si tiene problemas para acceder, contacte a su representante de Grupo Remor
      </p>
    </div>
  );
}

function ErrorMsg({ text }: { text: string }) {
  return (
    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
      {text}
    </p>
  );
}
