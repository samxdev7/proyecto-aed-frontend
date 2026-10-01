"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, Eye, MapPin, Mountain, Users } from "lucide-react";
import { viajesService } from "@/services/viajes.service";
import { formatoFechaCorta, formatoPrecio } from "@/lib/format";
import { TarjetaViajeSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import Boton from "@/components/ui/Boton";
import { ChipDificultad } from "@/components/ui/Chip";
import ModalFicha from "@/components/viajes/ModalFicha";
import type { Viaje } from "@/types/viaje";

export default function TripCatalog() {
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reintentos, setReintentos] = useState(0);
  const [seleccionado, setSeleccionado] = useState<Viaje | null>(null);

  useEffect(() => {
    let activo = true;
    viajesService
      .listarViajes({ estado: "activo" })
      .then((pagina) => {
        if (activo) {
          setViajes(pagina.content);
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
      <div className="mx-auto max-w-7xl px-lg py-lg">
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
      <div className="mx-auto max-w-3xl px-lg py-xl">
        <EmptyState
          icono={Mountain}
          titulo="No pudimos cargar el catálogo"
          descripcion="Ocurrió un error al obtener las expediciones. Inténtalo de nuevo."
          accion={{ etiqueta: "Reintentar", onClick: reintentar }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-lg px-lg py-lg">
      <div className="mb-xl space-y-sm text-center">
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Expediciones Disponibles
        </h1>
        <p className="mx-auto max-w-lg text-sm text-text-muted">
          Descubre rutas diseñadas para conectar con la naturaleza y la cultura
          de Nicaragua.
        </p>
      </div>

      {viajes.length === 0 ? (
        <EmptyState
          icono={Mountain}
          titulo="No hay expediciones disponibles"
          descripcion="Aún no hay viajes publicados. Vuelve pronto para descubrir la próxima ruta."
          accion={{ etiqueta: "Volver al inicio", href: "/" }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-lg md:grid-cols-2 lg:grid-cols-3">
          {viajes.map((viaje) => (
            <div
              key={viaje.idViaje}
              className="group relative overflow-hidden rounded-md border border-neutral-border bg-surface transition-all duration-300 hover:shadow-md"
            >
              <Link
                href={`/viajes/${viaje.idViaje}`}
                aria-label={`Ver detalles de ${viaje.titulo}`}
                className="absolute inset-0 z-10"
              />
              <div className="relative aspect-[4/3] overflow-hidden bg-surface-alt">
                {viaje.imagenUrl ? (
                  <Image
                    src={viaje.imagenUrl}
                    alt={viaje.titulo}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-text-muted">
                    <Mountain size={40} aria-hidden="true" />
                  </div>
                )}
                <div className="absolute left-sm top-sm flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                    Dificultad:
                  </span>
                  <ChipDificultad dificultad={viaje.dificultad} />
                </div>
                {viaje.cuposDisponibles <= 2 ? (
                  <span className="absolute right-sm top-sm rounded-sm bg-warning-bg px-2 py-1 text-xs font-medium text-warning-text">
                    ¡Últimos cupos!
                  </span>
                ) : null}
              </div>

              <div className="space-y-md p-md">
                <div className="space-y-xs">
                  <h3 className="text-lg font-bold text-primary transition-colors group-hover:text-primary-dark">
                    {viaje.titulo}
                  </h3>
                  {viaje.descripcion ? (
                    <p className="line-clamp-2 text-sm leading-relaxed text-text-muted">
                      {viaje.descripcion}
                    </p>
                  ) : null}
                </div>

                <div className="grid grid-cols-2 gap-xs py-sm">
                  <div className="flex items-center gap-xs text-xs text-text-muted">
                    <Calendar size={14} className="shrink-0 text-primary" />
                    <span>{formatoFechaCorta(viaje.fechaHoraIda)}</span>
                  </div>
                  <div className="flex items-center gap-xs text-xs text-text-muted">
                    <MapPin size={14} className="shrink-0 text-primary" />
                    <span className="line-clamp-2 leading-snug">
                      {viaje.puntoEncuentro}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center gap-xs text-xs text-text-muted">
                    <Users size={14} className="shrink-0 text-primary" />
                    <span>
                      {viaje.cuposDisponibles} de {viaje.cuposMaximos} cupos
                      disponibles
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-xs">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase text-text-muted">
                      Costo Total
                    </span>
                    <span className="text-xl font-bold text-text-main">
                      {formatoPrecio(viaje.montoTotal)}
                    </span>
                  </div>
                  <div className="flex items-center gap-xs">
                    <button
                      type="button"
                      onClick={() => setSeleccionado(viaje)}
                      aria-label={`Vista rápida de ${viaje.titulo}`}
                      title="Vista rápida"
                      className="relative z-20 rounded-sm border border-neutral-border p-xs text-text-muted transition-colors hover:bg-surface-alt hover:text-primary"
                    >
                      <Eye size={18} />
                    </button>
                    <Boton
                      href={`/viajes/${viaje.idViaje}`}
                      tamano="sm"
                      className="relative z-20"
                    >
                      Explorar <ArrowRight size={16} />
                    </Boton>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ModalFicha viaje={seleccionado} onCerrar={() => setSeleccionado(null)} />
    </div>
  );
}
