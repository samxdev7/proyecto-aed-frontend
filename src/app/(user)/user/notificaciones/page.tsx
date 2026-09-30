"use client";
import React, { useEffect, useState } from "react";
import { userService } from "@/services/user.service";
import { Notificacion } from "@/types/notificacion";
import {
  Bell,
  CheckCircle,
  Info,
  AlertCircle,
  BellOff
} from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";

export default function UserNotifications() {
  const [notifications, setNotifications] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reintentos, setReintentos] = useState(0);

  useEffect(() => {
    userService
      .getMyNotifications()
      .then((res) => {
        setNotifications(res.content);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [reintentos]);

  function reintentar() {
    setLoading(true);
    setError(false);
    setReintentos((n) => n + 1);
  }

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
        accion={{ etiqueta: "Reintentar", onClick: reintentar }}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-primary">Notificaciones</h2>
          <p className="text-text-muted">Mantente al día con las novedades y el estado de tus reservas.</p>
        </div>
        <button className="text-sm text-primary hover:underline font-medium">Marcar todas como leídas</button>
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icono={BellOff}
          titulo="Sin notificaciones pendientes"
          descripcion="Aquí aparecerán las novedades y el estado de tus reservas."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.idNotificacion}
              className={`p-4 rounded-md border border-neutral-border transition-all flex gap-4 ${
                notif.leida ? 'bg-surface opacity-70' : 'bg-surface ring-2 ring-primary shadow-sm'
              }`}
            >
              <div className={`p-2 rounded-lg h-fit ${
                notif.tipo === 'nuevo_viaje' ? 'bg-sand text-primary' :
                notif.tipo === 'pocos_cupos' ? 'bg-warning-bg text-warning-text' :
                'bg-surface-alt text-text-muted'
              }`}>
                {notif.tipo === 'nuevo_viaje' ? <Info size={20}/> :
                 notif.tipo === 'pocos_cupos' ? <AlertCircle size={20}/> :
                 <Bell size={20}/>}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-text-muted uppercase">{notif.tipo.replace('_', ' ')}</span>
                  <span className="text-xs text-text-muted">{new Date(notif.fecha).toLocaleDateString()}</span>
                </div>
                <p className={`text-sm ${notif.leida ? 'text-text-muted' : 'text-text-main font-medium'}`}>
                  {notif.mensaje}
                </p>
              </div>
              {!notif.leida && (
                <button className="p-2 text-primary hover:bg-sand rounded-lg transition-colors">
                  <CheckCircle size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
