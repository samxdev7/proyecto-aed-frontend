"use client";

import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";

interface TemporizadorRetencionProps {
  /** ISO de fechaLimitePago (del borrador local o de la reserva real). */
  fechaLimite: string;
  /** Opcional: avisa al padre para deshabilitar acciones al llegar a 0. */
  alExpirar?: () => void;
}

/** Cuenta regresiva de la ventana de pago; al llegar a 0 muestra "Tiempo agotado". */
export default function TemporizadorRetencion({
  fechaLimite,
  alExpirar,
}: TemporizadorRetencionProps) {
  const [restanteMs, setRestanteMs] = useState(
    () => new Date(fechaLimite).getTime() - Date.now(),
  );
  const [expirado, setExpirado] = useState(
    () => new Date(fechaLimite).getTime() <= Date.now(),
  );
  const refExpirar = useRef(alExpirar);

  useEffect(() => {
    refExpirar.current = alExpirar;
  });

  useEffect(() => {
    if (expirado) return;
    const timer = setInterval(() => {
      const restante = new Date(fechaLimite).getTime() - Date.now();
      if (restante <= 0) {
        clearInterval(timer);
        setRestanteMs(0);
        setExpirado(true);
        refExpirar.current?.();
      } else {
        setRestanteMs(restante);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [fechaLimite, expirado]);

  if (expirado) {
    return (
      <p
        role="alert"
        className="rounded-md bg-estado-rechazada-bg px-md py-sm text-center text-sm font-semibold text-estado-rechazada-text"
      >
        Tiempo agotado
      </p>
    );
  }

  const totalSegundos = Math.max(0, Math.ceil(restanteMs / 1000));
  const minutos = String(Math.floor(totalSegundos / 60)).padStart(2, "0");
  const segundos = String(totalSegundos % 60).padStart(2, "0");

  return (
    <p
      role="timer"
      className="flex items-center justify-center gap-xs rounded-md bg-warning-bg px-md py-sm text-sm font-semibold text-warning-text"
    >
      <Clock size={16} aria-hidden="true" />
      Tu cupo queda retenido por {minutos}:{segundos}
    </p>
  );
}
