"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, CalendarX, CheckCircle, Clock, XCircle } from "lucide-react";
import { reservaService } from "@/services/reserva.service";
import type { HistorialReservaResumen } from "@/types/reserva";
import type { Dificultad } from "@/types/viaje";
import { formatoFechaCorta, formatoPrecio } from "@/lib/format";
import Boton from "@/components/ui/Boton";
import Chip, { ChipDificultad } from "@/components/ui/Chip";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";

const iconosEstado = {
  aprobada: CheckCircle,
  pendiente: Clock,
  rechazada: XCircle,
  expirada: CalendarX,
} as const;

export default function UserReservas() {
  const [reservas, setReservas] = useState<HistorialReservaResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reintentos, setReintentos] = useState(0);

  useEffect(() => {
    let activo = true;
    reservaService
      .listarMisReservas()
      .then((pagina) => {
        if (activo) {
          setReservas(pagina.content);
          setLoading(false);
        }
      })
      .catch(() => {
        if (activo) {
          setError(true);
          setLoading(false);
        }
      });
    return () => {
      activo = false;
    };
  }, [reintentos]);

  function reintentar() {
    setLoading(true);
    setError(false);
    setReintentos((n) => n + 1);
  }

  if (loading) {
    return (
      <div className="space-y-md">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        titulo="No pudimos cargar tus reservas"
        descripcion="Ocurrió un error al obtener tu historial. Inténtalo de nuevo."
        accion={{ etiqueta: "Reintentar", onClick: reintentar }}
      />
    );
  }

  return (
    <div className="space-y-md">
      <div className="flex items-center justify-between gap-sm">
        <div>
          <h2 className="text-2xl font-bold text-primary">Mis Reservas</h2>
          <p className="text-text-muted">
            Gestiona tus inscripciones a los viajes.
          </p>
        </div>
        <Boton href="/viajes" tamano="sm">
          <Calendar size={18} /> Nueva Reserva
        </Boton>
      </div>

      {reservas.length === 0 ? (
        <EmptyState
          icono={CalendarX}
          titulo="Aún no tienes reservas"
          descripcion="Explora las expediciones disponibles y aparta tu cupo."
          accion={{ etiqueta: "Explorar viajes", href: "/viajes" }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-md">
          {reservas.map((reserva) => {
            const IconoEstado = iconosEstado[reserva.estado];
            return (
              <div
                key={reserva.idReserva}
                className="flex flex-col items-center justify-between gap-md rounded-md border border-neutral-border bg-surface p-md shadow-sm md:flex-row"
              >
                <div className="flex w-full items-center gap-md md:w-auto">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-sand text-xl font-bold text-primary">
                    {reserva.viaje.titulo[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-primary">
                      {reserva.viaje.titulo}
                    </h3>
                    <div className="flex flex-wrap items-center gap-sm text-sm text-text-muted">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} aria-hidden="true" />{" "}
                        {formatoFechaCorta(reserva.viaje.fechaHoraIda)}
                      </span>
                      <ChipDificultad
                        dificultad={reserva.viaje.dificultad as Dificultad}
                      />
                      <span>
                        Abono: {formatoPrecio(reserva.montoReserva)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex w-full items-center justify-between gap-md md:w-auto md:justify-end">
                  <div className="flex flex-col items-end gap-xs">
                    <Chip
                      estado={reserva.estado}
                      icono={IconoEstado}
                      className="px-sm py-xs font-bold uppercase"
                    />
                    <span className="text-xs text-text-muted">
                      Reservada el {formatoFechaCorta(reserva.fechaReserva)}
                    </span>
                  </div>
                  <Link
                    href={`/user/reservas/${reserva.idReserva}`}
                    className="rounded-md border border-neutral-border px-md py-sm text-sm font-medium transition-colors hover:bg-surface-alt"
                  >
                    Ver Detalle
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
