"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, UserCheck } from "lucide-react";
import { userService } from "@/services/user.service";
import { actualizarDatosSesion } from "@/lib/auth";
import type { ActualizarPerfilRequest, UsuarioPerfil } from "@/types/usuario";
import Boton from "@/components/ui/Boton";
import Campo from "@/components/ui/Campo";

interface FormularioCompletar {
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  tipoIdentificacion: "cedula" | "pasaporte";
  numeroIdentificacion: string;
  nacionalidad: string;
  sexo: "M" | "F" | "Otro";
  telefono: string;
}

const vacio: FormularioCompletar = {
  primerNombre: "",
  segundoNombre: "",
  primerApellido: "",
  segundoApellido: "",
  tipoIdentificacion: "cedula",
  numeroIdentificacion: "",
  nacionalidad: "Nicaragüense",
  sexo: "M",
  telefono: "",
};

interface SeccionCompletarPerfilProps {
  /** Ruta a la que se debe redirigir tras completar los datos (ej: /inscripcion/1). */
  redir?: string | null;
  /** Callback opcional invocado al guardar exitosamente. */
  alCompletar?: (perfil: UsuarioPerfil) => void;
  /** Si permite omitir este paso temporalmente (por defecto true). */
  permitirOmitir?: boolean;
  /** Título principal de la sección. */
  titulo?: string;
  /** Subtítulo descriptivo. */
  descripcion?: string;
}

