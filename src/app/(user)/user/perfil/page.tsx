"use client";

import { useEffect, useState } from "react";
import { Bell, Mail, MapPin, Phone, User } from "lucide-react";
import { userService } from "@/services/user.service";
import type { UsuarioPerfil } from "@/types/usuario";
import Boton from "@/components/ui/Boton";
import Campo from "@/components/ui/Campo";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";

const clasesSelect =
  "w-full rounded-sm border border-neutral-border bg-surface px-4 py-3 text-sm text-text-main outline-none transition focus:border-primary focus:ring-1 focus:ring-primary";

interface FormularioPerfil {
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  telefono: string;
  sexo: string;
  nacionalidad: string;
  tipoIdentificacion: string;
  numeroIdentificacion: string;
}

function aFormulario(perfil: UsuarioPerfil): FormularioPerfil {
  return {
    primerNombre: perfil.primerNombre,
    segundoNombre: perfil.segundoNombre ?? "",
    primerApellido: perfil.primerApellido,
    segundoApellido: perfil.segundoApellido ?? "",
    telefono: perfil.telefono,
    sexo: perfil.sexo,
    nacionalidad: perfil.nacionalidad,
    tipoIdentificacion: perfil.tipoIdentificacion,
    numeroIdentificacion: perfil.numeroIdentificacion,
  };
}

