"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { EstadoInscripcion, Viaje } from "@/types/viaje";
import {
  formatoCordobas,
  formatoFecha,
  formatoPrecio,
  formatoUSDAproximado,
} from "@/lib/format";
import { etiquetasEstado } from "@/lib/demo";
import Modal from "@/components/ui/Modal";

interface ModalFichaProps {
  viaje: Viaje | null;
  onCerrar: () => void;
  estadoInscripcion?: EstadoInscripcion;
  puedeReservar?: boolean;
}

const estiloEstadoBanner: Record<EstadoInscripcion, string> = {
  pendiente: "border-l-4 border-ochre bg-ochre/10 text-navy",
  aprobada: "border-l-4 border-clay bg-clay/10 text-navy",
  rechazada: "border-l-4 border-navy bg-ink/5 text-ink/70",
};

const textoEstadoBanner: Record<EstadoInscripcion, string> = {
  pendiente:
    "Estamos auditando tu comprobante de pago. Te avisaremos cuando avance.",
  aprobada:
    "Revisa el correo de confirmación con el enlace del grupo de WhatsApp del viaje.",
  rechazada: "No podrás inscribirte nuevamente a este viaje.",
};

const textoEstadoCta: Record<EstadoInscripcion, string> = {
  pendiente: "Reserva en validación",
  aprobada: "Cupo confirmado",
  rechazada: "Inscripción rechazada",
};

const estiloDificultad: Record<Viaje["dificultad"], string> = {
  Baja: "bg-ochre text-navy",
  Media: "bg-steel text-sand",
  Alta: "bg-clay text-white",
};

export default function ModalFicha({
  viaje,
  onCerrar,
  estadoInscripcion,
  puedeReservar = false,
}: ModalFichaProps) {
  const router = useRouter();
  if (!viaje) return null;

  return (
    <Modal
      abierto
      onCerrar={onCerrar}
      titulo={`Detalle de ${viaje.titulo}`}
      className="max-w-2xl"
    >
      <div>
        <div className="relative h-44 overflow-hidden rounded-t-lg bg-steel md:h-52">
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
              className="absolute bottom-0 left-0 h-28 w-full text-deep/50"
              viewBox="0 0 800 140"
              preserveAspectRatio="none"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M0 140 L220 50 L420 120 L620 36 L800 100 L800 140 Z" />
            </svg>
          )}
          <span
            className={`absolute left-5 top-5 rounded-sm px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${estiloDificultad[viaje.dificultad]}`}
          >
            {viaje.dificultad}
          </span>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar detalles"
            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded border border-sand/50 bg-navy/40 text-sand transition hover:bg-navy/70"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <div className="p-6 md:p-8">
          <h2 className="pr-10 font-serif text-2xl font-bold text-navy md:text-3xl">
            {viaje.titulo}
          </h2>
          <p className="mt-2 text-sm text-ink/65">{viaje.descripcion}</p>

          {estadoInscripcion ? (
            <div
              className={`mt-5 rounded-r-lg px-4 py-3 ${estiloEstadoBanner[estadoInscripcion]}`}
            >
              <p className="text-sm font-semibold">
                {etiquetasEstado[estadoInscripcion]} · Tu inscripción
              </p>
              <p className="mt-0.5 text-xs leading-relaxed">
                {textoEstadoBanner[estadoInscripcion]}
              </p>
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <DatoChico
              etiqueta="Fecha"
              texto={formatoFecha(viaje.fechaHoraIda)}
            />
            <DatoChico etiqueta="Punto de encuentro" texto={viaje.puntoEncuentro} />
            <DatoChico
              etiqueta="Cupos"
              texto={`${viaje.cuposDisponibles} de ${viaje.cuposMaximos} disponibles`}
            />
          </div>

          <div className="mt-6 rounded-lg bg-sand p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink/60">
              Costo
            </h3>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-ink/70">
                Abono para apartar tu cupo
              </span>
              <span className="font-semibold text-navy">
                {formatoCordobas(viaje.montoReserva)}
                <span className="ml-1 text-xs font-normal text-ink/50">
                  ({formatoUSDAproximado(viaje.montoReserva)})
                </span>
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-ink/70">Monto total del viaje</span>
              <span className="font-semibold text-navy">
                {formatoPrecio(viaje.montoTotal)}
              </span>
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink/60">
                Itinerario sugerido
              </h3>
              <ol className="mt-3 space-y-2 text-sm text-ink/75">
                {viaje.itinerario.map((paso, indice) => (
                  <li key={paso} className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-navy text-[10px] font-semibold text-sand">
                      {indice + 1}
                    </span>
                    {paso}
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink/60">
                Equipo recomendado
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-ink/75">
                {viaje.equipo.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <svg
                      viewBox="0 0 24 24"
                      className="mt-0.5 h-4 w-4 shrink-0 text-clay"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m5 13 4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {estadoInscripcion ? (
              <div className="flex flex-1 items-center justify-center rounded-md bg-sand px-6 py-3 text-sm font-medium text-navy">
                {textoEstadoCta[estadoInscripcion]}
              </div>
            ) : puedeReservar ? (
              <button
                type="button"
                onClick={() => router.push(`/inscripcion/${viaje.idViaje}`)}
                className="inline-flex flex-1 items-center justify-center rounded-md bg-clay px-6 py-3 text-sm font-medium text-white transition hover:bg-clay-dark"
              >
                Reservar
              </button>
            ) : (
              <a
                href="/iniciar-sesion"
                className="inline-flex items-center justify-center rounded-md bg-clay px-6 py-3 text-sm font-medium text-white transition hover:bg-clay-dark"
              >
                Iniciar Sesión para Reservar
              </a>
            )}
            <button
              type="button"
              onClick={onCerrar}
              className="rounded-md border border-navy/25 px-6 py-3 text-sm font-medium text-navy transition hover:bg-navy/5"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function DatoChico({ etiqueta, texto }: { etiqueta: string; texto: string }) {
  return (
    <div className="flex-1 basis-40 rounded-lg bg-sand/70 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-ink/50">
        {etiqueta}
      </p>
      <p className="mt-1 text-sm font-medium text-ink">{texto}</p>
    </div>
  );
}