export default function SeccionCompletarPerfil({
  redir,
  alCompletar,
  permitirOmitir = true,
  titulo = "¡Casi listo! Completa tu perfil",
  descripcion = "Necesitamos estos datos personales para emitir tus inscripciones y registrarte como titular en las expediciones.",
}: SeccionCompletarPerfilProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormularioCompletar>(vacio);
  const [errores, setErrores] = useState<Partial<Record<keyof FormularioCompletar, string>>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(false);

  const destinoFinal = redir && redir.startsWith("/") ? redir : "/viajes";

  function actualizar<K extends keyof FormularioCompletar>(
    campo: K,
    valor: FormularioCompletar[K],
  ) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    if (errores[campo]) {
      setErrores((prev) => ({ ...prev, [campo]: undefined }));
    }
  }

  function validar(): boolean {
    const nuevosErrores: Partial<Record<keyof FormularioCompletar, string>> = {};

    if (!form.primerNombre.trim()) {
      nuevosErrores.primerNombre = "El primer nombre es obligatorio.";
    } else if (form.primerNombre.length > 50) {
      nuevosErrores.primerNombre = "Máximo 50 caracteres.";
    }

    if (form.segundoNombre.length > 50) {
      nuevosErrores.segundoNombre = "Máximo 50 caracteres.";
    }

    if (!form.primerApellido.trim()) {
      nuevosErrores.primerApellido = "El primer apellido es obligatorio.";
    } else if (form.primerApellido.length > 50) {
      nuevosErrores.primerApellido = "Máximo 50 caracteres.";
    }

    if (form.segundoApellido.length > 50) {
      nuevosErrores.segundoApellido = "Máximo 50 caracteres.";
    }

    if (!form.numeroIdentificacion.trim()) {
      nuevosErrores.numeroIdentificacion = "El número de identificación es obligatorio.";
    } else if (form.numeroIdentificacion.length > 50) {
      nuevosErrores.numeroIdentificacion = "Máximo 50 caracteres.";
    }

    if (!form.nacionalidad.trim()) {
      nuevosErrores.nacionalidad = "La nacionalidad es obligatoria.";
    } else if (form.nacionalidad.length > 50) {
      nuevosErrores.nacionalidad = "Máximo 50 caracteres.";
    }

    if (form.telefono.trim()) {
      const telLimpio = form.telefono.trim();
      if (!/^[+0-9 -]{8,20}$/.test(telLimpio)) {
        nuevosErrores.telefono = "Formato inválido (mínimo 8 dígitos, solo números, espacios o guiones).";
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }

  async function manejarEnvio(e: React.FormEvent) {
    e.preventDefault();
    setErrorGeneral(null);

    if (!validar()) {
      setErrorGeneral("Por favor completa los campos obligatorios marcados en rojo.");
      return;
    }

    setGuardando(true);

    const request: ActualizarPerfilRequest = {
      primerNombre: form.primerNombre.trim(),
      primerApellido: form.primerApellido.trim(),
      tipoIdentificacion: form.tipoIdentificacion,
      numeroIdentificacion: form.numeroIdentificacion.trim(),
      nacionalidad: form.nacionalidad.trim() || "Nicaragüense",
      sexo: form.sexo,
      ...(form.segundoNombre.trim() ? { segundoNombre: form.segundoNombre.trim() } : {}),
      ...(form.segundoApellido.trim() ? { segundoApellido: form.segundoApellido.trim() } : {}),
      ...(form.telefono.trim() ? { telefono: form.telefono.trim() } : {}),
    };

    try {
      const perfilActualizado = await userService.actualizarPerfil(request);

      const nombresCompletos = [
        form.primerNombre.trim(),
        form.segundoNombre.trim(),
        form.primerApellido.trim(),
        form.segundoApellido.trim(),
      ]
        .filter(Boolean)
        .join(" ");

      actualizarDatosSesion({
        nombreCompleto: perfilActualizado.nombreCompleto || nombresCompletos,
      });

      setExito(true);
      alCompletar?.(perfilActualizado);

      // Pequeña pausa visual antes de redirigir para confirmar éxito
      setTimeout(() => {
        router.push(destinoFinal);
      }, 700);
    } catch (err) {
      setErrorGeneral(
        err instanceof Error ? err.message : "Ocurrió un error al guardar tus datos de perfil.",
      );
      setGuardando(false);
    }
  }

  function omitir() {
    router.push(destinoFinal);
  }

  return (
    <div className="w-full max-w-xl space-y-lg rounded-lg border border-neutral-border bg-surface p-lg shadow-sm md:p-xl">
      <div className="space-y-xs text-center">
        <div className="mx-auto inline-flex rounded-md bg-primary p-sm text-white">
          <UserCheck size={28} aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-primary">{titulo}</h1>
        <p className="text-sm text-text-muted">{descripcion}</p>
      </div>

      {exito ? (
        <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-success" />
          <p className="text-base font-semibold text-text-main">
            ¡Perfil completado con éxito!
          </p>
          <p className="text-xs text-text-muted">Redirigiendo a tu destino...</p>
        </div>
      ) : (
        <form onSubmit={manejarEnvio} className="flex flex-col gap-md" noValidate>
          <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
            <Campo
              label="Primer Nombre"
              placeholder="Ej: Juan"
              required
              valor={form.primerNombre}
              error={errores.primerNombre}
              alCambiar={(v) => actualizar("primerNombre", v)}
            />
            <Campo
              label="Segundo Nombre"
              placeholder="Ej: Carlos (opcional)"
              valor={form.segundoNombre}
              error={errores.segundoNombre}
              alCambiar={(v) => actualizar("segundoNombre", v)}
            />
          </div>

          <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
            <Campo
              label="Primer Apellido"
              placeholder="Ej: Pérez"
              required
              valor={form.primerApellido}
              error={errores.primerApellido}
              alCambiar={(v) => actualizar("primerApellido", v)}
            />
            <Campo
              label="Segundo Apellido"
              placeholder="Ej: López (opcional)"
              valor={form.segundoApellido}
              error={errores.segundoApellido}
              alCambiar={(v) => actualizar("segundoApellido", v)}
            />
          </div>

          <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
            <Campo
              label="Tipo de Identificación"
              opciones={["cedula", "pasaporte"]}
              required
              valor={form.tipoIdentificacion}
              alCambiar={(v) => actualizar("tipoIdentificacion", v as "cedula" | "pasaporte")}
            />
            <Campo
              label="Número de Identificación"
              placeholder="Ej: 001-010190-0001A"
              required
              valor={form.numeroIdentificacion}
              error={errores.numeroIdentificacion}
              alCambiar={(v) => actualizar("numeroIdentificacion", v)}
            />
          </div>

          <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
            <Campo
              label="Nacionalidad"
              placeholder="Ej: Nicaragüense"
              required
              valor={form.nacionalidad}
              error={errores.nacionalidad}
              alCambiar={(v) => actualizar("nacionalidad", v)}
            />
            <Campo
              label="Sexo"
              opciones={["M", "F", "Otro"]}
              valor={form.sexo}
              alCambiar={(v) => actualizar("sexo", v as "M" | "F" | "Otro")}
            />
          </div>

          <Campo
            label="Teléfono de contacto"
            tipo="tel"
            placeholder="Ej: +505 8888 8888"
            hint="Número para coordinar detalles de tus viajes y reservas."
            valor={form.telefono}
            error={errores.telefono}
            alCambiar={(v) => actualizar("telefono", v)}
          />

          {errorGeneral && (
            <p
              className="rounded-sm bg-estado-rechazada-bg px-md py-sm text-sm text-estado-rechazada-text"
              role="alert"
            >
              {errorGeneral}
            </p>
          )}

          <div className="flex flex-col gap-xs pt-xs">
            <Boton type="submit" fullWidth loading={guardando}>
              Guardar y continuar
            </Boton>

            {permitirOmitir && (
              <button
                type="button"
                onClick={omitir}
                disabled={guardando}
                className="mt-1 text-center text-xs text-text-muted hover:text-primary transition-colors py-1"
              >
                Omitir por ahora y completar más tarde
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
