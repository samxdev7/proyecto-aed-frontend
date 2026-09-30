"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, Eye, MapPin, Mountain } from "lucide-react";
import { viajesService, type ViajeResumen } from "@/services/viajes.service";
import { formatoFechaCorta } from "@/lib/format";
import { TarjetaViajeSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { ChipDificultad } from "@/components/ui/Chip";
import ModalFicha from "@/components/viajes/ModalFicha";

export default function TripCatalog() {
  const [viajes, setViajes] = useState<ViajeResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [seleccionado, setSeleccionado] = useState<ViajeResumen | null>(null);

  useEffect(() => {
    let activo = true;
    viajesService.listarViajes().then((res) => {
      if (activo) {
        setViajes(res);
        setLoading(false);
      }
    });
    return () => {
      activo = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-lg py-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {Array.from({ length: 6 }, (_, i) => (
            <TarjetaViajeSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-lg py-lg space-y-lg">
      <div className="text-center space-y-sm mb-xl">
        <h1 className="text-3xl font-bold text-primary tracking-tight">Expediciones Disponibles</h1>
        <p className="text-sm text-text-muted max-w-lg mx-auto">
          Descubre rutas diseñadas para conectar con la naturaleza y la cultura de Nicaragua.
        </p>
      </div>

      {viajes.length === 0 ? (
        <EmptyState
          icono={Mountain}
          titulo="No hay expediciones disponibles"
          descripcion="Aún no hay viajes publicados. Vuelve pronto para descubrir la próxima ruta."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {viajes.map((viaje) => (
            <div key={viaje.idViaje} className="group bg-surface rounded-md border border-neutral-border overflow-hidden hover:shadow-md transition-all duration-300 relative">
              <Link href={`/viajes/${viaje.idViaje}`} aria-label={`Ver detalles de ${viaje.titulo}`} className="absolute inset-0 z-10" />
              <div className="aspect-[4/3] bg-surface-alt relative overflow-hidden">
                {viaje.imagen ? (
                  <Image
                    src={viaje.imagen}
                    alt={viaje.titulo}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-text-muted">
                    <Mountain size={40} aria-hidden="true" />
                  </div>
                )}
                <div className="absolute top-sm left-sm flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                    Dificultad:
                  </span>
                  <ChipDificultad dificultad={viaje.dificultad} />
                </div>
              </div>

              <div className="p-md space-y-md">
                <div className="space-y-xs">
                  <h3 className="text-lg font-bold text-primary group-hover:text-primary-dark transition-colors">
                    {viaje.titulo}
                  </h3>
                  <p className="text-sm text-text-muted line-clamp-2 leading-relaxed">
                    {viaje.descripcion}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-xs py-sm">
                  <div className="flex items-center gap-xs text-xs text-text-muted">
                    <Calendar size={14} className="text-primary" />
                    <span>{formatoFechaCorta(viaje.fechaHoraIda)}</span>
                  </div>
                  <div className="flex items-center gap-xs text-xs text-text-muted">
                    <MapPin size={14} className="text-primary" />
                    <span className="line-clamp-2 leading-snug">{viaje.puntoEncuentro}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-xs">
                  <div className="flex flex-col">
                    <span className="text-xs text-text-muted uppercase font-bold">Costo Total</span>
                    <span className="text-xl font-bold text-text-main">${viaje.montoTotal}</span>
                  </div>
                  <div className="flex items-center gap-xs">
                    <button
                      type="button"
                      onClick={() => setSeleccionado(viaje)}
                      aria-label={`Vista rápida de ${viaje.titulo}`}
                      title="Vista rápida"
                      className="p-xs rounded-sm border border-neutral-border text-text-muted hover:bg-surface-alt hover:text-primary transition-colors relative z-20"
                    >
                      <Eye size={18} />
                    </button>
                    <Link
                      href={`/viajes/${viaje.idViaje}`}
                      className="bg-primary text-white px-md py-xs rounded-sm text-sm font-medium hover:bg-primary-dark transition-all flex items-center gap-xs relative z-20"
                    >
                      Explorar <ArrowRight size={16} />
                    </Link>
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
