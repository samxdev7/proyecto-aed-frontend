"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { viajes } from "@/data/viajes";
import type { Dificultad } from "@/types/viaje";
import ViajeCard from "@/components/viajes/ViajeCard";
import ModalFicha from "@/components/viajes/ModalFicha";
import {
  EVENTO_SESION_DEMO,
  estadoInscripcionesDemo,
  idViajesNuevosDemo,
  obtenerRolDemo,
  type RolDemo,
} from "@/lib/demo";

const filtros: Array<{ valor: Dificultad | "Todas"; etiqueta: string }> = [
  { valor: "Todas", etiqueta: "Todas" },
  { valor: "Baja", etiqueta: "Baja" },
  { valor: "Media", etiqueta: "Media" },
  { valor: "Alta", etiqueta: "Alta" },
];

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function CatalogoContenido() {
  const [dificultad, setDificultad] = useState<Dificultad | "Todas">("Todas");
  const [busqueda, setBusqueda] = useState("");
  const [rol, setRol] = useState<RolDemo>("anon");
  const parametros = useSearchParams();
  const router = useRouter();

  const idDetalle = Number(parametros.get("detalle"));
  const viajeSeleccionado = idDetalle
    ? viajes.find((viaje) => viaje.idViaje === idDetalle) ?? null
    : null;

  useEffect(() => {
    const actualizarRol = () => setRol(obtenerRolDemo());
    actualizarRol();
    window.addEventListener(EVENTO_SESION_DEMO, actualizarRol);
    return () => window.removeEventListener(EVENTO_SESION_DEMO, actualizarRol);
  }, []);

  const viajesFiltrados = useMemo(() => {
    const consulta = normalizar(busqueda.trim());
    return viajes.filter(
      (viaje) =>
        (dificultad === "Todas" || viaje.dificultad === dificultad) &&
        (consulta === "" ||
          normalizar(`${viaje.titulo} ${viaje.descripcion}`).includes(
            consulta,
          )),
    );
  }, [dificultad, busqueda]);

  const esCliente = rol === "client";

  return (
    <section className="bg-deep px-6 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <div
            aria-hidden="true"
            className="mx-auto h-1 w-12 rounded-full bg-ochre"
          />
          <h1 className="mt-4 font-serif text-3xl font-bold text-sand md:text-4xl">
            Nuestras Expediciones
          </h1>
          <p className="mt-4 leading-relaxed text-sand/65">
            Explora las montañas y volcanes de la región. Cada viaje incluye
            guía experta, transporte y el equipo organizativo del club.
          </p>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-5 md:flex-row md:items-start">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-sand/60">
              Filtrar por dificultad
            </p>
            <div
              role="group"
              aria-label="Filtrar por dificultad"
              className="inline-flex rounded-md bg-white/10 p-1 ring-1 ring-sand/15"
            >
              {filtros.map((filtro) => (
                <button
                  key={filtro.valor}
                  type="button"
                  onClick={() => setDificultad(filtro.valor)}
                  className={
                    dificultad === filtro.valor
                      ? "rounded bg-sand px-4 py-2 text-sm font-medium text-navy"
                      : "rounded px-4 py-2 text-sm font-medium text-sand/60 transition hover:text-sand"
                  }
                >
                  {filtro.etiqueta}
                </button>
              ))}
            </div>
          </div>

          <div className="relative w-full max-w-xs">
            <svg
              viewBox="0 0 24 24"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sand/50"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="search"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
              placeholder="Buscar destino..."
              className="w-full rounded-md border border-sand/20 bg-white/10 py-3 pl-9 pr-4 text-sm text-sand outline-none transition placeholder:text-sand/40 focus:border-clay focus:ring-1 focus:ring-clay"
            />
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {viajesFiltrados.map((viaje) => (
            <ViajeCard
              key={viaje.idViaje}
              viaje={viaje}
              onVerDetalle={() =>
                router.replace(`/viajes?detalle=${viaje.idViaje}`, {
                  scroll: false,
                })
              }
              estadoInscripcion={
                esCliente ? estadoInscripcionesDemo[viaje.idViaje] : undefined
              }
              esNuevo={esCliente && idViajesNuevosDemo.has(viaje.idViaje)}
            />
          ))}
        </div>

        {viajesFiltrados.length === 0 ? (
          <p className="mt-12 text-center text-sand/60">
            No hay viajes que coincidan con tu búsqueda.
          </p>
        ) : null}
      </div>

      <ModalFicha
        viaje={viajeSeleccionado}
        onCerrar={() => router.replace("/viajes", { scroll: false })}
        estadoInscripcion={
          esCliente && viajeSeleccionado
            ? estadoInscripcionesDemo[viajeSeleccionado.idViaje]
            : undefined
        }
        puedeReservar={
          esCliente &&
          viajeSeleccionado != null &&
          estadoInscripcionesDemo[viajeSeleccionado.idViaje] === undefined
        }
      />
    </section>
  );
}

export default function CatalogoPage() {
  return (
    <Suspense fallback={null}>
      <CatalogoContenido />
    </Suspense>
  );
}