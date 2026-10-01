"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, ChevronRight, Mail } from "lucide-react";
import { userService } from "@/services/user.service";
import type { UsuarioPerfil } from "@/types/usuario";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";

export default function UserSettings() {
  const [profile, setProfile] = useState<UsuarioPerfil | null>(null);
  const [error, setError] = useState(false);
  const [reintentos, setReintentos] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    userService
      .getMyProfile()
      .then((data) => {
        if (activo) {
          setProfile(data);
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

  function alternarNotificaciones() {
    if (!profile || guardando) return;
    const anterior = profile;
    const nuevoValor = !profile.notificacionesHabilitadas;
    // Optimista: cambia al instante y revierte si el backend falla.
    setProfile({ ...profile, notificacionesHabilitadas: nuevoValor });
    setGuardando(true);
    setMensaje(null);
    userService
      .actualizarNotificaciones({ notificacionesHabilitadas: nuevoValor })
      .then((actualizado) => {
        setProfile(actualizado);
        setGuardando(false);
      })
      .catch(() => {
        setProfile(anterior);
        setMensaje("No pudimos guardar el cambio. Inténtalo de nuevo.");
        setGuardando(false);
      });
  }

  if (error) {
    return (
      <EmptyState
        titulo="No pudimos cargar tu configuración"
        descripcion="Ocurrió un error al obtener tus preferencias. Inténtalo de nuevo."
        accion={{ etiqueta: "Reintentar", onClick: reintentar }}
      />
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-4xl space-y-lg">
        <Skeleton className="h-16 w-64 rounded-md" />
        <Skeleton className="h-40 w-full rounded-md" />
        <Skeleton className="h-40 w-full rounded-md" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-lg">
      <div>
        <h2 className="text-3xl font-bold text-primary">Configuración</h2>
        <p className="mt-xs text-text-muted">
          Preferencias de tu cuenta en Club de Montañismo
        </p>
      </div>

      <div className="space-y-md rounded-md border border-neutral-border bg-surface p-md shadow-sm">
        <div className="border-b border-neutral-border pb-sm">
          <h3 className="text-lg font-bold text-primary">Notificaciones</h3>
        </div>

        <label className="flex items-center justify-between gap-md rounded-md bg-surface-alt p-sm">
          <span className="flex items-center gap-sm">
            <span className="rounded-md bg-surface p-xs shadow-sm">
              <Bell size={18} className="text-primary" />
            </span>
            <span>
              <span className="block text-sm font-medium">
                Avisos de viajes y reservas
              </span>
              <span className="block text-xs text-text-muted">
                Nuevas salidas y cambios en el estado de tus reservas.
              </span>
            </span>
          </span>
          <input
            type="checkbox"
            aria-label="Notificaciones"
            checked={profile.notificacionesHabilitadas}
            disabled={guardando}
            onChange={alternarNotificaciones}
            className="h-5 w-5 shrink-0 accent-primary"
          />
        </label>

        <p className="text-xs text-text-muted" role="status">
          {guardando
            ? "Guardando cambios…"
            : (mensaje ??
              (profile.notificacionesHabilitadas
                ? "Preferencia guardada: recibirás notificaciones."
                : "Preferencia guardada: notificaciones desactivadas."))}
        </p>
      </div>

      <div className="space-y-md rounded-md border border-neutral-border bg-surface p-md shadow-sm">
        <div className="border-b border-neutral-border pb-sm">
          <h3 className="text-lg font-bold text-primary">Cuenta</h3>
        </div>

        <div className="flex items-center gap-md rounded-md bg-surface-alt p-sm">
          <span className="rounded-md bg-surface p-xs shadow-sm">
            <Mail size={18} className="text-primary" />
          </span>
          <span>
            <span className="block text-xs font-bold uppercase text-text-muted">
              Correo electrónico
            </span>
            <span className="block text-sm font-medium">{profile.correo}</span>
          </span>
        </div>

        <Link
          href="/user/perfil"
          className="flex items-center justify-between rounded-md border border-neutral-border p-md text-sm font-medium text-primary transition hover:bg-surface-alt"
        >
          Editar datos personales y preferencias de contacto
          <ChevronRight size={18} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
