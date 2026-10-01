"use client";

import { Clock } from "lucide-react";
import Boton from "@/components/ui/Boton";
import Chip from "@/components/ui/Chip";
import TemporizadorRetencion from "@/components/inscripcion/TemporizadorRetencion";
import { formatoCordobas, formatoUSDAproximado } from "@/lib/format";
import type { ReservaDetalle } from "@/types/reserva";

export default function PasoConfirmacion({
  reserva,
}: {
  reserva: ReservaDetalle;
}) {
  /** montoReserva = abono POR PERSONA; el titular + acompañantes lo pagan. */
  const personas = 1 + reserva.acompanantes.length;
  const total = reserva.montoReserva * personas;

  return (
    <div className="space-y-md text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-estado-pendiente-bg text-estado-pendiente-text">
        <Clock size={30} aria-hidden="true" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-primary">¡Reserva recibida!</h2>
        <p className="mx-auto mt-sm max-w-md text-sm text-text-muted">
          Tu comprobante quedó en revisión. Te notificaremos cuando el equipo
          valide la transferencia y confirme tu cupo.
        </p>
      </div>

      <div className="flex justify-center">
        <Chip estado={reserva.estado} />
      </div>

      <TemporizadorRetencion fechaLimite={reserva.fechaLimitePago} />

      <dl className="grid gap-md rounded-md bg-sand p-md text-left text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs font-semibold text-ink/60">Reserva</dt>
          <dd className="font-medium text-navy">#{reserva.idReserva}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-ink/60">Referencia</dt>
          <dd className="font-mono font-medium text-navy">
            {reserva.numeroReferenciaPago}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-ink/60">
            Abono (por persona)
          </dt>
          <dd className="font-medium text-navy">
            {formatoCordobas(reserva.montoReserva)}
          </dd>
        </div>
        <div className="sm:col-span-3 border-t border-ink/10 pt-sm">
          <dt className="text-xs font-semibold text-ink/60">
            Total abonado ({personas} {personas === 1 ? "persona" : "personas"})
          </dt>
          <dd className="font-bold text-navy">
            {formatoCordobas(total)}
            <span className="ml-1 text-xs font-normal text-ink/50">
              ({formatoUSDAproximado(total)})
            </span>
          </dd>
        </div>
      </dl>

      <div className="flex flex-col justify-center gap-sm sm:flex-row">
        <Boton href={`/user/reservas/${reserva.idReserva}`}>
          Ver mi reserva
        </Boton>
        <Boton href="/user/reservas" variante="contorno">
          Ir a mis reservas
        </Boton>
      </div>
    </div>
  );
}
