"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Chip, { ChipDificultad } from "@/components/ui/Chip";
import Boton from "@/components/ui/Boton";
import Modal from "@/components/ui/Modal";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";
import {
  formatoCordobas,
  formatoFecha,
  formatoHora,
  formatoPrecio,
} from "@/lib/format";
import type { Viaje } from "@/types/viaje";
import { obtenerSesion, EVENTO_SESION } from "@/lib/auth";
import { reservaService } from "@/services/reserva.service";
import type { HistorialReservaResumen } from "@/types/reserva";
import { calcularEstadoViaje } from "@/lib/viaje-estado";

interface ModalFichaProps {
  viaje: Viaje | null;
  onCerrar: () => void;
}

export default function ModalFicha({ viaje, onCerrar }: ModalFichaProps) {
  const [reservaExistente, setReservaExistente] = useState<
    HistorialReservaResumen | null | undefined
  >(undefined);

  useEffect(() => {
    if (!viaje) return;
    const idViajeActual = viaje.idViaje;
    function verificar() {
      const sesion = obtenerSesion();
      if (!sesion || sesion.rol === "administrador") {
        setReservaExistente(null);
        return;
      }
      let activo = true;
      reservaService
        .listarMisReservas(0, 50)
        .then((pagina) => {
          if (activo) {
            const match = pagina.content.find(
              (r) =>
                r.viaje.idViaje === idViajeActual &&
                ["pendiente", "aprobada", "expirada"].includes(r.estado),
            );
            setReservaExistente(match ?? null);
          }
        })
        .catch(() => {
          if (activo) setReservaExistente(null);
        });
      return () => {
        activo = false;
      };
    }
    verificar();
    window.addEventListener(EVENTO_SESION, verificar);
    return () => window.removeEventListener(EVENTO_SESION, verificar);
  }, [viaje]);

  if (!viaje) return null;

  const estadoCalc = calcularEstadoViaje(viaje.fechaHoraIda, viaje.estado);

  return (
    <Modal
      abierto
      onCerrar={onCerrar}
      titulo={`Detalle de ${viaje.titulo}`}
      className="max-w-2xl"
    >
      <div>
        {/* Portada siempre 1:1: foto cuadrada centrada, limitada al alto del
            modal para que el panel no se dispare en escritorio. */}
        <div className="relative overflow-hidden rounded-t-lg bg-neutral-900">
          <div className="relative mx-auto aspect-square w-full sm:max-h-[50vh] sm:max-w-[50vh]">
            {viaje.imagenUrl ? (
              <Image
                src={viaje.imagenUrl}
                alt={viaje.titulo}
                fill
                sizes="(min-width: 640px) 672px, 100vw"
                className="object-cover"
              />
            ) : null}
            {/* Velo inferior para legibilidad de badges */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-black/65 to-transparent"
            />
            {/* Dificultad: abajo a la izquierda */}
            <span className="absolute bottom-3 left-3 z-20">
              <ChipDificultad dificultad={viaje.dificultad} />
            </span>
            {/* Estado del viaje: abajo a la derecha */}
            <span className="absolute bottom-3 right-3 z-20 flex items-center gap-2">
              {estadoCalc.esExpirado && (
                <span className="rounded-sm bg-amber-100 border border-amber-300 px-2 py-0.5 text-[10px] font-bold text-amber-800 shadow-xs">
                  Inscripciones expiradas
                </span>
              )}
              {estadoCalc.esCerrado && (
                <span className="rounded-sm bg-neutral-100 border border-neutral-300 px-2 py-0.5 text-[10px] font-semibold text-neutral-600 shadow-xs">
                  Cerrado
                </span>
              )}
            </span>
          </div>
          {!viaje.imagenUrl && (
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
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar detalles"
            className="absolute right-5 top-5 z-20 flex h-9 w-9 items-center justify-center rounded border border-sand/50 bg-navy/40 text-sand transition hover:bg-navy/70"
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
            <div className="mt-3 max-h-60 overflow-y-auto pr-1">
              <MarkdownRenderer contenido={viaje.descripcion} />
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <DatoChico etiqueta="Fecha" texto={`${formatoFecha(viaje.fechaHoraIda)}, ${formatoHora(viaje.fechaHoraIda)}`} />
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
            <div className="mt-3 flex items-center justify-between gap-3 text-sm">
              <span className="text-ink/70">Abono para apartar tu cupo</span>
              <span className="font-semibold text-navy whitespace-nowrap shrink-0">
                {formatoCordobas(viaje.montoReserva)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 text-sm">
              <span className="text-ink/70">Monto total del viaje</span>
              <span className="font-semibold text-navy whitespace-nowrap shrink-0">
                {formatoPrecio(viaje.montoTotal)}
              </span>
            </div>
          </div>

          {reservaExistente ? (
            <div className="mt-6 rounded-md border border-neutral-border bg-surface-alt p-sm space-y-1">
              <div className="flex items-center justify-between gap-xs">
                <span className="text-xs font-semibold text-primary">
                  Ya tienes una reserva para este viaje
                </span>
                <Chip estado={reservaExistente.estado} />
              </div>
              <p className="text-xs text-text-muted">
                Ya cuentas con una inscripción registrada para esta expedición.
              </p>
            </div>
          ) : !estadoCalc.puedeReservar ? (
            <div className="mt-6 rounded-md border border-amber-300 bg-amber-50 p-sm space-y-1 text-xs">
              <span className="font-bold text-amber-900">
                {estadoCalc.esExpirado ? "Inscripciones cerradas" : "Viaje cerrado"}
              </span>
              <p className="text-amber-800">
                {estadoCalc.mensajeDetalle}
              </p>
            </div>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {reservaExistente ? (
              <Boton
                href={`/user/reservas/${reservaExistente.idReserva}`}
                className="flex-1"
              >
                Ver el estado de mi reserva
              </Boton>
            ) : !estadoCalc.puedeReservar ? (
              <Boton
                disabled
                className="flex-1 opacity-60 cursor-not-allowed"
              >
                {estadoCalc.esExpirado ? "Inscripciones expiradas" : "Viaje cerrado"}
              </Boton>
            ) : (
              <Boton
                href={`/inscripcion/${viaje.idViaje}`}
                className="flex-1"
              >
                Inscribirme
              </Boton>
            )}
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
