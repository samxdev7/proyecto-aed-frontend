"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { UserPlus, ArrowLeft } from "lucide-react";
import { authService } from "@/services/auth.service";
import { guardarSesion } from "@/lib/auth";
import type { RegistroRequest } from "@/types/auth";
import Boton from "@/components/ui/Boton";
import Campo from "@/components/ui/Campo";
import CompletarPerfilPopup from "@/components/auth/CompletarPerfilPopup";
import BotonGoogle from "@/components/auth/BotonGoogle";

/** Solo correo y contraseña — el resto del perfil se completa en el paso siguiente o desde /user/perfil. */
type FormularioRegistro = {
  correo: string;
  contrasena: string;
};

const vacio: FormularioRegistro = {
  correo: "",
  contrasena: "",
};

function ContenidoRegistro() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const destino = searchParams.get("redir");
  const redir = destino && destino.startsWith("/") ? destino : null;

  const [perfilPopupAbierto, setPerfilPopupAbierto] = useState(false);
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

    // Envíamos solo correo y contraseña; el perfil se completa en la siguiente sección.
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
      // El popup de perfil se abre sobre el registro, sin cambiar de pantalla.
      setPerfilPopupAbierto(true);
      setEnviando(false);
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

          <div className="flex flex-col gap-2 pt-1">
            <Boton type="submit" fullWidth loading={enviando}>
              Crear mi cuenta
            </Boton>
            <BotonGoogle redir={redir} texto="Registrarse con Google" />
          </div>
        </form>

        <p className="text-center text-sm text-text-muted">
          ¿Ya tienes una cuenta?{" "}
          <Link
            href={redir ? `/iniciar-sesion?redir=${encodeURIComponent(redir)}` : "/iniciar-sesion"}
            className="font-bold text-primary hover:underline"
          >
            Inicia sesión aquí
          </Link>
        </p>

        <div className="pt-2 border-t border-neutral-border text-center">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back();
              } else {
                router.push(redir || "/");
              }
            }}
            className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-text-muted hover:text-text-main transition-colors py-1.5 px-3 rounded hover:bg-surface-alt"
          >
            <ArrowLeft size={14} />
            <span>Volver a la página anterior</span>
          </button>
        </div>
      </div>

      <CompletarPerfilPopup
        abierto={perfilPopupAbierto}
        onCerrar={() => {
          setPerfilPopupAbierto(false);
          router.push(redir || "/viajes");
        }}
        alCompletar={() => router.push(redir || "/viajes")}
      />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-bg-main" />}>
      <ContenidoRegistro />
    </Suspense>
  );
}

