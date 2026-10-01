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

/** Formulario editable: todos los campos con string; "" en opcionales = sin responder. */
type FormularioRegistro = Omit<
  RegistroRequest,
  "segundoNombre" | "segundoApellido" | "telefono" | "sexo"
> & {
  segundoNombre: string;
  segundoApellido: string;
  telefono: string;
  /** "" = prefiero no decirlo (no se envía al backend). */
  sexo: string;
};

const vacio: FormularioRegistro = {
  primerNombre: "",
  segundoNombre: "",
  primerApellido: "",
  segundoApellido: "",
  correo: "",
  contrasena: "",
  telefono: "",
  sexo: "",
  nacionalidad: "Nicaragüense",
  tipoIdentificacion: "cedula",
  numeroIdentificacion: "",
  notificacionesHabilitadas: true,
};

const clasesSelect =
  "w-full rounded-sm border border-neutral-border bg-surface px-4 py-3 text-sm text-text-main outline-none transition focus:border-primary focus:ring-1 focus:ring-primary";

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

    const request: RegistroRequest = {
      primerNombre: form.primerNombre.trim(),
      primerApellido: form.primerApellido.trim(),
      correo: form.correo.trim(),
      contrasena: form.contrasena,
      nacionalidad: form.nacionalidad.trim() || "Nicaragüense",
      tipoIdentificacion: form.tipoIdentificacion,
      numeroIdentificacion: form.numeroIdentificacion.trim(),
      notificacionesHabilitadas: form.notificacionesHabilitadas,
    };
    // Los opcionales solo viajan si el usuario los llenó ("" = no enviar).
    if (form.segundoNombre.trim()) request.segundoNombre = form.segundoNombre.trim();
    if (form.segundoApellido.trim()) request.segundoApellido = form.segundoApellido.trim();
    if (form.telefono.trim()) request.telefono = form.telefono.trim();
    if (form.sexo) request.sexo = form.sexo as RegistroRequest["sexo"];

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
      <div className="w-full max-w-2xl space-y-lg rounded-lg border border-neutral-border bg-surface p-lg shadow-sm md:p-xl">
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
          className="grid grid-cols-1 gap-md md:grid-cols-2"
          onSubmit={registrar}
        >
          <Campo
            label="Primer nombre"
            required
            valor={form.primerNombre}
            alCambiar={(valor) => actualizar("primerNombre", valor)}
          />
          <Campo
            label="Segundo nombre"
            valor={form.segundoNombre}
            alCambiar={(valor) => actualizar("segundoNombre", valor)}
          />
          <Campo
            label="Primer apellido"
            required
            valor={form.primerApellido}
            alCambiar={(valor) => actualizar("primerApellido", valor)}
          />
          <Campo
            label="Segundo apellido"
            valor={form.segundoApellido}
            alCambiar={(valor) => actualizar("segundoApellido", valor)}
          />
          <div className="md:col-span-2">
            <Campo
              label="Correo electrónico"
              tipo="email"
              placeholder="correo@ejemplo.com"
              required
              valor={form.correo}
              alCambiar={(valor) => actualizar("correo", valor)}
            />
          </div>
          <Campo
            label="Contraseña"
            tipo="password"
            placeholder="Mínimo 8 caracteres"
            required
            hint="Usa al menos 8 caracteres."
            valor={form.contrasena}
            alCambiar={(valor) => actualizar("contrasena", valor)}
          />
          <Campo
            label="Teléfono"
            tipo="tel"
            placeholder="+505 0000-0000"
            valor={form.telefono}
            alCambiar={(valor) => actualizar("telefono", valor)}
          />
          <Campo
            label="Nacionalidad"
            required
            valor={form.nacionalidad}
            alCambiar={(valor) => actualizar("nacionalidad", valor)}
          />
          <div className="flex flex-col gap-1">
            <label
              htmlFor="registro-sexo"
              className="text-xs font-semibold text-text-muted"
            >
              Sexo
            </label>
            <select
              id="registro-sexo"
              value={form.sexo}
              onChange={(evento) => actualizar("sexo", evento.target.value)}
              className={clasesSelect}
            >
              <option value="">Prefiero no decirlo</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="registro-tipo-id"
              className="text-xs font-semibold text-text-muted"
            >
              Tipo de identificación <span className="text-error">*</span>
            </label>
            <select
              id="registro-tipo-id"
              value={form.tipoIdentificacion}
              onChange={(evento) =>
                actualizar("tipoIdentificacion", evento.target.value as "cedula" | "pasaporte")
              }
              required
              className={clasesSelect}
            >
              <option value="cedula">Cédula</option>
              <option value="pasaporte">Pasaporte</option>
            </select>
          </div>
          <Campo
            label="Número de identificación"
            required
            placeholder="001-000000-0000A"
            valor={form.numeroIdentificacion}
            alCambiar={(valor) => actualizar("numeroIdentificacion", valor)}
          />

          <label className="flex items-center gap-sm text-sm text-text-main md:col-span-2">
            <input
              type="checkbox"
              checked={form.notificacionesHabilitadas}
              onChange={(evento) =>
                actualizar("notificacionesHabilitadas", evento.target.checked)
              }
              className="h-4 w-4 accent-primary"
            />
            Quiero recibir notificaciones de nuevos viajes y del estado de mis
            reservas.
          </label>

          {error ? (
            <p
              className="rounded-sm bg-estado-rechazada-bg px-md py-sm text-sm text-estado-rechazada-text md:col-span-2"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <div className="md:col-span-2">
            <Boton type="submit" fullWidth loading={enviando}>
              Crear mi cuenta
            </Boton>
          </div>
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
