"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
} from "lucide-react";

export type TipoMensaje = "exito" | "error" | "advertencia" | "info";

export interface AccionMensaje {
  texto: string;
  onClick: () => void;
}

export interface MensajePopup {
  id: string;
  tipo: TipoMensaje;
  titulo: string;
  mensaje?: string;
  causa?: string;
  /** Duración en milisegundos antes de auto-cerrarse. Por defecto 5000ms. Si es null o <= 0, no se auto-cierra. */
  duracionMs?: number | null;
  accion?: AccionMensaje;
}

export interface MensajesContextType {
  mensajes: MensajePopup[];
  mostrarMensaje: (mensaje: Omit<MensajePopup, "id">) => string;
  mostrarExito: (
    titulo: string,
    mensajeOCausa?: string,
    duracionMs?: number | null
  ) => string;
  mostrarError: (
    titulo: string,
    mensajeOCausa?: string,
    duracionMs?: number | null
  ) => string;
  mostrarAdvertencia: (
    titulo: string,
    mensajeOCausa?: string,
    duracionMs?: number | null
  ) => string;
  mostrarInfo: (
    titulo: string,
    mensajeOCausa?: string,
    duracionMs?: number | null
  ) => string;
  removerMensaje: (id: string) => void;
  limpiarMensajes: () => void;
}

const MensajesContext = createContext<MensajesContextType | null>(null);

let contadorId = 0;
function generarId(): string {
  contadorId += 1;
  return `popup-msg-${Date.now()}-${contadorId}`;
}

const DURACION_DEFECTO_MS = 5000;

