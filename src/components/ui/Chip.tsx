import type { LucideIcon } from "lucide-react";
import type { EstadoReserva } from "@/types/reserva";
import type { Dificultad } from "@/types/viaje";

/** Mapa 1:1 estado → etiqueta visible, compartido por toda la app. */
export const etiquetasEstadoReserva: Record<EstadoReserva, string> = {
  pendiente: "Pendiente",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
  expirada: "Expirada",
};

const estilosEstado: Record<EstadoReserva, string> = {
  pendiente: "bg-estado-pendiente-bg text-estado-pendiente-text",
  aprobada: "bg-estado-aprobada-bg text-estado-aprobada-text",
  rechazada: "bg-estado-rechazada-bg text-estado-rechazada-text",
  expirada: "bg-surface-alt text-text-muted",
};

const estilosDificultad: Record<Dificultad, string> = {
  Baja: "bg-ochre text-navy",
  Media: "bg-steel text-sand",
  Alta: "bg-clay text-white",
  Extrema: "bg-navy text-white",
};;

export default function Chip({
  estado,
  icono: Icono,
  className = "",
}: {
  estado: EstadoReserva;
  icono?: LucideIcon;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm px-2 py-1 text-xs font-medium capitalize ${estilosEstado[estado]} ${className}`}
    >
      {Icono ? <Icono size={12} /> : null}
      {etiquetasEstadoReserva[estado]}
    </span>
  );
}

/** Chip de dificultad de viaje (tokens de marca, no de estado). */
export function ChipDificultad({
  dificultad,
  className = "",
}: {
  dificultad: Dificultad;
  className?: string;
}) {
  return (
    <span
      className={`rounded-sm px-2 py-1 text-xs font-medium ${estilosDificultad[dificultad]} ${className}`}
    >
      {dificultad}
    </span>
  );
}

/** Chip para el estado del viaje o ciclo de inscripciones */
export function ChipEstadoViaje({
  estado,
  className = "",
}: {
  estado: "disponible" | "expirado" | "cerrado" | "activo";
  className?: string;
}) {
  const estilos: Record<string, string> = {
    disponible: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    activo: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    expirado: "bg-amber-100 text-amber-800 border border-amber-300 font-semibold",
    cerrado: "bg-neutral-100 text-neutral-600 border border-neutral-300",
  };
  const etiquetas: Record<string, string> = {
    disponible: "Disponible",
    activo: "Activo",
    expirado: "Inscripciones expiradas",
    cerrado: "Cerrado",
  };
  return (
    <span
      className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium ${
        estilos[estado] || estilos.cerrado
      } ${className}`}
    >
      {etiquetas[estado] || estado}
    </span>
  );
}

