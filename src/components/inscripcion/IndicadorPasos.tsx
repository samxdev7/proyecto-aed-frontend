"use client";

const PASOS = ["Cupos", "Tus datos", "Pago", "Confirmación"];

export default function IndicadorPasos({ actual }: { actual: number }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Pasos de la reserva">
      {PASOS.map((nombre, indice) => {
        const numero = indice + 1;
        const activo = numero === actual;
        const hecho = numero < actual;
        return (
          <li
            key={nombre}
            aria-current={activo ? "step" : undefined}
            className="flex flex-1 items-center gap-2 last:flex-none"
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                activo
                  ? "bg-clay text-white"
                  : hecho
                    ? "bg-primary text-sand"
                    : "bg-surface-alt text-text-muted"
              }`}
            >
              {numero}
            </span>
            <span
              className={`hidden text-xs sm:block ${
                activo ? "font-semibold text-primary" : "text-text-muted"
              }`}
            >
              {nombre}
            </span>
            {indice < PASOS.length - 1 ? (
              <span className="h-px flex-1 bg-neutral-border" aria-hidden="true" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
