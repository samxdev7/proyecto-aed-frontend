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
