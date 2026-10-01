"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { authService } from "@/services/auth.service";
import { EVENTO_SESION, guardarSesion, obtenerSesion } from "@/lib/auth";
import type { Sesion } from "@/types/auth";
import Boton from "@/components/ui/Boton";
import Campo from "@/components/ui/Campo";

export default function LoginPage() {
  const router = useRouter();
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
      const destino = new URLSearchParams(window.location.search).get("redir");
      router.push(destino?.startsWith("/") ? destino : "/");
    } catch (excepcion) {
      setError(
        excepcion instanceof Error
          ? excepcion.message
          : "No pudimos iniciar tu sesión.",
      );
      setEnviando(false);
    }
  }

  if (sesion) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg-main px-md">
        <div className="w-full max-w-md space-y-md rounded-lg border border-neutral-border bg-surface p-lg text-center shadow-sm">
          <h1 className="text-2xl font-bold text-primary">
            Ya tienes una sesión iniciada
          </h1>
          <p className="text-sm text-text-muted">
            Hola, {sesion.nombreCompleto.split(" ")[0]}. Puedes ir a tu cuenta
            o volver al inicio.
          </p>
          <div className="flex justify-center gap-sm">
            <Boton href="/user/perfil">Ir a mi cuenta</Boton>
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
            Bienvenido de vuelta
          </h1>
          <p className="text-sm text-text-muted">
            Ingresa tus credenciales para acceder.
          </p>
        </div>

        <form className="space-y-md" onSubmit={entrar}>
          <Campo
            label="Correo electrónico"
            tipo="email"
            placeholder="correo@ejemplo.com"
            required
            valor={correo}
            alCambiar={setCorreo}
          />
          <Campo
            label="Contraseña"
            tipo="password"
            placeholder="••••••••"
            required
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

        <div className="space-y-xs text-center">
          <p className="text-sm text-text-muted">
            ¿No tienes una cuenta?{" "}
            <Link
              href="/registro"
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
