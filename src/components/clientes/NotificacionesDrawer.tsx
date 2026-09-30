"use client";

import { useEffect, useState } from "react";
import {
  EVENTO_NOTIFICACIONES,
  cambiarNotificacionesActivas,
  marcarNotificacionLeida,
  marcarTodasNotificacionesLeidas,
  notificacionesActivas,
  obtenerNotificacionesDemo,
  type NotificacionDemo,
} from "@/lib/demo";

interface NotificacionesDrawerProps {
  abierta: boolean;
  onCerrar: () => void;
}

const estiloBordePorTipo: Record<NotificacionDemo["tipo"], string> = {
  aprobada: "border-l-clay",
  revision: "border-l-ochre",
  solicitud: "border-l-ochre",
  "pocos-cupos": "border-l-clay",
  nuevo: "border-l-steel",
  recordatorio: "border-l-sand",
  rechazada: "border-l-navy",
};

export default function NotificacionesDrawer({
  abierta,
  onCerrar,
}: NotificacionesDrawerProps) {
  const [notificaciones, setNotificaciones] = useState<NotificacionDemo[]>(() =>
    obtenerNotificacionesDemo(),
  );
  const [activas, setActivas] = useState(() => notificacionesActivas());

  useEffect(() => {
    const alCambiar = () => {
      setNotificaciones(obtenerNotificacionesDemo());
      setActivas(notificacionesActivas());
    };
    window.addEventListener(EVENTO_NOTIFICACIONES, alCambiar);
    return () => window.removeEventListener(EVENTO_NOTIFICACIONES, alCambiar);
  }, []);

  const alSeleccionar = (notificacion: NotificacionDemo) => {
    marcarNotificacionLeida(notificacion.id);
    setNotificaciones(obtenerNotificacionesDemo());
  };

  const leerTodas = () => {
    marcarTodasNotificacionesLeidas();
    setNotificaciones(obtenerNotificacionesDemo());
  };

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
        <div className="flex items-center justify-between gap-4 border-b border-ink/10 px-5 py-4">
          <div>
            <p className="font-serif text-lg font-bold text-navy">Notificaciones</p>
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

        <div className="flex items-center justify-between gap-3 border-b border-ink/10 px-5 py-3">
          <div>
            <p className="text-sm font-medium text-ink">Notificaciones del navegador</p>
            <p className="text-xs text-ink/50">Avisos de nuevos viajes y pocos cupos</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={activas}
            onClick={() => {
              const nuevoValor = !activas;
              setActivas(nuevoValor);
              cambiarNotificacionesActivas(nuevoValor);
            }}
            className={`relative h-6 w-11 shrink-0 rounded-full transition ${
              activas ? "bg-steel" : "bg-ink/20"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                activas ? "left-[1.375rem]" : "left-0.5"
              }`}
            />
          </button>
        </div>

        {activas ? (
          <ul className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
            {notificaciones.map((notificacion) => (
              <li key={notificacion.id}>
                <button
                  type="button"
                  onClick={() => alSeleccionar(notificacion)}
                  className={`w-full rounded-lg border-l-4 bg-sand/60 px-4 py-3 text-left ring-1 ring-ink/5 transition hover:bg-sand ${
                    notificacion.leida ? "opacity-70" : ""
                  } ${estiloBordePorTipo[notificacion.tipo]}`}
                >
                  <p className="flex items-center gap-2 text-sm font-semibold text-navy">
                    {!notificacion.leida ? (
                      <span
                        className="h-2 w-2 shrink-0 rounded-full bg-clay"
                        aria-label="Sin leer"
                      />
                    ) : null}
                    <span className="flex-1">{notificacion.titulo}</span>
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-ink/65">
                    {notificacion.cuerpo}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-1 items-center justify-center px-8 text-center text-sm text-ink/50">
            Las notificaciones del navegador están desactivadas. Revisa el
            catálogo para conocer los próximos viajes.
          </div>
        )}

        <div className="border-t border-ink/10 px-5 py-4">
          <button
            type="button"
            onClick={leerTodas}
            disabled={restantes === 0}
            className={`w-full rounded-md px-4 py-2.5 text-sm font-medium transition ${
              restantes === 0
                ? "cursor-not-allowed bg-ink/5 text-ink/35"
                : "bg-navy text-sand hover:bg-steel"
            }`}
          >
            Ver todas las notificaciones
          </button>
        </div>
      </aside>
    </div>
  );
}
