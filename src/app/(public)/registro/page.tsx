"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { authService } from "@/services/auth.service";
import { guardarSesion } from "@/lib/auth";
import type { RegistroRequest } from "@/types/auth";
import Boton from "@/components/ui/Boton";
import Campo from "@/components/ui/Campo";

/** Solo correo y contraseña — el resto del perfil se completa desde /user/perfil. */
type FormularioRegistro = {
  correo: string;
  contrasena: string;
};

const vacio: FormularioRegistro = {
  correo: "",
  contrasena: "",
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormularioRegistro>(vacio);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function actualizar<K extends keyof FormularioRegistro>(
    campo: K,
    valor: FormularioRegistro[K],
  ) {
    setForm((previo) => ({ ...previo, [campo]: valor }));
  }

  async function registrar(evento: React.FormEvent) {
    evento.preventDefault();
    if (form.contrasena.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setEnviando(true);
    setError(null);

    // Envíamos solo correo y contraseña; el perfil se completa más tarde.
    const request: RegistroRequest = {
      primerNombre: "",
      primerApellido: "",
      correo: form.correo.trim(),
      contrasena: form.contrasena,
      nacionalidad: "",
      tipoIdentificacion: "cedula",
      numeroIdentificacion: "",
      notificacionesHabilitadas: true,
    };

    try {
      await authService.registro(request);
    } catch (excepcion) {
      setError(
        excepcion instanceof Error
          ? excepcion.message
          : "No pudimos crear tu cuenta.",
      );
      setEnviando(false);
      return;
    }

    // El registro NO loguea (contrato): entrar de inmediato con las mismas credenciales.
    try {
      const sesion = await authService.login({
        correo: form.correo.trim(),
        contrasena: form.contrasena,
      });
      guardarSesion(sesion);
      router.push("/");
    } catch {
      setError(
        "Tu cuenta fue creada. No pudimos iniciar sesión automáticamente: entra con tu correo y contraseña.",
      );
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg-main px-md py-lg">
      <div className="w-full max-w-md space-y-lg rounded-lg border border-neutral-border bg-surface p-lg shadow-sm md:p-xl">
        <div className="space-y-xs text-center">
          <div className="mx-auto inline-flex rounded-md bg-primary p-sm text-white">
            <UserPlus size={28} aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-primary">Crea tu cuenta</h1>
          <p className="text-sm text-text-muted">
            Únete a nuestra comunidad de aventureros.
          </p>
        </div>

        <form
          className="flex flex-col gap-md"
          onSubmit={registrar}
          noValidate
        >
          <Campo
            label="Correo electrónico"
            tipo="email"
            placeholder="correo@ejemplo.com"
            required
            valor={form.correo}
            alCambiar={(valor) => actualizar("correo", valor)}
          />
          <Campo
            label="Contraseña"
            tipo="password"
            placeholder="Mínimo 8 caracteres"
            required
            hint="Usa al menos 8 caracteres."
            valor={form.contrasena}
            alCambiar={(valor) => actualizar("contrasena", valor)}
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
            Crear mi cuenta
          </Boton>
        </form>

        <p className="text-center text-sm text-text-muted">
          ¿Ya tienes una cuenta?{" "}
          <Link
            href="/iniciar-sesion"
            className="font-bold text-primary hover:underline"
          >
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
