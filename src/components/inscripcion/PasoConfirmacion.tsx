"use client";

import { Clock } from "lucide-react";
import Boton from "@/components/ui/Boton";
import Chip from "@/components/ui/Chip";
import { formatoPrecio } from "@/lib/format";
import type { ReservaDetalle } from "@/services/reserva.service";

export default function PasoConfirmacion({
  reserva,
}: {
  reserva: ReservaDetalle;
}) {
  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-estado-pendiente-bg text-estado-pendiente-text">
        <Clock size={30} aria-hidden="true" />
      </div>

      <div>
        <h2 className="font-serif text-2xl font-bold text-navy">
          ¡Reserva recibida!
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-text-muted">
          Tu comprobante quedó en revisión. Te notificaremos cuando el equipo
          valide la transferencia y confirme tu cupo.
        </p>
      </div>

      <div className="flex justify-center">
        <Chip estado={reserva.estado} />
      </div>

      <dl className="grid gap-4 rounded-md bg-sand p-5 text-left text-sm sm:grid-cols-3">
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
          <dt className="text-xs font-semibold text-ink/60">Abono pagado</dt>
          <dd className="font-medium text-navy">
            {formatoPrecio(reserva.montoTotal)}
          </dd>
        </div>
      </dl>

      <div className="flex flex-col justify-center gap-3 sm:flex-row">
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
