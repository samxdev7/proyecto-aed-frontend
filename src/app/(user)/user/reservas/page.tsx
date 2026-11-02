"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, CalendarX, CheckCircle, Clock, Mountain, XCircle } from "lucide-react";
import { reservaService } from "@/services/reserva.service";
import type { HistorialReservaResumen } from "@/types/reserva";
import type { Dificultad } from "@/types/viaje";
import { formatoFechaCorta, formatoPrecio } from "@/lib/format";
import Boton from "@/components/ui/Boton";
import Chip, { ChipDificultad } from "@/components/ui/Chip";
import EmptyState from "@/components/ui/EmptyState";
import { TarjetaViajeSkeleton } from "@/components/ui/Skeleton";

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
        <div className="flex items-center justify-between gap-sm">
          <div>
            <h2 className="text-2xl font-bold text-primary">Mis Reservas</h2>
            <p className="text-text-muted">
              Gestiona tus inscripciones a los viajes.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-lg md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <TarjetaViajeSkeleton key={i} />
          ))}
        </div>
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
    <div className="space-y-lg">
      <div className="flex items-center justify-between gap-sm">
        <div>
          <h2 className="text-2xl font-bold text-primary">Mis Reservas</h2>
          <p className="text-text-muted">
            Gestiona tus inscripciones a los viajes.
          </p>
        </div>
      </div>

      {reservas.length === 0 ? (
        <EmptyState
          icono={CalendarX}
          titulo="Aún no tienes reservas"
          descripcion="Explora las expediciones disponibles y aparta tu cupo."
          accion={{ etiqueta: "Explorar viajes", href: "/viajes" }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-lg md:grid-cols-2 lg:grid-cols-3">
          {reservas.map((reserva) => {
            const IconoEstado = iconosEstado[reserva.estado];
            return (
              <div
                key={reserva.idReserva}
                className="group relative flex flex-col justify-between overflow-hidden rounded-md border border-neutral-border bg-surface transition-all duration-300 hover:shadow-md"
              >
                <Link
                  href={`/user/reservas/${reserva.idReserva}`}
                  aria-label={`Ver detalles de mi reserva para ${reserva.viaje.titulo}`}
                  className="absolute inset-0 z-10"
                />

                <div>
                  {/* Banner de imagen superior estilo catálogo */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-neutral-900">
                    {reserva.viaje.imagenUrl ? (
                      <>
                        <Image
                          src={reserva.viaje.imagenUrl}
                          alt=""
                          fill
                          aria-hidden="true"
                          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                          className="object-cover blur-md scale-110 opacity-60 pointer-events-none"
                        />
                        <Image
                          src={reserva.viaje.imagenUrl}
                          alt={reserva.viaje.titulo}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                          className="relative z-10 object-contain transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                      </>
                    ) : (
                      <div className="flex h-full items-center justify-center text-text-muted">
                        <Mountain size={40} aria-hidden="true" />
                      </div>
                    )}

                    {/* Dificultad en esquina superior izquierda */}
                    <div className="absolute left-sm top-sm z-20 flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                        Dificultad:
                      </span>
                      <ChipDificultad
                        dificultad={reserva.viaje.dificultad as Dificultad}
                      />
                    </div>

                    {/* Estado de la reserva en esquina superior derecha */}
                    <div className="absolute right-sm top-sm z-20">
                      <Chip
                        estado={reserva.estado}
                        icono={IconoEstado}
                        className="shadow-sm font-bold uppercase text-[11px]"
                      />
                    </div>
                  </div>

                  {/* Contenido de la tarjeta */}
                  <div className="space-y-md p-md">
                    <div className="space-y-xs">
                      <h3 className="text-lg font-bold text-primary transition-colors group-hover:text-primary-dark">
                        {reserva.viaje.titulo}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-xs py-sm border-t border-b border-neutral-border/60">
                      <div className="flex items-center gap-xs text-xs text-text-muted">
                        <Calendar size={14} className="shrink-0 text-primary" />
                        <span>Salida: {formatoFechaCorta(reserva.viaje.fechaHoraIda)}</span>
                      </div>
                      <div className="flex items-center gap-xs text-xs text-text-muted">
                        <Clock size={14} className="shrink-0 text-primary" />
                        <span>Reservada: {formatoFechaCorta(reserva.fechaReserva)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer con abono y botón Ver Detalle */}
                <div className="flex items-center justify-between p-md pt-0">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase text-text-muted">
                      Abono
                    </span>
                    <span className="text-xl font-bold text-text-main">
                      {formatoPrecio(reserva.montoReserva)}
                    </span>
                  </div>
                  <Boton
                    href={`/user/reservas/${reserva.idReserva}`}
                    tamano="sm"
                    className="relative z-20"
                  >
                    Ver Detalle <ArrowRight size={16} />
                  </Boton>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
