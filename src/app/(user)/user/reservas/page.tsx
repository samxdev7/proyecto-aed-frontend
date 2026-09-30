"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { userService } from "@/services/user.service";
import { Reserva } from "@/types/reserva";
import {
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight,
  CalendarX
} from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import Chip from "@/components/ui/Chip";
import { formatoPrecio } from "@/lib/format";

const iconosEstado = {
  aprobada: CheckCircle,
  pendiente: Clock,
  rechazada: XCircle,
} as const;

export default function UserReservas() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reintentos, setReintentos] = useState(0);

  useEffect(() => {
    userService
      .getMyHistorial()
      .then((res) => {
        setReservas(res.content);
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
      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-lg" />
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-primary">Mis Reservas</h2>
          <p className="text-text-muted">Gestiona tus inscripciones a los viajes.</p>
        </div>
        <Link
          href="/viajes"
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
        >
          <Calendar size={18} /> Nueva Reserva
        </Link>
      </div>

      {reservas.length === 0 ? (
        <EmptyState
          icono={CalendarX}
          titulo="Aún no tienes reservas"
          descripcion="Explora las expediciones disponibles y aparta tu cupo."
          accion={{ etiqueta: "Explorar viajes", href: "/viajes" }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reservas.map((res) => {
            const IconoEstado = iconosEstado[res.estado];
            return (
              <div key={res.idReserva} className="bg-surface p-6 rounded-lg shadow-sm border border-neutral-border flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex gap-6 items-center w-full md:w-auto">
                  <div className="w-16 h-16 bg-sand rounded-md flex items-center justify-center text-primary font-bold text-xl">
                    {res.tituloViaje[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-primary">{res.tituloViaje}</h3>
                    <div className="flex gap-3 text-sm text-text-muted">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} /> {new Date(res.fechaCreacion).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <ArrowRight size={14} /> {formatoPrecio(res.montoTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                  <Chip
                    estado={res.estado}
                    icono={IconoEstado}
                    className="px-3 py-1 font-bold uppercase"
                  />
                  <Link
                    href={`/user/reservas/${res.idReserva}`}
                    className="px-4 py-2 text-sm border border-neutral-border rounded-lg hover:bg-surface-alt transition-colors font-medium"
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
