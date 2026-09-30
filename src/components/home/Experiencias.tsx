"use client";

import { useState, type KeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import EncabezadoSeccion from "@/components/ui/EncabezadoSeccion";
import { experienciasPasadas } from "@/data/experiencias";

export default function Experiencias() {
  const [indice, setIndice] = useState(0);
  const total = experienciasPasadas.length;
  const experiencia = experienciasPasadas[indice];

  const siguiente = () => setIndice((actual) => (actual + 1) % total);
  const anterior = () => setIndice((actual) => (actual - 1 + total) % total);

  const manejarTeclado = (evento: KeyboardEvent<HTMLDivElement>) => {
    if (evento.key === "ArrowRight") {
      evento.preventDefault();
      siguiente();
    } else if (evento.key === "ArrowLeft") {
      evento.preventDefault();
      anterior();
    }
  };

  return (
    <section id="experiencias" className="bg-sand px-6 py-20 md:py-28">
      <div className="mx-auto max-w-4xl">
        <EncabezadoSeccion
          titulo="Así se vive una expedición"
          descripcion="Momentos de nuestras salidas anteriores"
        />

        <div className="relative mt-12 h-[420px] overflow-hidden rounded-lg bg-steel outline-none focus:ring-2 focus:ring-ochre/70 md:h-[580px]" role="region" aria-roledescription="carrusel" aria-label="Experiencias del club" tabIndex={0} onKeyDown={manejarTeclado}>
          <div aria-hidden="true" className="absolute inset-0">
            <Image
              src={experiencia.imagen}
              alt=""
              fill
              sizes="(min-width: 896px) 896px, 100vw"
              className="scale-110 object-cover blur-md"
            />
          </div>
          <Image
            key={experiencia.imagen}
            src={experiencia.imagen}
            alt={experiencia.lugar}
            fill
            sizes="(min-width: 896px) 896px, 100vw"
            className="z-[1] object-contain"
          />
          <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-navy/60 via-transparent to-transparent" />

          <button
            type="button"
            onClick={anterior}
            aria-label="Ver experiencia anterior"
            className="absolute left-5 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded border border-sand/50 bg-navy/40 text-sand backdrop-blur transition hover:bg-navy/70 md:left-8 md:h-14 md:w-14"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6 rotate-180"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14m-6-6 6 6-6 6" />
            </svg>
          </button>

          <button
            type="button"
            onClick={siguiente}
            aria-label="Ver siguiente experiencia"
            className="absolute right-5 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded border border-sand/50 bg-navy/40 text-sand backdrop-blur transition hover:bg-navy/70 md:right-8 md:h-14 md:w-14"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14m-6-6 6 6-6 6" />
            </svg>
          </button>

          <div
            key={`texto-${indice}-${experiencia.imagen}`}
            className="absolute bottom-8 left-6 z-10 rounded-lg bg-sand/95 px-5 py-3 shadow-md md:bottom-12 md:left-10"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-clay">
              Expedición
            </p>
            <p className="mt-0.5 font-serif text-lg font-bold text-navy md:text-xl">
              {experiencia.lugar}
            </p>
            <p className="mt-0.5 text-xs text-ink/60">{experiencia.detalle}</p>
          </div>

          <div className="absolute bottom-4 right-5 z-10 rounded-sm bg-navy/50 px-3 py-1 text-xs font-medium text-sand backdrop-blur md:right-8">
            {indice + 1} / {total}
          </div>

          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
            {experienciasPasadas.map((exp, posicion) => (
              <button
                key={posicion}
                type="button"
                onClick={() => setIndice(posicion)}
                aria-label={`Ver ${exp.lugar}`}
                className={
                  posicion === indice
                    ? "h-2.5 w-2.5 rounded-full bg-sand"
                    : "h-2.5 w-2.5 rounded-full bg-sand/40 transition hover:bg-sand/70"
                }
              />
            ))}
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/viajes"
            className="rounded-md bg-navy px-7 py-3 text-sm font-medium text-sand transition hover:bg-steel"
          >
            Ver próximas expediciones
          </Link>
        </div>
      </div>
    </section>
  );
}