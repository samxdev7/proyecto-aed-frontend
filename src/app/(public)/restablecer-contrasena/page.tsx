"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft, CheckCircle2, LockKeyhole } from "lucide-react";
import Boton from "@/components/ui/Boton";
import Campo from "@/components/ui/Campo";
import Skeleton from "@/components/ui/Skeleton";
import { authService } from "@/services/auth.service";

function RestablecerContrasenaContenido() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [completado, setCompletado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!token || !token.trim()) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg-main px-md py-lg">
        <div className="w-full max-w-md space-y-md rounded-lg border border-neutral-border bg-surface p-lg text-center shadow-sm">
          <div className="mx-auto inline-flex rounded-full bg-warning/15 p-md text-warning">
            <AlertCircle size={36} aria-hidden="true" />
          </div>
          <h1 className="text-xl font-bold text-primary">
            Enlace incompleto o inválido
          </h1>
          <p className="text-sm text-text-muted leading-relaxed">
            No se encontró el token de seguridad para restablecer tu contraseña.
            Por favor solicita un nuevo enlace desde la pantalla de
            recuperación.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Boton href="/recuperar-contrasena" fullWidth>
              Solicitar enlace de recuperación
            </Boton>
            <Boton href="/iniciar-sesion" variante="contorno" fullWidth>
              Volver a iniciar sesión
            </Boton>
          </div>
        </div>
      </div>
    );
  }

  async function manejarGuardar(evento: React.FormEvent) {
    evento.preventDefault();
    setError(null);

    if (nuevaContrasena.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      setError("Las contraseñas no coinciden. Por favor verifícalas.");
      return;
    }

    setGuardando(true);

    try {
      await authService.restablecerContrasena(token!, nuevaContrasena);
      setCompletado(true);
    } catch (excepcion) {
      setError(
        excepcion instanceof Error
          ? excepcion.message
          : "No pudimos restablecer tu contraseña. El enlace puede haber expirado o ya haber sido utilizado.",
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg-main px-md py-lg">
      <div className="w-full max-w-md space-y-lg rounded-lg border border-neutral-border bg-surface p-lg shadow-sm">
        {completado ? (
          <div className="space-y-md text-center">
            <div className="mx-auto inline-flex rounded-full bg-success/15 p-md text-success">
              <CheckCircle2 size={36} aria-hidden="true" />
            </div>

            <div className="space-y-xs">
              <h1 className="text-2xl font-bold text-primary">
                ¡Contraseña actualizada!
              </h1>
              <p className="text-sm text-text-muted leading-relaxed">
                Tu contraseña ha sido restablecida exitosamente. Ya puedes
                acceder a tu cuenta utilizando tu nueva contraseña.
              </p>
            </div>

            <div className="pt-2">
              <Boton href="/iniciar-sesion" fullWidth>
                Iniciar sesión ahora
              </Boton>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-xs text-center">
              <div className="mx-auto inline-flex rounded-md bg-primary p-sm text-white">
                <LockKeyhole size={28} aria-hidden="true" />
              </div>
              <h1 className="text-2xl font-bold text-primary">
                Crea una nueva contraseña
              </h1>
              <p className="text-sm text-text-muted">
                Ingresa y confirma tu nueva clave de acceso personal.
              </p>
            </div>

            <form className="space-y-md" onSubmit={manejarGuardar}>
              <Campo
                label="Nueva contraseña"
                tipo="password"
                placeholder="Mínimo 6 caracteres"
                required
                ocultarAsterisco
                valor={nuevaContrasena}
                alCambiar={(val) => {
                  setNuevaContrasena(val);
                  if (error) setError(null);
                }}
              />

              <Campo
                label="Confirmar nueva contraseña"
                tipo="password"
                placeholder="Repite tu contraseña"
                required
                ocultarAsterisco
                valor={confirmarContrasena}
                alCambiar={(val) => {
                  setConfirmarContrasena(val);
                  if (error) setError(null);
                }}
              />

              {error ? (
                <div className="space-y-sm">
                  <p
                    className="rounded-sm bg-estado-rechazada-bg px-md py-sm text-sm text-estado-rechazada-text"
                    role="alert"
                  >
                    {error}
                  </p>
                  {/expirado|inválido|utilizado/i.test(error) && (
                    <Boton
                      href="/recuperar-contrasena"
                      variante="contorno"
                      fullWidth
                    >
                      Solicitar nuevo enlace
                    </Boton>
                  )}
                </div>
              ) : null}

              <div className="pt-1">
                <Boton type="submit" fullWidth loading={guardando}>
                  <span>Guardar nueva contraseña</span>
                </Boton>
              </div>
            </form>

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

export default function RestablecerContrasenaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-bg-main px-md py-lg">
          <div className="w-full max-w-md space-y-md rounded-lg border border-neutral-border bg-surface p-lg shadow-sm">
            <Skeleton className="h-10 w-24 mx-auto rounded-md" />
            <Skeleton className="h-6 w-3/4 mx-auto" />
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      }
    >
      <RestablecerContrasenaContenido />
    </Suspense>
  );
}
