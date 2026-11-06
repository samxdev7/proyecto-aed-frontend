"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpDown,
  Calendar,
  Eye,
  MapPin,
  Mountain,
  Search,
  Users,
  X,
} from "lucide-react";
import { viajesService } from "@/services/viajes.service";
import { formatoFechaCorta, formatoPrecio } from "@/lib/format";
import { quicksortHoare } from "@/lib/quicksort";
import { TarjetaViajeSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import Boton from "@/components/ui/Boton";
import { ChipDificultad } from "@/components/ui/Chip";
import ModalFicha from "@/components/viajes/ModalFicha";
import { calcularEstadoViaje } from "@/lib/viaje-estado";
import type { Dificultad, Viaje } from "@/types/viaje";

type DificultadFiltro = Dificultad | "Todas";
type CriterioOrden =
  | "predeterminado"
  | "cupos_menor"
  | "fecha_cercana"
  | "fecha_lejana";

const FILTROS_DIFICULTAD: Array<{ valor: DificultadFiltro; etiqueta: string }> = [
  { valor: "Todas", etiqueta: "Todas" },
  { valor: "Baja", etiqueta: "Baja" },
  { valor: "Media", etiqueta: "Media" },
  { valor: "Alta", etiqueta: "Alta" },
  { valor: "Extrema", etiqueta: "Extrema" },
];

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function TripCatalog() {
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reintentos, setReintentos] = useState(0);
  const [seleccionado, setSeleccionado] = useState<Viaje | null>(null);

  // Estados de filtrado y ordenamiento
  const [busqueda, setBusqueda] = useState("");
  const [dificultad, setDificultad] = useState<DificultadFiltro>("Todas");
  const [orden, setOrden] = useState<CriterioOrden>("predeterminado");

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

  function limpiarFiltros() {
    setBusqueda("");
    setDificultad("Todas");
    setOrden("predeterminado");
  }

  // Filtrado y ordenamiento mediante Quicksort Hoare
  const viajesProcesados = useMemo(() => {
    const consulta = normalizar(busqueda.trim());

    // 1. Filtrar por dificultad y por título estrictamente
    const filtrados = viajes.filter((viaje) => {
      if (dificultad !== "Todas" && viaje.dificultad !== dificultad) {
        return false;
      }
      if (consulta && !normalizar(viaje.titulo).includes(consulta)) {
        return false;
      }
      return true;
    });

    // 2. Ordenar con Quicksort Hoare según el criterio solicitado
    switch (orden) {
      case "cupos_menor":
        // Viajes a punto de terminar cupos disponibles (ascendente)
        return quicksortHoare(
          filtrados,
          (a, b) => a.cuposDisponibles - b.cuposDisponibles
        );
      case "fecha_cercana":
        // Viajes más cerca de ejecutarse (fecha ascendente)
        return quicksortHoare(
          filtrados,
          (a, b) =>
            new Date(a.fechaHoraIda).getTime() - new Date(b.fechaHoraIda).getTime()
        );
      case "fecha_lejana":
        // Viajes más lejos de ejecutarse (fecha descendente)
        return quicksortHoare(
          filtrados,
          (a, b) =>
            new Date(b.fechaHoraIda).getTime() - new Date(a.fechaHoraIda).getTime()
        );
      case "predeterminado":
      default:
        return filtrados;
    }
  }, [viajes, busqueda, dificultad, orden]);

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

  const hayFiltrosActivos =
    busqueda.trim() !== "" ||
    dificultad !== "Todas" ||
    orden !== "predeterminado";

  return (
    <div className="mx-auto max-w-7xl space-y-lg px-4 sm:px-6 md:px-lg py-lg">
      <div className="mb-lg sm:mb-xl space-y-sm text-center">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">
          Expediciones Disponibles
        </h1>
        <p className="mx-auto max-w-lg text-sm text-text-muted">
          Descubre rutas diseñadas para conectar con la naturaleza y la cultura
          de Nicaragua.
        </p>
      </div>

      {/* Controles de Búsqueda, Filtros de Dificultad y Ordenamiento (Responsivo Móvil) */}
      {viajes.length > 0 && (
        <div className="space-y-3.5 rounded-lg border border-neutral-border bg-surface p-3.5 sm:p-5 shadow-xs">
          {/* Fila 1: Buscador por título + Selector de Ordenamiento */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Buscador (solo por título) */}
            <div className="relative flex-1">
              <Search
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                aria-hidden="true"
              />
              <input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar expedición por título..."
                className="w-full rounded-md border border-neutral-border bg-bg-main/30 py-2.5 pl-9.5 pr-8 text-sm text-text-main placeholder:text-text-muted transition-colors focus:border-primary focus:bg-surface focus:outline-none focus:ring-1 focus:ring-primary"
                aria-label="Buscar viaje por título"
              />
              {busqueda ? (
                <button
                  type="button"
                  onClick={() => setBusqueda("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-text-muted hover:text-text-main transition-colors"
                  aria-label="Limpiar búsqueda"
                  title="Limpiar búsqueda"
                >
                  <X size={15} />
                </button>
              ) : null}
            </div>

            {/* Selector de ordenamiento Quicksort Hoare */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label
                htmlFor="orden-viajes"
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-muted shrink-0"
              >
                <ArrowUpDown size={14} className="text-primary" aria-hidden="true" />
                <span>Ordenar:</span>
              </label>
              <select
                id="orden-viajes"
                value={orden}
                onChange={(e) => setOrden(e.target.value as CriterioOrden)}
                className="w-full sm:w-auto min-w-0 sm:min-w-[210px] rounded-md border border-neutral-border bg-surface py-2 px-3 text-sm font-medium text-text-main transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="predeterminado">Predeterminado</option>
                <option value="cupos_menor">Cupos por agotarse</option>
                <option value="fecha_cercana">Más cerca de ejecutarse</option>
                <option value="fecha_lejana">Más lejos de ejecutarse</option>
              </select>
            </div>
          </div>

          {/* Fila 2: Filtros por Dificultad (Adaptable a celulares) */}
          <div className="flex flex-col gap-2 pt-2 border-t border-neutral-border/70 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted mr-1">
                Dificultad:
              </span>
              <div
                role="group"
                aria-label="Filtrar por dificultad"
                className="flex flex-wrap gap-1.5"
              >
                {FILTROS_DIFICULTAD.map((filtro) => {
                  const activa = dificultad === filtro.valor;
                  return (
                    <button
                      key={filtro.valor}
                      type="button"
                      onClick={() => setDificultad(filtro.valor)}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                        activa
                          ? "bg-primary text-sand font-semibold shadow-xs"
                          : "border border-neutral-border bg-surface text-text-muted hover:bg-surface-alt hover:text-text-main"
                      }`}
                    >
                      {filtro.etiqueta}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contador y opción de restablecer */}
            <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-text-muted pt-1 sm:pt-0">
              <span>
                {viajesProcesados.length}{" "}
                {viajesProcesados.length === 1 ? "expedición" : "expediciones"}
              </span>
              {hayFiltrosActivos ? (
                <button
                  type="button"
                  onClick={limpiarFiltros}
                  className="font-medium text-clay hover:underline"
                >
                  Restablecer filtros
                </button>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {viajes.length === 0 ? (
        <EmptyState
          icono={Mountain}
          titulo="No hay expediciones disponibles"
          descripcion="Aún no hay viajes publicados. Vuelve pronto para descubrir la próxima ruta."
          accion={{ etiqueta: "Volver al inicio", href: "/" }}
        />
      ) : viajesProcesados.length === 0 ? (
        <EmptyState
          icono={Search}
          titulo="No encontramos expediciones"
          descripcion={
            busqueda
              ? `No hay expediciones cuyo título coincida con "${busqueda}".`
              : "No hay viajes que coincidan con la dificultad seleccionada."
          }
          accion={{ etiqueta: "Restablecer filtros", onClick: limpiarFiltros }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-lg md:grid-cols-2 lg:grid-cols-3">
          {viajesProcesados.map((viaje) => {
            const estadoCalc = calcularEstadoViaje(viaje.fechaHoraIda, viaje.estado);
            return (
              <div
                key={viaje.idViaje}
                className="group relative overflow-hidden rounded-md border border-neutral-border bg-surface transition-all duration-300 hover:shadow-md"
              >
                <Link
                  href={`/viajes/${viaje.idViaje}`}
                  aria-label={`Ver detalles de ${viaje.titulo}`}
                  className="absolute inset-0 z-10"
                />
                <div className="relative aspect-square overflow-hidden bg-neutral-900">
                  {viaje.imagenUrl ? (
                    <Image
                      src={viaje.imagenUrl}
                      alt={viaje.titulo}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-text-muted">
                      <Mountain size={40} aria-hidden="true" />
                    </div>
                  )}
                  {/* Velo inferior: cubre la zona donde van los badges de estado y dificultad */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-black/65 to-transparent"
                  />
                  {/* Dificultad abajo a la izquierda */}
                  <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1.5 sm:bottom-2.5 sm:left-2.5">
                    <ChipDificultad dificultad={viaje.dificultad} />
                  </div>
                  {/* Estado del viaje: abajo a la derecha (misma línea que dificultad) */}
                  {estadoCalc.esExpirado ? (
                    <span className="absolute bottom-2 right-2 z-20 rounded-sm border border-amber-300 bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-800 shadow-xs sm:bottom-2.5 sm:right-2.5">
                      Inscripciones expiradas
                    </span>
                  ) : estadoCalc.esCerrado ? (
                    <span className="absolute bottom-2 right-2 z-20 rounded-sm border border-neutral-300 bg-neutral-100 px-2 py-1 text-[10px] font-semibold text-neutral-600 shadow-xs sm:bottom-2.5 sm:right-2.5">
                      Cerrado
                    </span>
                  ) : viaje.cuposDisponibles <= 2 ? (
                    <span className="absolute bottom-2 right-2 z-20 rounded-sm bg-warning-bg px-2 py-1 text-[10px] font-medium text-warning-text sm:bottom-2.5 sm:right-2.5">
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
          );
        })}
        </div>
      )}

      <ModalFicha viaje={seleccionado} onCerrar={() => setSeleccionado(null)} />
    </div>
  );
}
