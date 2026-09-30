import Image from "next/image";
import type { EstadoInscripcion, Viaje } from "@/types/viaje";
import { formatoFechaCorta, formatoPrecio } from "@/lib/format";
import {
  etiquetasEstado,
  textosBotonEstado,
} from "@/lib/demo";

interface ViajeCardProps {
  viaje: Viaje;
  onVerDetalle: () => void;
  estadoInscripcion?: EstadoInscripcion;
  esNuevo?: boolean;
}

const estiloDificultad: Record<Viaje["dificultad"], string> = {
  Baja: "bg-ochre text-navy",
  Media: "bg-steel text-sand",
  Alta: "bg-clay text-white",
};

const estiloEstado: Record<EstadoInscripcion, string> = {
  pendiente: "bg-ochre text-navy",
  aprobada: "bg-clay text-white",
  rechazada: "bg-navy text-sand/70",
};

export default function ViajeCard({
  viaje,
  onVerDetalle,
  estadoInscripcion,
  esNuevo = false,
}: ViajeCardProps) {
  const pocosCupos = viaje.cuposDisponibles <= 5;

  return (
    <article className="flex flex-col overflow-hidden rounded-lg bg-surface shadow-sm ring-1 ring-ink/5 transition hover:shadow-md">
      {estadoInscripcion ? (
        <p
          className={`px-3 py-1.5 text-center text-[11px] font-semibold uppercase tracking-wide ${estiloEstado[estadoInscripcion]}`}
        >
          {etiquetasEstado[estadoInscripcion]}
        </p>
      ) : null}
      <div className="relative h-40 overflow-hidden bg-steel">
        {viaje.imagen ? (
          <Image
            src={viaje.imagen}
            alt={viaje.titulo}
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <svg
            className="absolute bottom-0 left-0 h-24 w-full text-deep/50"
            viewBox="0 0 400 120"
            preserveAspectRatio="none"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M0 120 L110 40 L200 100 L300 24 L400 90 L400 120 Z" />
          </svg>
        )}
        <span
          className={`absolute left-4 top-4 rounded-sm px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${estiloDificultad[viaje.dificultad]}`}
        >
          {viaje.dificultad}
        </span>
        {esNuevo ? (
          <span className="absolute right-4 top-4 rounded-sm bg-ochre px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-navy">
            Recién añadido
          </span>
        ) : null}
        <p className="absolute bottom-3 left-4 text-xs font-medium text-sand/90">
          {formatoFechaCorta(viaje.fechaHoraIda)}
        </p>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-serif text-xl font-bold text-navy">
          {viaje.titulo}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink/65">
          {viaje.descripcion}
        </p>
        <p
          className={`mt-3 text-xs font-medium ${
            pocosCupos ? "font-semibold text-clay" : "text-navy/70"
          }`}
        >
          {pocosCupos
            ? `¡Quedan solo ${viaje.cuposDisponibles} cupos!`
            : `${viaje.cuposDisponibles} de ${viaje.cuposMaximos} cupos disponibles`}
        </p>
        <p className="mt-4 text-sm font-semibold text-navy">
          {formatoPrecio(viaje.montoTotal)}
        </p>
        <button
          type="button"
          disabled={estadoInscripcion === "rechazada"}
          onClick={onVerDetalle}
          className={`mt-4 rounded-md px-4 py-2.5 text-sm font-medium transition ${
            estadoInscripcion === "rechazada"
              ? "cursor-not-allowed bg-ink/10 text-ink/40"
              : "bg-navy text-sand hover:bg-steel"
          }`}
        >
          {estadoInscripcion
            ? textosBotonEstado[estadoInscripcion]
            : "Ver detalles"}
        </button>
      </div>
    </article>
  );
}