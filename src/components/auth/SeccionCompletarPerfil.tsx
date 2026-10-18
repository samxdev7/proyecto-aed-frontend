"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserCheck } from "lucide-react";
import { userService } from "@/services/user.service";
import { ApiError } from "@/lib/api-client";
import { actualizarDatosSesion } from "@/lib/auth";
import type { ActualizarPerfilRequest, UsuarioPerfil } from "@/types/usuario";
import Boton from "@/components/ui/Boton";
import Campo from "@/components/ui/Campo";
import PerfilExito from "@/components/ui/PerfilExito";

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

const CLAVE_DRAFT = "cnm:perfil-pendiente";
const ESPERA_BASE_MS = 3000;
const ESPERA_MAX_MS = 30000;
/** Duración de la alerta de éxito antes de cerrarse sola. */
const DURACION_EXITO_MS = 2500;

type Vista = "prompt" | "form" | "exito";

/** El draft sobrevive un cierre de pestaña: el envío se reintentará al volver. */
function leerDraft(): Partial<FormularioCompletar> | null {
  if (typeof window === "undefined") return null;
  try {
    const crudo = window.localStorage.getItem(CLAVE_DRAFT);
    return crudo ? (JSON.parse(crudo) as Partial<FormularioCompletar>) : null;
  } catch {
    return null;
  }
}

function guardarDraft(request: ActualizarPerfilRequest) {
  try {
    window.localStorage.setItem(CLAVE_DRAFT, JSON.stringify(request));
  } catch {
    /* sin localStorage: el retry en memoria sigue funcionando */
  }
}

/** Solo errores de red o servidor caído: la validación del servidor no se reintenta. */
function esErrorReintentable(err: unknown): boolean {
  if (err instanceof ApiError) return err.status === 0 || err.status >= 500;
  return err instanceof TypeError;
}

/**
 * Envío con reintento silencioso: si la red falla, espera con backoff
 * exponencial (3s → 30s) y vuelve a intentar hasta tener éxito. El usuario
 * nunca ve estos errores.
 */
async function enviarSilenciosamente(
  request: ActualizarPerfilRequest,
  alExito: (perfil: UsuarioPerfil) => void,
): Promise<void> {
  let intento = 0;
  for (;;) {
    try {
      const perfil = await userService.actualizarPerfil(request);
      try {
        window.localStorage.removeItem(CLAVE_DRAFT);
      } catch {
        /* noop */
      }
      alExito(perfil);
      return;
    } catch (err) {
      if (!esErrorReintentable(err)) return;
      const espera = Math.min(ESPERA_BASE_MS * 2 ** intento, ESPERA_MAX_MS);
      intento += 1;
      await new Promise((resolver) => setTimeout(resolver, espera));
    }
  }
}

interface SeccionCompletarPerfilProps {
  /** Ruta a la que se redirige tras completar/omitir (si no hay alCerrar). */
  redir?: string | null;
  /** Callback opcional invocado al guardar exitosamente. */
  alCompletar?: (perfil: UsuarioPerfil) => void;
  /** Al cerrar el popup tras el éxito (sin redirect de ruta). */
  alCerrarExito?: () => void;
  /** Al omitir: solo cierra el popup y se queda en la ruta actual. */
  alCerrar?: () => void;
  /** Si permite omitir este paso temporalmente (por defecto true). */
  permitirOmitir?: boolean;
  /** Muestra primero la tarjeta de 2 botones (Completar / Omitir). */
  modoPrompt?: boolean;
  /** Título principal. */
  titulo?: string;
  /** Subtítulo descriptivo. */
  descripcion?: string;
  /** Texto del botón omitir dentro del form (varía según el contexto). */
  textoOmitir?: string;
}

export default function SeccionCompletarPerfil({
  redir,
  alCompletar,
  alCerrarExito,
  alCerrar,
  permitirOmitir = true,
  modoPrompt = true,
  titulo = "¡Casi listo! Completa tu perfil",
  descripcion = "Necesitamos estos datos personales para emitir tus inscripciones y registrarte como titular en las expediciones.",
  textoOmitir = "Omitir por ahora y ver el catálogo",
}: SeccionCompletarPerfilProps) {
  const router = useRouter();
  const [vista, setVista] = useState<Vista>(modoPrompt ? "prompt" : "form");
  const [form, setForm] = useState<FormularioCompletar>(vacio);
  const [errores, setErrores] = useState<Partial<Record<keyof FormularioCompletar, string>>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const destinoFinal = redir && redir.startsWith("/") ? redir : "/viajes";

  // Precargar lo que el usuario ya escribió (envío fallido por red).
  useEffect(() => {
    const draft = leerDraft();
    if (draft) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm((prev) => ({ ...prev, ...draft }));
    }
  }, []);

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

  function finalizar() {
    if (alCerrarExito) {
      alCerrarExito();
      return;
    }
    if (alCerrar) {
      alCerrar();
      return;
    }
    router.push(destinoFinal);
  }

  async function manejarEnvio(e: React.FormEvent) {
    e.preventDefault();
    setErrorGeneral(null);

    if (!validar()) {
      setErrorGeneral("Por favor completa los campos obligatorios marcados en rojo.");
      return;
    }

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

    const nombresCompletos = [
      form.primerNombre.trim(),
      form.segundoNombre.trim(),
      form.primerApellido.trim(),
      form.segundoApellido.trim(),
    ]
      .filter(Boolean)
      .join(" ");

    setGuardando(true);

    // Éxito optimista: mostramos la alerta de inmediato y enviamos por debajo,
    // reintentando en silencio si la red falla.
    guardarDraft(request);
    setVista("exito");
    setGuardando(false);

    void enviarSilenciosamente(request, (perfil) => {
      actualizarDatosSesion({
        nombreCompleto: perfil.nombreCompleto || nombresCompletos,
      });
      alCompletar?.(perfil);
    });

    // La alerta se cierra sola y el usuario ya puede reservar.
    setTimeout(finalizar, DURACION_EXITO_MS);
  }

  function omitir() {
    finalizar();
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

      {vista === "prompt" ? (
        <div className="animacion-fade-up flex flex-col gap-sm pt-xs">
          <Boton type="button" fullWidth onClick={() => setVista("form")}>
            Completar
          </Boton>
          {permitirOmitir ? (
            <button
              type="button"
              onClick={omitir}
              className="py-1 text-center text-xs text-text-muted transition-colors hover:text-primary"
            >
              Omitir por ahora
            </button>
          ) : null}
        </div>
      ) : vista === "exito" ? (
        <div className="animacion-fade-up">
          <PerfilExito />
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

          {errorGeneral ? (
            <p
              className="rounded-sm bg-estado-rechazada-bg px-md py-sm text-sm text-estado-rechazada-text"
              role="alert"
            >
              {errorGeneral}
            </p>
          ) : null}

          <div className="flex flex-col gap-xs pt-xs">
            <Boton type="submit" fullWidth loading={guardando}>
              Guardar y continuar
            </Boton>
            {permitirOmitir ? (
              <button
                type="button"
                onClick={omitir}
                disabled={guardando}
                className="py-1 text-center text-xs text-text-muted transition-colors hover:text-primary"
              >
                {textoOmitir}
              </button>
            ) : null}
          </div>
        </form>
      )}
    </div>
  );
}
