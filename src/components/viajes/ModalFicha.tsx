"use client";

import Image from "next/image";
import { ChipDificultad } from "@/components/ui/Chip";
import Boton from "@/components/ui/Boton";
import Modal from "@/components/ui/Modal";
import {
  formatoCordobas,
  formatoFecha,
  formatoPrecio,
  formatoUSDAproximado,
} from "@/lib/format";
import type { Viaje } from "@/types/viaje";

interface ModalFichaProps {
  viaje: Viaje | null;
  onCerrar: () => void;
}

export default function ModalFicha({ viaje, onCerrar }: ModalFichaProps) {
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
          {viaje.imagenUrl ? (
            <Image
              src={viaje.imagenUrl}
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
          <span className="absolute left-5 top-5">
            <ChipDificultad dificultad={viaje.dificultad} />
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
          {viaje.descripcion ? (
            <p className="mt-2 text-sm text-ink/65">{viaje.descripcion}</p>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <DatoChico etiqueta="Fecha" texto={formatoFecha(viaje.fechaHoraIda)} />
            <DatoChico
              etiqueta="Punto de encuentro"
              texto={viaje.puntoEncuentro}
            />
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
              <span className="text-ink/70">Abono para apartar tu cupo</span>
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

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Boton
              href={`/inscripcion/${viaje.idViaje}`}
              className="flex-1"
            >
              Inscribirme
            </Boton>
            <Boton
              href={`/viajes/${viaje.idViaje}`}
              variante="contornoOscuro"
              className="flex-1"
            >
              Ver detalle
            </Boton>
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
