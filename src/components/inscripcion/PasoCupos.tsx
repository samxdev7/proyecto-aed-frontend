"use client";

import { CalendarX, Minus, Plus } from "lucide-react";
import Boton from "@/components/ui/Boton";
import EmptyState from "@/components/ui/EmptyState";
import { formatoCordobas, formatoUSDAproximado } from "@/lib/format";
import type { Viaje } from "@/types/viaje";

interface PasoCuposProps {
  viaje: Viaje;
  cantidad: number;
  alCambiarCantidad: (cantidad: number) => void;
  alContinuar: () => void;
}

export default function PasoCupos({
  viaje,
  cantidad,
  alCambiarCantidad,
  alContinuar,
}: PasoCuposProps) {
  if (viaje.cuposDisponibles <= 0) {
    return (
      <EmptyState
        icono={CalendarX}
        titulo="Este viaje está lleno"
        descripcion="No quedan cupos disponibles para esta salida. Revisa otras expediciones del catálogo."
        accion={{ etiqueta: "Ver otros viajes", href: "/viajes" }}
      />
    );
  }

  const ultimosCupos = viaje.cuposDisponibles <= 2;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl font-bold text-navy">
          ¿Cuántos cupos reservas?
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          Tu usuario ocupa el primer cupo; puedes sumar acompañantes en el
          siguiente paso.
        </p>
      </div>

      {ultimosCupos ? (
        <p className="rounded-md bg-warning-bg px-4 py-3 text-sm font-medium text-warning-text">
          ¡Últimos cupos! Solo quedan {viaje.cuposDisponibles} disponibles.
        </p>
      ) : null}

      <div className="flex items-center gap-4">
        <Boton
          variante="contorno"
          tamano="sm"
          disabled={cantidad <= 1}
          onClick={() => alCambiarCantidad(cantidad - 1)}
        >
          <Minus size={16} aria-hidden="true" />
          <span className="sr-only">Quitar un cupo</span>
        </Boton>
        <span className="w-10 text-center text-2xl font-bold text-navy">
          {cantidad}
        </span>
        <Boton
          variante="contorno"
          tamano="sm"
          disabled={cantidad >= viaje.cuposDisponibles}
          onClick={() => alCambiarCantidad(cantidad + 1)}
        >
          <Plus size={16} aria-hidden="true" />
          <span className="sr-only">Agregar un cupo</span>
        </Boton>
        <span className="text-sm text-text-muted">
          de {viaje.cuposDisponibles} disponibles
        </span>
      </div>

      <dl className="space-y-2 rounded-md bg-sand p-4 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-ink/70">Abono por cupo</dt>
          <dd className="font-medium text-navy">
            {formatoCordobas(viaje.montoReserva)}
          </dd>
        </div>
        <div className="flex items-center justify-between border-t border-ink/10 pt-2">
          <dt className="font-semibold text-navy">Total a transferir</dt>
          <dd className="font-bold text-navy">
            {formatoCordobas(viaje.montoReserva * cantidad)}
            <span className="ml-1 text-xs font-normal text-ink/50">
              ({formatoUSDAproximado(viaje.montoReserva * cantidad)})
            </span>
          </dd>
        </div>
      </dl>

      <Boton fullWidth onClick={alContinuar}>
        Continuar
      </Boton>
    </div>
  );
}