export default function UserProfile() {
  const [perfil, setPerfil] = useState<UsuarioPerfil | null>(null);
  const [error, setError] = useState(false);
  const [reintentos, setReintentos] = useState(0);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState<FormularioPerfil | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null);
  const [mensajeNotis, setMensajeNotis] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    userService
      .getMyProfile()
      .then((data) => {
        if (activo) {
          setPerfil(data);
          setError(false);
        }
      })
      .catch(() => {
        if (activo) setError(true);
      });
    return () => {
      activo = false;
    };
  }, [reintentos]);

  function reintentar() {
    setError(false);
    setReintentos((n) => n + 1);
  }

  function actualizar<K extends keyof FormularioPerfil>(
    campo: K,
    valor: FormularioPerfil[K],
  ) {
    setForm((previo) => (previo ? { ...previo, [campo]: valor } : previo));
  }

  function comenzarEdicion() {
    if (!perfil) return;
    setForm(aFormulario(perfil));
    setErrorGuardado(null);
    setEditando(true);
  }

  function guardarCambios(evento: React.FormEvent) {
    evento.preventDefault();
    if (!perfil || !form) return;
    if (
      !form.primerNombre.trim() ||
      !form.primerApellido.trim() ||
      !form.numeroIdentificacion.trim()
    ) {
      setErrorGuardado("Nombre, apellido e identificación son obligatorios.");
      return;
    }
    setGuardando(true);
    setErrorGuardado(null);
    const request = {
      primerNombre: form.primerNombre.trim(),
      primerApellido: form.primerApellido.trim(),
      telefono: form.telefono.trim(),
      sexo: form.sexo,
      nacionalidad: form.nacionalidad.trim(),
      tipoIdentificacion: form.tipoIdentificacion,
      numeroIdentificacion: form.numeroIdentificacion.trim(),
      // Opcionales solo viajan si el usuario los llenó.
      ...(form.segundoNombre.trim()
        ? { segundoNombre: form.segundoNombre.trim() }
        : {}),
      ...(form.segundoApellido.trim()
        ? { segundoApellido: form.segundoApellido.trim() }
        : {}),
    };
    userService
      .actualizarPerfil(request)
      .then((actualizado) => {
        setPerfil(actualizado);
        setEditando(false);
        setGuardando(false);
      })
      .catch((excepcion) => {
        setErrorGuardado(
          excepcion instanceof Error
            ? excepcion.message
            : "No pudimos guardar tus datos.",
        );
        setGuardando(false);
      });
  }

  function alternarNotificaciones() {
    if (!perfil) return;
    const anterior = perfil;
    const nuevoValor = !perfil.notificacionesHabilitadas;
    // Optimista: refleja el cambio y revierte si el backend falla.
    setPerfil({ ...perfil, notificacionesHabilitadas: nuevoValor });
    setMensajeNotis(null);
    userService
      .actualizarNotificaciones({ notificacionesHabilitadas: nuevoValor })
      .then((actualizado) => setPerfil(actualizado))
      .catch(() => {
        setPerfil(anterior);
        setMensajeNotis("No pudimos guardar el cambio. Inténtalo de nuevo.");
      });
  }

  if (error) {
    return (
      <EmptyState
        titulo="No pudimos cargar tu perfil"
        descripcion="Ocurrió un error al obtener tus datos. Inténtalo de nuevo."
        accion={{ etiqueta: "Reintentar", onClick: reintentar }}
      />
    );
  }

  if (!perfil) {
    return (
      <div className="mx-auto max-w-4xl space-y-lg">
        <Skeleton className="h-40 w-full rounded-md" />
        <div className="grid grid-cols-1 gap-md md:grid-cols-2">
          <Skeleton className="h-64 w-full rounded-md" />
          <Skeleton className="h-64 w-full rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-lg">
      <div className="flex flex-col items-center gap-lg rounded-md border border-neutral-border bg-surface p-lg shadow-sm md:flex-row">
        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-primary text-4xl font-bold text-white">
          {perfil.primerNombre[0]?.toUpperCase() ?? "·"}
        </div>
        <div className="space-y-xs text-center md:text-left">
          <h2 className="text-3xl font-bold text-primary">
            {perfil.nombreCompleto}
          </h2>
          <p className="text-text-muted">{perfil.correo}</p>
          <div className="flex justify-center gap-xs md:justify-start">
            <span className="rounded-sm bg-surface-alt px-sm py-xs text-xs font-medium text-text-muted">
              Miembro desde{" "}
              {new Date(perfil.fechaRegistro).getFullYear()}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-md md:grid-cols-2">
        <div className="space-y-md rounded-md border border-neutral-border bg-surface p-md shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-border pb-sm">
            <h3 className="text-lg font-bold text-primary">
              Información Personal
            </h3>
            {editando ? (
              <button
                type="button"
                onClick={() => setEditando(false)}
                className="text-sm text-text-muted hover:underline"
              >
                Cancelar
              </button>
            ) : (
              <button
                type="button"
                onClick={comenzarEdicion}
                className="text-sm text-primary hover:underline"
              >
                Editar
              </button>
            )}
          </div>

          {editando && form ? (
            <form className="space-y-md" onSubmit={guardarCambios}>
              <div className="grid gap-md sm:grid-cols-2">
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
                <Campo
                  label="Teléfono"
                  tipo="tel"
                  placeholder="+505 0000-0000"
                  valor={form.telefono}
                  alCambiar={(valor) => actualizar("telefono", valor)}
                />
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="perfil-sexo"
                    className="text-xs font-semibold text-text-muted"
                  >
                    Sexo
                  </label>
                  <select
                    id="perfil-sexo"
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
                <Campo
                  label="Nacionalidad"
                  required
                  valor={form.nacionalidad}
                  alCambiar={(valor) => actualizar("nacionalidad", valor)}
                />
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="perfil-tipo-id"
                    className="text-xs font-semibold text-text-muted"
                  >
                    Tipo de identificación{" "}
                    <span className="text-error">*</span>
                  </label>
                  <select
                    id="perfil-tipo-id"
                    value={form.tipoIdentificacion}
                    onChange={(evento) =>
                      actualizar("tipoIdentificacion", evento.target.value)
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
                  alCambiar={(valor) =>
                    actualizar("numeroIdentificacion", valor)
                  }
                />
              </div>

              {errorGuardado ? (
                <p
                  className="rounded-sm bg-estado-rechazada-bg px-md py-sm text-sm text-estado-rechazada-text"
                  role="alert"
                >
                  {errorGuardado}
                </p>
              ) : null}

              <Boton type="submit" loading={guardando} fullWidth>
                Guardar cambios
              </Boton>
            </form>
          ) : (
            <div className="space-y-md">
              <DetailItem
                icono={<Mail size={18} />}
                label="Correo Electrónico"
                value={perfil.correo}
              />
              <DetailItem
                icono={<Phone size={18} />}
                label="Teléfono"
                value={perfil.telefono || "—"}
              />
              <DetailItem
                icono={<MapPin size={18} />}
                label="Nacionalidad"
                value={perfil.nacionalidad}
              />
              <DetailItem
                icono={<User size={18} />}
                label="Identificación"
                value={`${perfil.tipoIdentificacion}: ${perfil.numeroIdentificacion}`}
              />
            </div>
          )}
        </div>

        <div className="space-y-md rounded-md border border-neutral-border bg-surface p-md shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-border pb-sm">
            <h3 className="text-lg font-bold text-primary">Preferencias</h3>
          </div>
          <div className="flex items-center justify-between rounded-md bg-surface-alt p-sm">
            <div className="flex items-center gap-sm">
              <div className="rounded-md bg-surface p-xs shadow-sm">
                <Bell size={18} className="text-primary" />
              </div>
              <span className="text-sm font-medium">
                Notificaciones de viajes y reservas
              </span>
            </div>
            <input
              type="checkbox"
              aria-label="Notificaciones"
              checked={perfil.notificacionesHabilitadas}
              onChange={alternarNotificaciones}
              className="h-4 w-4 accent-primary"
            />
          </div>
          <p className="text-xs text-text-muted" role="status">
            {mensajeNotis ??
              (perfil.notificacionesHabilitadas
                ? "Recibirás avisos de nuevos viajes y del estado de tus reservas."
                : "No recibirás notificaciones.")}
          </p>
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  icono,
  label,
  value,
}: {
  icono: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-md">
      <div className="rounded-md bg-sand p-xs text-primary">{icono}</div>
      <div>
        <p className="text-xs font-bold uppercase text-text-muted">{label}</p>
        <p className="text-sm font-medium break-words">{value}</p>
      </div>
    </div>
  );
}
