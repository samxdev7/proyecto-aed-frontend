"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { CheckCircle, Flame, Mountain, XCircle } from "lucide-react";
import { userService } from "@/services/user.service";
import type { Notificacion } from "@/types/notificacion";
import { formatoFechaCorta } from "@/lib/format";

interface NotificacionesDrawerProps {
  abierta: boolean;
  onCerrar: () => void;
  /** Avisa al Header para refrescar el badge de no leídas. */
  onCambio?: () => void;
}

const iconoPorTipo: Record<string, LucideIcon> = {
  nuevo_viaje: Mountain,
  pocos_cupos: Flame,
  reserva_aprobada: CheckCircle,
  reserva_rechazada: XCircle,
};

const tituloPorTipo: Record<string, string> = {
  nuevo_viaje: "Nuevo viaje",
  pocos_cupos: "Pocos cupos",
  reserva_aprobada: "Reserva aprobada",
  reserva_rechazada: "Reserva rechazada",
};

export default function NotificacionesDrawer({
  abierta,
  onCerrar,
  onCambio,
}: NotificacionesDrawerProps) {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  function cargar() {
    setLoading(true);
    userService
      .getMyNotifications(0, 20)
      .then((pagina) => {
        setNotificaciones(pagina.content);
        setError(false);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }

  useEffect(() => {
    if (!abierta) return;
    let activo = true;
    userService
      .getMyNotifications(0, 20)
      .then((pagina) => {
        if (!activo) return;
        setNotificaciones(pagina.content);
        setError(false);
        setLoading(false);
      })
      .catch(() => {
        if (!activo) return;
        setError(true);
        setLoading(false);
      });
    return () => {
      activo = false;
    };
  }, [abierta]);

  function marcarLeida(notificacion: Notificacion) {
    if (notificacion.leida) return;
    userService
      .marcarNotificacionLeida(notificacion.idNotificacion)
      .then(() => {
        cargar();
        onCambio?.();
      })
      .catch(() => {
        /* si falla, la lista queda como estaba */
      });
  }

  function leerTodas() {
    userService
      .marcarTodasLeidas(notificaciones)
      .then(() => {
        cargar();
        onCambio?.();
      })
      .catch(() => {
        /* si falla, la lista queda como estaba */
      });
  }

  const restantes = notificaciones.filter(
    (notificacion) => !notificacion.leida,
  ).length;

  return (
    <div
      className={`fixed inset-0 z-[65] transition ${
        abierta ? "visible" : "invisible"
      }`}
      aria-hidden={!abierta}
    >
      <div
        className="absolute inset-0 bg-navy/50 backdrop-blur-sm"
        onClick={onCerrar}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Notificaciones"
        className={`absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-surface shadow-2xl transition-transform duration-300 ${
          abierta ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-md border-b border-ink/10 px-md py-sm">
          <div>
            <p className="text-lg font-bold text-navy">Notificaciones</p>
            <p className="text-xs text-ink/50" suppressHydrationWarning>
              {restantes > 0 ? `${restantes} sin leer` : "Todo leído"}
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar notificaciones"
            className="flex h-8 w-8 items-center justify-center rounded text-ink/50 transition hover:bg-ink/5 hover:text-ink"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex-1 px-md py-md text-sm text-ink/50">
            Cargando notificaciones…
          </div>
        ) : error ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-sm px-md text-center text-sm text-ink/50">
            No pudimos cargar tus notificaciones.
            <button
              type="button"
              onClick={cargar}
              className="rounded-md bg-navy px-md py-xs text-sm font-medium text-sand"
            >
              Reintentar
            </button>
          </div>
        ) : notificaciones.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-md text-center text-sm text-ink/50">
            No tienes notificaciones por ahora. Aquí verás nuevos viajes y el
            estado de tus reservas.
          </div>
        ) : (
          <ul className="flex-1 space-y-sm overflow-y-auto px-md py-sm">
            {notificaciones.map((notificacion) => {
              const Icono = iconoPorTipo[notificacion.tipo] ?? Mountain;
              return (
                <li key={notificacion.idNotificacion}>
                  <button
                    type="button"
                    onClick={() => marcarLeida(notificacion)}
                    className={`w-full rounded-md bg-sand/60 px-md py-sm text-left ring-1 ring-ink/5 transition hover:bg-sand ${
                      notificacion.leida ? "opacity-70" : ""
                    }`}
                  >
                    <p className="flex items-center gap-xs text-sm font-semibold text-navy">
                      {!notificacion.leida ? (
                        <span
                          className="h-2 w-2 shrink-0 rounded-full bg-clay"
                          aria-label="Sin leer"
                        />
                      ) : null}
                      <Icono size={16} className="shrink-0 text-ink/50" aria-hidden="true" />
                      <span className="flex-1">
                        {tituloPorTipo[notificacion.tipo] ?? notificacion.tipo}
                      </span>
                      <span className="text-xs font-normal text-ink/50">
                        {formatoFechaCorta(notificacion.fechaEnvio)}
                      </span>
                    </p>
                    <p className="mt-xs text-xs leading-relaxed text-ink/65">
                      {notificacion.mensaje}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="border-t border-ink/10 px-md py-sm">
          <button
            type="button"
            onClick={leerTodas}
            disabled={restantes === 0}
            className={`w-full rounded-md px-md py-sm text-sm font-medium transition ${
              restantes === 0
                ? "cursor-not-allowed bg-ink/5 text-ink/35"
                : "bg-navy text-sand hover:bg-steel"
            }`}
          >
            Marcar todas como leídas
          </button>
        </div>
      </aside>
    </div>
  );
}
