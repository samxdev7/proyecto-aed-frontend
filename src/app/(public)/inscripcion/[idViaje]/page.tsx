"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Mountain } from "lucide-react";
import { EVENTO_SESION, obtenerSesion } from "@/lib/auth";
import type { Sesion } from "@/types/auth";
import { reservaService } from "@/services/reserva.service";
import type { HistorialReservaResumen } from "@/types/reserva";
import { viajesService } from "@/services/viajes.service";
import type { ViajeDetalle } from "@/types/viaje";
import { formatoFecha, formatoPrecio } from "@/lib/format";
import Boton from "@/components/ui/Boton";
import Chip, { ChipDificultad } from "@/components/ui/Chip";
import Skeleton from "@/components/ui/Skeleton";
import FlujoInscripcion from "@/components/inscripcion/FlujoInscripcion";

/** Estados de reserva que bloquean un nuevo intento (rechazada NO bloquea). */
const ESTADOS_BLOQUEANTES: HistorialReservaResumen["estado"][] = [
  "pendiente",
  "aprobada",
  "expirada",
];

export default function InscripcionPage() {
  const { idViaje } = useParams<{ idViaje: string }>();
  const idViajeNumero = Number(idViaje);
  const esIdInvalido = Number.isNaN(idViajeNumero);
  // undefined = cargando; null = el viaje no existe.
  const [viaje, setViaje] = useState<ViajeDetalle | null | undefined>(
    esIdInvalido ? null : undefined,
  );
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [sesionLista, setSesionLista] = useState(false);
  // undefined = verificando; null = sin reserva previa para este viaje.
  const [reservaExistente, setReservaExistente] = useState<
    HistorialReservaResumen | null | undefined
  >(undefined);

  useEffect(() => {
    if (Number.isNaN(idViajeNumero)) return;
    let activo = true;
    viajesService
      .obtenerViaje(idViajeNumero)
      .then((data) => {
        if (activo) setViaje(data);
      })
      .catch(() => {
        if (activo) setViaje(null);
      });
    return () => {
      activo = false;
    };
  }, [idViajeNumero]);

  useEffect(() => {
    const actualizar = () => {
      setSesion(obtenerSesion());
      setSesionLista(true);
    };
    actualizar();
    window.addEventListener(EVENTO_SESION, actualizar);
    return () => window.removeEventListener(EVENTO_SESION, actualizar);
  }, []);

  useEffect(() => {
    if (!sesion || !viaje) return;
    let activo = true;
    reservaService
      .listarMisReservas()
      .then((pagina) => {
        if (activo) {
          setReservaExistente(
            pagina.content.find(
              (reserva) =>
                reserva.viaje.idViaje === idViajeNumero &&
                ESTADOS_BLOQUEANTES.includes(reserva.estado),
            ) ?? null,
          );
        }
      })
      .catch(() => {
        if (activo) setReservaExistente(null);
      });
    return () => {
      activo = false;
    };
  }, [sesion, viaje, idViajeNumero]);

  if (viaje === undefined || !sesionLista) {
    return (
      <div className="mx-auto max-w-4xl space-y-lg px-lg py-lg">
        <Skeleton className="h-52 w-full rounded-md" />
        <Skeleton className="h-64 w-full rounded-md" />
      </div>
    );
  }

  if (viaje === null) {
    return (
      <div className="mx-auto max-w-xl px-lg py-xl text-center">
        <h1 className="text-3xl font-bold text-primary">Viaje no encontrado</h1>
        <p className="mt-sm text-sm text-text-muted">
          La expedición que buscas no existe o ya no está publicada.
        </p>
        <Boton href="/viajes" className="mt-md">
          Volver al catálogo
        </Boton>
      </div>
    );
  }

  if (!sesion) {
    return (
      <div className="mx-auto max-w-xl px-lg py-xl text-center">
        <h1 className="text-3xl font-bold text-primary">
          Inicia sesión para reservar
        </h1>
        <p className="mt-sm text-sm text-text-muted">
          Necesitas una cuenta de cliente para inscribirte a este viaje.
        </p>
        <Boton
          href={`/iniciar-sesion?redir=/inscripcion/${viaje.idViaje}`}
          className="mt-md"
        >
          Iniciar sesión
        </Boton>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-lg py-lg">
      <nav className="text-xs text-text-muted">
        <Link href="/viajes" className="transition hover:text-primary">
          Catálogo de viajes
        </Link>
        <span aria-hidden="true" className="mx-2">
          /
        </span>
        <span>{viaje.titulo}</span>
      </nav>

      <div className="mt-md grid gap-lg md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="overflow-hidden rounded-md border border-neutral-border bg-surface shadow-sm">
            <div className="relative h-44 overflow-hidden bg-surface-alt md:h-52">
              {viaje.imagenUrl ? (
                <Image
                  src={viaje.imagenUrl}
                  alt={viaje.titulo}
                  fill
                  sizes="(min-width: 768px) 40vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-text-muted">
                  <Mountain size={40} aria-hidden="true" />
                </div>
              )}
              <span className="absolute left-sm top-sm">
                <ChipDificultad dificultad={viaje.dificultad} />
              </span>
            </div>
            <div className="p-md">
              <h1 className="text-xl font-bold text-primary">{viaje.titulo}</h1>
              <dl className="mt-md space-y-sm text-sm">
                <div className="flex items-start justify-between gap-md">
                  <dt className="text-text-muted">Fecha</dt>
                  <dd className="text-right font-medium text-text-main">
                    {formatoFecha(viaje.fechaHoraIda)}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-md">
                  <dt className="text-text-muted">Punto de encuentro</dt>
                  <dd className="text-right font-medium text-text-main">
                    {viaje.puntoEncuentro}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-md">
                  <dt className="text-text-muted">Cupos</dt>
                  <dd className="font-medium text-text-main">
                    {viaje.cuposDisponibles} de {viaje.cuposMaximos} disponibles
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-md">
                  <dt className="text-text-muted">Abono por persona</dt>
                  <dd className="font-medium text-text-main">
                    {formatoPrecio(viaje.montoReserva)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <div className="md:col-span-3">
          <div className="rounded-md border border-neutral-border bg-surface p-md shadow-sm md:p-lg">
            {reservaExistente === undefined ? (
              <div className="space-y-md">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : reservaExistente ? (
              <div className="space-y-md">
                <h2 className="text-xl font-bold text-primary">
                  Ya tienes una reserva para este viaje
                </h2>
                <Chip estado={reservaExistente.estado} />
                <p className="text-sm text-text-muted">
                  Registramos la reserva #{reservaExistente.idReserva} a tu
                  nombre. Puedes seguir su estado desde tu área de cliente.
                </p>
                <Boton
                  href={`/user/reservas/${reservaExistente.idReserva}`}
                  tamano="sm"
                >
                  Ver estado de mi reserva
                </Boton>
              </div>
            ) : (
              <FlujoInscripcion viaje={viaje} />
            )}

            <div className="mt-lg">
              <Link
                href="/viajes"
                className="text-sm font-medium text-primary transition hover:text-primary-light"
              >
                ← Volver al catálogo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
