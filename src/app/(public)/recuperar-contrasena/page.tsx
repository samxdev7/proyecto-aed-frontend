"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, KeyRound, Mail } from "lucide-react";
import Boton from "@/components/ui/Boton";
import Campo from "@/components/ui/Campo";
import { authService } from "@/services/auth.service";

export default function RecuperarContrasenaPage() {
  const [correo, setCorreo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function manejarEnvio(evento: React.FormEvent) {
    evento.preventDefault();
    if (!correo.trim()) {
      setError("Por favor ingresa tu correo electrónico.");
      return;
    }

    setEnviando(true);
    setError(null);

    try {
      await authService.solicitarRecuperacion(correo.trim());
      setEnviado(true);
    } catch (excepcion) {
      setError(
        excepcion instanceof Error
          ? excepcion.message
          : "No pudimos procesar tu solicitud. Por favor intenta de nuevo más tarde.",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg-main px-md py-lg">
      <div className="w-full max-w-md space-y-lg rounded-lg border border-neutral-border bg-surface p-lg shadow-sm">
        {enviado ? (
          <div className="space-y-md text-center">
            <div className="mx-auto inline-flex rounded-full bg-success/15 p-md text-success">
              <CheckCircle2 size={36} aria-hidden="true" />
            </div>

            <div className="space-y-xs">
              <h1 className="text-2xl font-bold text-primary">
                Revisa tu correo
              </h1>
              <p className="text-sm text-text-muted leading-relaxed">
                Si la cuenta con el correo{" "}
                <span className="font-semibold text-text-main">{correo}</span>{" "}
                está registrada en el Club Nicaragüense de Montañismo, te hemos
                enviado las instrucciones y un enlace seguro para crear tu nueva
                contraseña.
              </p>
            </div>

            <div className="rounded-md border border-neutral-border bg-surface-alt p-md text-left text-xs text-text-muted space-y-1">
              <p className="font-semibold text-text-main">
                Ten en cuenta lo siguiente:
              </p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>El enlace es de un solo uso y expirará en 1 hora.</li>
                <li>Si no lo ves en unos minutos, revisa tu carpeta de spam.</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Boton href="/iniciar-sesion" fullWidth>
                Ir a iniciar sesión
              </Boton>
              <Boton
                type="button"
                variante="contorno"
                fullWidth
                onClick={() => {
                  setEnviado(false);
                  setCorreo("");
                }}
              >
                Solicitar con otro correo
              </Boton>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-xs text-center">
              <div className="mx-auto inline-flex rounded-md bg-primary p-sm text-white">
                <KeyRound size={28} aria-hidden="true" />
              </div>
              <h1 className="text-2xl font-bold text-primary">
                ¿Olvidaste tu contraseña?
              </h1>
              <p className="text-sm text-text-muted">
                Ingresa el correo electrónico asociado a tu cuenta para recibir
                un enlace de recuperación.
              </p>
            </div>

            <form className="space-y-md" onSubmit={manejarEnvio}>
              <Campo
                label="Correo electrónico"
                tipo="email"
                placeholder="correo@ejemplo.com"
                required
                ocultarAsterisco
                valor={correo}
                alCambiar={(val) => {
                  setCorreo(val);
                  if (error) setError(null);
                }}
              />

              {error ? (
                <p
                  className="rounded-sm bg-estado-rechazada-bg px-md py-sm text-sm text-estado-rechazada-text"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}

              <div className="pt-1">
                <Boton type="submit" fullWidth loading={enviando}>
                  <Mail size={16} />
                  <span>Enviar enlace de recuperación</span>
                </Boton>
              </div>
            </form>

            <div className="space-y-xs text-center">
              <p className="text-sm text-text-muted">
                ¿Recordaste tu contraseña?{" "}
                <Link
                  href="/iniciar-sesion"
                  className="font-bold text-primary hover:underline"
                >
                  Iniciar sesión
                </Link>
              </p>
            </div>

            <div className="pt-3 border-t border-neutral-border">
              <Boton
                href="/iniciar-sesion"
                variante="contorno"
                fullWidth
              >
                <ArrowLeft size={16} aria-hidden="true" />
                <span>Volver a iniciar sesión</span>
              </Boton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
