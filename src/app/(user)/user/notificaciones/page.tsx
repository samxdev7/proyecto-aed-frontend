"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { userService } from "@/services/user.service";
import { Notificacion } from "@/types/notificacion";
import { EVENTO_NOTIFICACIONES } from "@/lib/demo";
import {
  Bell,
  CheckCircle,
  AlertCircle,
  BellOff,
  CheckCheck,
  Calendar,
  Compass,
} from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";

type FiltroNotificacion = "todas" | "no_leidas";

export default function UserNotifications() {
  const [notifications, setNotifications] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filtro, setFiltro] = useState<FiltroNotificacion>("todas");
  const [reintentos, setReintentos] = useState(0);

  const refrescar = useCallback(() => {
    setReintentos((n) => n + 1);
  }, []);

  useEffect(() => {
    let activo = true;
    userService
      .getMyNotifications(0, 50)
      .then((res) => {
        if (activo) {
          setNotifications(res.content);
          setLoading(false);
          setError(false);
        }
      })
      .catch(() => {
        if (activo) {
          setError(true);
          setLoading(false);
        }
      });

    const alCambiarNotificaciones = () => {
      userService.getMyNotifications(0, 50).then((res) => {
        if (activo) setNotifications(res.content);
      });
    };

    window.addEventListener(EVENTO_NOTIFICACIONES, alCambiarNotificaciones);
    return () => {
      activo = false;
      window.removeEventListener(EVENTO_NOTIFICACIONES, alCambiarNotificaciones);
    };
  }, [reintentos]);

  const handleMarcarLeida = async (idNotificacion: number) => {
    await userService.marcarNotificacionLeida(idNotificacion);
    refrescar();
  };

  const handleMarcarTodasLeidas = async () => {
    await userService.marcarTodasNotificacionesLeidas();
    refrescar();
  };

  const sinLeerCount = notifications.filter((n) => !n.leida).length;
  const notificacionesFiltradas =
    filtro === "no_leidas" ? notifications.filter((n) => !n.leida) : notifications;

  const renderIcono = (tipo: string) => {
    if (tipo === "nuevo" || tipo === "nuevo_viaje") {
      return <Compass size={18} className="text-secondary" />;
    }
    if (tipo === "pocos-cupos" || tipo === "pocos_cupos") {
      return <AlertCircle size={18} className="text-amber-600" />;
    }
    if (tipo === "aprobada") {
      return <CheckCircle size={18} className="text-success" />;
    }
    if (tipo === "recordatorio") {
      return <Calendar size={18} className="text-primary" />;
    }
    return <Bell size={18} className="text-primary" />;
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-3">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        titulo="No pudimos cargar tus notificaciones"
        descripcion="Ocurrió un error al obtener las novedades. Inténtalo de nuevo."
        accion={{ etiqueta: "Reintentar", onClick: refrescar }}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Encabezado y acción masiva */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary">Notificaciones</h2>
          <p className="text-sm text-text-muted">
            Mantente al día con las novedades, cupos y estado de tus expediciones.
          </p>
        </div>
        {sinLeerCount > 0 && (
          <button
            onClick={handleMarcarTodasLeidas}
            className="text-xs text-primary hover:text-primary-hover font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-sand transition-colors"
          >
            <CheckCheck size={16} />
            Marcar todas como leídas
          </button>
        )}
      </div>

      {/* Pestañas de filtrado */}
      <div className="flex items-center gap-2 border-b border-neutral-border pb-2">
        <button
          onClick={() => setFiltro("todas")}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            filtro === "todas"
              ? "bg-primary text-white"
              : "text-text-muted hover:text-text-primary hover:bg-surface-alt"
          }`}
        >
          Todas
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              filtro === "todas" ? "bg-white/20 text-white" : "bg-neutral-border text-text-muted"
            }`}
          >
            {notifications.length}
          </span>
        </button>

        <button
          onClick={() => setFiltro("no_leidas")}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            filtro === "no_leidas"
              ? "bg-primary text-white"
              : "text-text-muted hover:text-text-primary hover:bg-surface-alt"
          }`}
        >
          No leídas
          {sinLeerCount > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                filtro === "no_leidas" ? "bg-white text-primary" : "bg-primary text-white"
              }`}
            >
              {sinLeerCount}
            </span>
          )}
        </button>
      </div>

      {/* Listado de notificaciones */}
      {notificacionesFiltradas.length === 0 ? (
        <EmptyState
          icono={BellOff}
          titulo={
            filtro === "no_leidas"
              ? "¡Estás al día! No tienes notificaciones sin leer"
              : "Sin notificaciones pendientes"
          }
          descripcion="Aquí aparecerán las confirmaciones de inscripción y alertas de cupos disponibles."
          accion={
            filtro === "no_leidas"
              ? { etiqueta: "Ver todas", onClick: () => setFiltro("todas") }
              : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {notificacionesFiltradas.map((notif) => {
            const esNuevo = notif.tipo === "nuevo" || notif.tipo === "nuevo_viaje";
            const esReserva = notif.tipo === "aprobada" || notif.tipo === "rechazada";

            return (
              <div
                key={notif.idNotificacion}
                className={`p-4 rounded-lg border transition-all flex items-start gap-4 ${
                  notif.leida
                    ? "bg-surface border-neutral-border opacity-75"
                    : "bg-surface border-primary/40 shadow-sm ring-1 ring-primary/20"
                }`}
              >
                <div className="p-2.5 rounded-lg bg-surface-alt shrink-0 mt-0.5">
                  {renderIcono(notif.tipo)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                      {notif.tipo.replace(/[-_]/g, " ")}
                    </span>
                    <span className="text-[11px] text-text-muted shrink-0">
                      {new Date(notif.fecha).toLocaleDateString()}
                    </span>
                  </div>

                  <p
                    className={`text-sm leading-relaxed ${
                      notif.leida ? "text-text-muted" : "text-text-primary font-medium"
                    }`}
                  >
                    {notif.mensaje}
                  </p>

                  <div className="flex items-center gap-3 mt-2 text-xs">
                    {esNuevo && (
                      <Link
                        href="/viajes"
                        className="text-primary hover:underline font-semibold"
                      >
                        Ver catálogo de viajes →
                      </Link>
                    )}
                    {esReserva && (
                      <Link
                        href="/user/reservas"
                        className="text-primary hover:underline font-semibold"
                      >
                        Ir a mis reservas →
                      </Link>
                    )}
                  </div>
                </div>

                {!notif.leida && (
                  <button
                    onClick={() => handleMarcarLeida(notif.idNotificacion)}
                    className="p-1.5 text-text-muted hover:text-success hover:bg-success/10 rounded-md transition-colors shrink-0"
                    title="Marcar como leída"
                  >
                    <CheckCircle size={18} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