export function MensajesProvider({ children }: { children: React.ReactNode }) {
  const [mensajes, setMensajes] = useState<MensajePopup[]>([]);
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
    return () => setMontado(false);
  }, []);

  const removerMensaje = useCallback((id: string) => {
    setMensajes((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const limpiarMensajes = useCallback(() => {
    setMensajes([]);
  }, []);

  const mostrarMensaje = useCallback(
    (nuevo: Omit<MensajePopup, "id">): string => {
      const id = generarId();
      const popup: MensajePopup = {
        id,
        duracionMs:
          nuevo.duracionMs !== undefined ? nuevo.duracionMs : DURACION_DEFECTO_MS,
        ...nuevo,
      };

      setMensajes((prev) => [...prev, popup]);
      return id;
    },
    []
  );

  const mostrarExito = useCallback(
    (titulo: string, mensajeOCausa?: string, duracionMs?: number | null) => {
      return mostrarMensaje({
        tipo: "exito",
        titulo,
        mensaje: mensajeOCausa,
        duracionMs,
      });
    },
    [mostrarMensaje]
  );

  const mostrarError = useCallback(
    (titulo: string, mensajeOCausa?: string, duracionMs?: number | null) => {
      return mostrarMensaje({
        tipo: "error",
        titulo,
        mensaje: mensajeOCausa,
        duracionMs,
      });
    },
    [mostrarMensaje]
  );

  const mostrarAdvertencia = useCallback(
    (titulo: string, mensajeOCausa?: string, duracionMs?: number | null) => {
      return mostrarMensaje({
        tipo: "advertencia",
        titulo,
        mensaje: mensajeOCausa,
        duracionMs,
      });
    },
    [mostrarMensaje]
  );

  const mostrarInfo = useCallback(
    (titulo: string, mensajeOCausa?: string, duracionMs?: number | null) => {
      return mostrarMensaje({
        tipo: "info",
        titulo,
        mensaje: mensajeOCausa,
        duracionMs,
      });
    },
    [mostrarMensaje]
  );

  return (
    <MensajesContext.Provider
      value={{
        mensajes,
        mostrarMensaje,
        mostrarExito,
        mostrarError,
        mostrarAdvertencia,
        mostrarInfo,
        removerMensaje,
        limpiarMensajes,
      }}
    >
      {children}
      {montado && typeof document !== "undefined"
        ? createPortal(
            <ContenedorPopups
              mensajes={mensajes}
              onCerrar={removerMensaje}
            />,
            document.body
          )
        : null}
    </MensajesContext.Provider>
  );
}

export function useMensajes(): MensajesContextType {
  const ctx = useContext(MensajesContext);
  if (!ctx) {
    throw new Error("useMensajes debe usarse dentro de un <MensajesProvider>");
  }
  return ctx;
}

interface ContenedorPopupsProps {
  mensajes: MensajePopup[];
  onCerrar: (id: string) => void;
}

function ContenedorPopups({ mensajes, onCerrar }: ContenedorPopupsProps) {
  if (mensajes.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2.5 px-3 pointer-events-none sm:right-6 sm:top-6 sm:max-w-md sm:px-0"
    >
      {mensajes.map((m) => (
        <TarjetaPopup key={m.id} mensaje={m} onCerrar={() => onCerrar(m.id)} />
      ))}
    </div>
  );
}

const configPorTipo: Record<
  TipoMensaje,
  {
    borde: string;
    bgIcono: string;
    colorIcono: string;
    icono: typeof CheckCircle2;
    ariaRole: "status" | "alert";
  }
> = {
  exito: {
    borde: "border-l-4 border-l-success",
    bgIcono: "bg-estado-aprobada-bg text-estado-aprobada-text",
    colorIcono: "text-success",
    icono: CheckCircle2,
    ariaRole: "status",
  },
  error: {
    borde: "border-l-4 border-l-error",
    bgIcono: "bg-estado-rechazada-bg text-estado-rechazada-text",
    colorIcono: "text-error",
    icono: XCircle,
    ariaRole: "alert",
  },
  advertencia: {
    borde: "border-l-4 border-l-warning",
    bgIcono: "bg-warning-bg text-warning-text",
    colorIcono: "text-warning",
    icono: AlertTriangle,
    ariaRole: "alert",
  },
  info: {
    borde: "border-l-4 border-l-primary",
    bgIcono: "bg-sand text-navy",
    colorIcono: "text-primary",
    icono: Info,
    ariaRole: "status",
  },
};

function TarjetaPopup({
  mensaje,
  onCerrar,
}: {
  mensaje: MensajePopup;
  onCerrar: () => void;
}) {
  const config = configPorTipo[mensaje.tipo] || configPorTipo.info;
  const Icono = config.icono;
  const onCerrarRef = useRef(onCerrar);

  useEffect(() => {
    onCerrarRef.current = onCerrar;
  }, [onCerrar]);

  useEffect(() => {
    if (!mensaje.duracionMs || mensaje.duracionMs <= 0) return;
    const temporizador = setTimeout(() => {
      onCerrarRef.current();
    }, mensaje.duracionMs);

    return () => clearTimeout(temporizador);
  }, [mensaje.duracionMs]);

  const textoDetalle = mensaje.mensaje || mensaje.causa;

  return (
    <div
      role={config.ariaRole}
      className={`pointer-events-auto relative flex w-full items-start gap-3 rounded-lg border border-neutral-border bg-surface p-4 shadow-xl ring-1 ring-black/5 transition-all animate-in fade-in slide-in-from-top-3 ${config.borde}`}
    >
      <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${config.bgIcono}`}>
        <Icono size={18} className="shrink-0" aria-hidden="true" />
      </div>

      <div className="flex-1 pr-2">
        <p className="text-sm font-bold text-text-main leading-tight">
          {mensaje.titulo}
        </p>
        {textoDetalle ? (
          <p className="mt-1 text-xs text-text-muted leading-relaxed">
            {textoDetalle}
          </p>
        ) : null}

        {mensaje.accion ? (
          <div className="mt-2.5">
            <button
              type="button"
              onClick={() => {
                mensaje.accion?.onClick();
                onCerrar();
              }}
              className="inline-flex items-center justify-center rounded bg-primary px-3 py-1 text-xs font-semibold text-white shadow-xs transition hover:bg-primary-dark"
            >
              {mensaje.accion.texto}
            </button>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onCerrar}
        aria-label="Cerrar notificación"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-text-muted transition hover:bg-surface-alt hover:text-text-main"
      >
        <X size={15} aria-hidden="true" />
      </button>
    </div>
  );
}
