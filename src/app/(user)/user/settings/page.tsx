"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, ChevronRight, Mail, ShieldCheck } from "lucide-react";
import { userService } from "@/services/user.service";
import { UsuarioPerfil } from "@/types/usuario";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";

export default function UserSettings() {
  const [profile, setProfile] = useState<UsuarioPerfil | null>(null);
  const [error, setError] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    userService
      .getMyProfile()
      .then(setProfile)
      .catch(() => setError(true));
  }, []);

  function alternarNotificaciones() {
    if (!profile || guardando) return;
    setGuardando(true);
    userService
      .actualizarNotificaciones({
        notificacionesHabilitadas: !profile.notificacionesHabilitadas,
      })
      .then((actualizado) => setProfile(actualizado))
      .finally(() => setGuardando(false));
  }

  if (error) {
    return (
      <EmptyState
        titulo="No pudimos cargar tu configuración"
        descripcion="Ocurrió un error al obtener tus preferencias. Inténtalo de nuevo."
        accion={{ etiqueta: "Reintentar", onClick: () => setError(false) }}
      />
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <Skeleton className="h-16 w-64 rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-primary">Configuración</h2>
        <p className="mt-1 text-text-muted">
          Preferencias de tu cuenta en Club de Montañismo
        </p>
      </div>

      <div className="bg-surface p-6 rounded-lg shadow-sm border border-neutral-border space-y-4">
        <div className="border-b border-neutral-border pb-2">
          <h3 className="text-lg font-bold text-primary">Notificaciones</h3>
        </div>

        <label className="flex items-center justify-between gap-4 rounded-lg bg-surface-alt p-4">
          <span className="flex items-center gap-3">
            <span className="p-2 bg-surface rounded-md shadow-sm">
              <Bell size={18} className="text-primary" />
            </span>
            <span>
              <span className="block text-sm font-medium">
                Notificaciones Push
              </span>
              <span className="block text-xs text-text-muted">
                Avisos de nuevas salidas y cambios en el estado de tus reservas.
              </span>
            </span>
          </span>
          <input
            type="checkbox"
            aria-label="Notificaciones Push"
            checked={profile.notificacionesHabilitadas}
            disabled={guardando}
            onChange={alternarNotificaciones}
            className="h-5 w-5 shrink-0 accent-primary"
          />
        </label>

        <p className="text-xs text-text-muted" role="status">
          {guardando ? "Guardando cambios…" : "Preferencia guardada."}
        </p>
      </div>

      <div className="bg-surface p-6 rounded-lg shadow-sm border border-neutral-border space-y-4">
        <div className="border-b border-neutral-border pb-2">
          <h3 className="text-lg font-bold text-primary">Cuenta</h3>
        </div>

        <div className="flex items-center gap-4 p-3 bg-surface-alt rounded-lg">
          <span className="p-2 bg-surface rounded-md shadow-sm">
            <Mail size={18} className="text-primary" />
          </span>
          <span>
            <span className="block text-xs font-bold text-text-muted uppercase">
              Correo electrónico
            </span>
            <span className="block text-sm font-medium">{profile.correo}</span>
          </span>
        </div>

        <div className="flex items-center gap-4 p-3 bg-surface-alt rounded-lg">
          <span className="p-2 bg-surface rounded-md shadow-sm">
            <ShieldCheck size={18} className="text-primary" />
          </span>
          <span>
            <span className="block text-xs font-bold text-text-muted uppercase">
              Rol
            </span>
            <span className="block text-sm font-medium capitalize">
              {profile.rol}
            </span>
          </span>
        </div>

        <Link
          href="/user/perfil"
          className="flex items-center justify-between rounded-lg border border-neutral-border p-4 text-sm font-medium text-primary transition hover:bg-surface-alt"
        >
          Editar datos personales y preferencias de contacto
          <ChevronRight size={18} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
