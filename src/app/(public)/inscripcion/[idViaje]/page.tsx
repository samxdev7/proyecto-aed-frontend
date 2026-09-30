"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { viajes } from "@/data/viajes";
import type { Dificultad } from "@/types/viaje";
import {
  EVENTO_SESION_DEMO,
  obtenerRolDemo,
  type RolDemo,
} from "@/lib/demo";
import {
  reservaService,
  type ReservaDetalle,
} from "@/services/reserva.service";
import { formatoFecha, formatoPrecio } from "@/lib/format";
import Boton from "@/components/ui/Boton";
import Chip from "@/components/ui/Chip";
import Skeleton from "@/components/ui/Skeleton";
import FlujoInscripcion from "@/components/inscripcion/FlujoInscripcion";

const estiloDificultad: Record<Dificultad, string> = {
  Baja: "bg-ochre text-navy",
  Media: "bg-steel text-sand",
  Alta: "bg-clay text-white",
};

export default function InscripcionPage() {
  const { idViaje } = useParams<{ idViaje: string }>();
  const idViajeNumero = Number(idViaje);
  const viaje = viajes.find((item) => item.idViaje === idViajeNumero);
  const [rol, setRol] = useState<RolDemo>("anon");
  // undefined = verificando; null = sin reserva previa para este viaje.
  const [reservaExistente, setReservaExistente] = useState<
    ReservaDetalle | null | undefined
  >(undefined);

  useEffect(() => {
    const actualizarRol = () => setRol(obtenerRolDemo());
    actualizarRol();
    window.addEventListener(EVENTO_SESION_DEMO, actualizarRol);
    return () => window.removeEventListener(EVENTO_SESION_DEMO, actualizarRol);
  }, []);

  useEffect(() => {
    if (rol !== "client" || Number.isNaN(idViajeNumero)) return;
    let activo = true;
    reservaService
      .listarMisReservas()
      .then((lista) => {
        if (activo) {
          setReservaExistente(
            lista.find((reserva) => reserva.idViaje === idViajeNumero) ?? null,
          );
        }
      })
      .catch(() => {
        if (activo) setReservaExistente(null);
      });
    return () => {
      activo = false;
    };
  }, [rol, idViajeNumero]);

  if (!viaje) {
    return (
      <section className="bg-deep px-6 py-16 md:py-24">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="font-serif text-3xl font-bold text-sand">
            Viaje no encontrado
          </h1>
          <Link
            href="/viajes"
            className="mt-6 inline-block rounded-md bg-sand px-6 py-3 text-sm font-medium text-navy transition hover:bg-surface"
          >
            Volver al catálogo
          </Link>
        </div>
      </section>
    );
  }

  if (rol !== "client") {
    return (
      <section className="bg-deep px-6 py-16 md:py-24">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="font-serif text-3xl font-bold text-sand">
            Inicia sesión para reservar
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-sand/65">
            Necesitas una cuenta de cliente para inscribirte a un viaje.
          </p>
          <Link
            href={`/iniciar-sesion?redir=/inscripcion/${viaje.idViaje}`}
            className="mt-6 inline-block rounded-md bg-clay px-6 py-3 text-sm font-medium text-white transition hover:bg-clay-dark"
          >
            Iniciar sesión
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-deep px-6 py-12 md:py-16">
      <div className="mx-auto max-w-4xl">
        <nav className="text-xs text-sand/50">
          <Link href="/viajes" className="transition hover:text-sand">
            Catálogo de viajes
          </Link>
          <span aria-hidden="true" className="mx-2">
            /
          </span>
          <span className="text-sand/80">{viaje.titulo}</span>
        </nav>

        <div className="mt-6 grid gap-8 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="overflow-hidden rounded-lg bg-surface shadow-sm ring-1 ring-sand/10">
              <div className="relative h-44 overflow-hidden bg-steel md:h-52">
                {viaje.imagen ? (
                  <Image
                    src={viaje.imagen}
                    alt={viaje.titulo}
                    fill
                    sizes="(min-width: 768px) 40vw, 100vw"
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
                  className={`absolute left-4 top-4 rounded-sm px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${estiloDificultad[viaje.dificultad]}`}
                >
                  {viaje.dificultad}
                </span>
              </div>
              <div className="p-5">
                <h1 className="font-serif text-2xl font-bold text-navy">
                  {viaje.titulo}
                </h1>
                <dl className="mt-4 space-y-2 text-sm text-ink/70">
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-ink/50">Fecha</dt>
                    <dd className="font-medium text-ink">
                      {formatoFecha(viaje.fechaHoraIda)}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-ink/50">Punto de encuentro</dt>
                    <dd className="text-right font-medium text-ink">
                      {viaje.puntoEncuentro}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-ink/50">Cupos</dt>
                    <dd className="font-medium text-ink">
                      {viaje.cuposDisponibles} de {viaje.cuposMaximos}{" "}
                      disponibles
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-ink/50">Abono por cupo</dt>
                    <dd className="font-medium text-ink">
                      {formatoPrecio(viaje.montoReserva)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="rounded-lg bg-surface p-6 shadow-sm ring-1 ring-sand/10 md:p-8">
              {reservaExistente === undefined ? (
                <div className="space-y-4">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : reservaExistente ? (
                <div className="space-y-4">
                  <h2 className="font-serif text-xl font-bold text-navy">
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

              <div className="mt-6">
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
    </section>
  );
}
