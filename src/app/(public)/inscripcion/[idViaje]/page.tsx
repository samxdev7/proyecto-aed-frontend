"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { viajes } from "@/data/viajes";
import type { Dificultad } from "@/types/viaje";
import {
  EVENTO_SESION_DEMO,
  estadoInscripcionesDemo,
  etiquetasEstado,
  obtenerRolDemo,
  type RolDemo,
} from "@/lib/demo";
import {
  formatoCordobas,
  formatoFecha,
  formatoPrecio,
  formatoUSDAproximado,
} from "@/lib/format";

const estiloDificultad: Record<Dificultad, string> = {
  Baja: "bg-ochre text-navy",
  Media: "bg-steel text-sand",
  Alta: "bg-clay text-white",
};

export default function InscripcionPage() {
  const { idViaje } = useParams<{ idViaje: string }>();
  const viaje = viajes.find((item) => item.idViaje === Number(idViaje));
  const [rol, setRol] = useState<RolDemo>("anon");

  useEffect(() => {
    const actualizarRol = () => setRol(obtenerRolDemo());
    actualizarRol();
    window.addEventListener(EVENTO_SESION_DEMO, actualizarRol);
    return () => window.removeEventListener(EVENTO_SESION_DEMO, actualizarRol);
  }, []);

  if (!viaje) {
    return (
      <section className="bg-deep px-6 py-16 md:py-24">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="font-serif text-3xl font-bold text-sand">
            Viaje no encontrado
          </h1>
          <Link
            href="/viajes"
            className="mt-6 inline-block rounded-md bg-sand px-6 py-3 text-sm font-medium text-navy transition hover:bg-white"
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
            href="/iniciar-sesion"
            className="mt-6 inline-block rounded-md bg-clay px-6 py-3 text-sm font-medium text-white transition hover:bg-[#a9582f]"
          >
            Iniciar sesión
          </Link>
        </div>
      </section>
    );
  }

  const estado = estadoInscripcionesDemo[viaje.idViaje];

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
            <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-sand/10">
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
                  className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${estiloDificultad[viaje.dificultad]}`}
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
                      {viaje.cuposDisponibles} de {viaje.cuposMaximos}
                      disponibles
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-sand/10 md:p-8">
              <h2 className="font-serif text-xl font-bold text-navy">
                Reserva tu lugar
              </h2>

              {estado ? (
                <div className="mt-4 rounded-md border border-ink/10 bg-sand/70 px-4 py-3 text-sm text-ink/75">
                  Ya tienes una solicitud con estado{" "}
                  <strong>{etiquetasEstado[estado]}</strong> para este viaje.
                  Revisa el detalle desde el catálogo.
                </div>
              ) : (
                <>
                  <div className="mt-4 rounded-lg bg-sand p-5">
                    <div className="flex items-center justify-between text-sm">
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

                  <div className="mt-6 rounded-lg border-2 border-dashed border-ink/15 px-5 py-10 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sand text-navy">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                        <path d="M14 2v6h6" />
                        <path d="M9 15l2 2 4-4" />
                      </svg>
                    </div>
                    <h3 className="mt-4 font-serif text-lg font-bold text-navy">
                      Formulario de inscripción
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink/60">
                      El formulario para completar tus datos y adjuntar tu
                      comprobante de pago está en construcción. Pronto podrás
                      inscribirte en línea.
                    </p>
                  </div>
                </>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/viajes"
                  className="inline-flex items-center justify-center rounded-md bg-navy px-6 py-3 text-sm font-medium text-sand transition hover:bg-steel"
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