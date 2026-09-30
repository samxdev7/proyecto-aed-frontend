"use client";

import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";

interface TemporizadorRetencionProps {
  /** ISO de fechaLimitePago del borrador. */
  fechaLimite: string;
  alExpirar: () => void;
}

/** Cuenta regresiva de la retención del cupo (30 min desde el borrador). */
export default function TemporizadorRetencion({
  fechaLimite,
  alExpirar,
}: TemporizadorRetencionProps) {
  const [restanteMs, setRestanteMs] = useState(
    () => new Date(fechaLimite).getTime() - Date.now(),
  );
  const refExpirar = useRef(alExpirar);

  useEffect(() => {
    refExpirar.current = alExpirar;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const restante = new Date(fechaLimite).getTime() - Date.now();
      setRestanteMs(restante);
      if (restante <= 0) {
        clearInterval(timer);
        refExpirar.current();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [fechaLimite]);

  const totalSegundos = Math.max(0, Math.ceil(restanteMs / 1000));
  const minutos = String(Math.floor(totalSegundos / 60)).padStart(2, "0");
  const segundos = String(totalSegundos % 60).padStart(2, "0");

  return (
    <p
      role="timer"
      className="flex items-center justify-center gap-2 rounded-md bg-warning-bg px-4 py-2 text-sm font-semibold text-warning-text"
    >
      <Clock size={16} aria-hidden="true" />
      Tu cupo queda retenido por {minutos}:{segundos}
    </p>
  );
}
