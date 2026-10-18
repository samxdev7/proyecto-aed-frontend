"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn } from "lucide-react";
import { authService } from "@/services/auth.service";
import { EVENTO_SESION, esAdministrador, guardarSesion, obtenerSesion } from "@/lib/auth";
import { ApiError } from "@/lib/api-client";
import type { Sesion } from "@/types/auth";
import Boton from "@/components/ui/Boton";
import Campo from "@/components/ui/Campo";
import BotonGoogle from "@/components/auth/BotonGoogle";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const destino = searchParams.get("redir");
  const redir = destino && destino.startsWith("/") ? destino : null;

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const actualizar = () => setSesion(obtenerSesion());
    actualizar();
    window.addEventListener(EVENTO_SESION, actualizar);
    return () => window.removeEventListener(EVENTO_SESION, actualizar);
  }, []);

  async function entrar(evento: React.FormEvent) {
    evento.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      const nueva = await authService.login({
        correo: correo.trim(),
        contrasena,
      });
      guardarSesion(nueva);
      if (redir) {
        router.push(redir);
      } else if (esAdministrador(nueva)) {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (excepcion) {
      // Credenciales inválidas: backend devuelve 500 (debería ser 401) con
      // "Credenciales inválidas" en el mensaje. Nunca mostrar ese texto crudo.
      const credInvalidas =
        excepcion instanceof ApiError &&
        (excepcion.status === 401 ||
          /credenciales/i.test(excepcion.message));
      setError(
        credInvalidas
          ? "No se pudo encontrar este correo electrónico, o la contraseña no coincide con el correo registrado."
          : excepcion instanceof Error
            ? excepcion.message
            : "No pudimos iniciar tu sesión.",
      );
      setEnviando(false);
    }
  }

  if (sesion) {
    const esAdmin = esAdministrador(sesion);
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg-main px-md">
        <div className="w-full max-w-md space-y-md rounded-lg border border-neutral-border bg-surface p-lg text-center shadow-sm">
          <h1 className="text-2xl font-bold text-primary">
            Ya tienes una sesión iniciada
          </h1>
          <p className="text-sm text-text-muted">
            Hola, {sesion.nombreCompleto.split(" ")[0]}. Puedes ir a tu cuenta
            {esAdmin ? ", al panel de administración" : ""} o volver al inicio.
          </p>
          <div className="flex flex-wrap justify-center gap-sm">
            {esAdmin ? (
              <Boton href="/admin">Panel de Administración</Boton>
            ) : null}
            <Boton href="/user/perfil" variante={esAdmin ? "contorno" : "primario"}>
              Ir a mi cuenta
            </Boton>
            <Boton href="/" variante="contorno">
              Ir al inicio
            </Boton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg-main px-md py-lg">
      <div className="w-full max-w-md space-y-lg rounded-lg border border-neutral-border bg-surface p-lg shadow-sm">
        <div className="space-y-xs text-center">
          <div className="mx-auto inline-flex rounded-md bg-primary p-sm text-white">
            <LogIn size={28} aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-primary">
            Accede a tu cuenta
          </h1>
          <p className="text-sm text-text-muted">
            Usa tu cuenta registrada.
          </p>
        </div>

        <form className="space-y-md" onSubmit={entrar}>
          <Campo
            label="Correo electrónico"
            tipo="email"
            placeholder="correo@ejemplo.com"
            required
            ocultarAsterisco
            valor={correo}
            alCambiar={setCorreo}
          />
          <Campo
            label="Contraseña"
            tipo="password"
            placeholder="••••••••"
            required
            ocultarAsterisco
            valor={contrasena}
            alCambiar={setContrasena}
          />

          {error ? (
            <p
              className="rounded-sm bg-estado-rechazada-bg px-md py-sm text-sm text-estado-rechazada-text"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <Boton type="submit" fullWidth loading={enviando}>
            Iniciar sesión
          </Boton>
        </form>

        <div className="relative my-sm flex items-center justify-center">
          <div className="w-full border-t border-neutral-border" />
          <span className="bg-surface px-sm text-xs uppercase text-text-muted">
            o continúa con
          </span>
        </div>

        <BotonGoogle redir={redir} />

        <div className="space-y-xs text-center">
          <p className="text-sm text-text-muted">
            ¿No tienes una cuenta?{" "}
            <Link
              href={
                redir
                  ? `/registro?redir=${encodeURIComponent(redir)}`
                  : "/registro"
              }
              className="font-bold text-primary hover:underline"
            >
              Regístrate aquí
            </Link>
          </p>
          <Link
            href="/viajes"
            className="inline-block text-xs text-primary hover:underline"
          >
            Continuar sin cuenta →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-bg-main" />}>
      <LoginContent />
    </Suspense>
  );
}

