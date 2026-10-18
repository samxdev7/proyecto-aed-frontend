"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  abierto: boolean;
  onCerrar: () => void;
  titulo: string;
  children: React.ReactNode;
  /** Clases extra del panel (ancho, padding). Sin padding por defecto. */
  className?: string;
}

export default function Modal({
  abierto,
  onCerrar,
  titulo,
  children,
  className = "max-w-2xl",
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCerrarRef = useRef(onCerrar);
  // Portal a <body>: sin ancestros con transform/sticky que rompan el `fixed`
  // y dejen el blur cortado en pantallas con scroll.
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMontado(true);
    return () => setMontado(false);
  }, []);

  useEffect(() => {
    onCerrarRef.current = onCerrar;
  }, [onCerrar]);

  useEffect(() => {
    if (!abierto) return;
    const alPresionar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") onCerrarRef.current();
    };
    document.addEventListener("keydown", alPresionar);
    const html = document.documentElement;
    const body = document.body;
    const overflowPrevioHtml = html.style.overflow;
    const overflowPrevioBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    // Solo enfocar el panel al abrir si ningún elemento hijo ya tiene el foco
    if (panelRef.current && !panelRef.current.contains(document.activeElement)) {
      panelRef.current.focus();
    }

    return () => {
      document.removeEventListener("keydown", alPresionar);
      html.style.overflow = overflowPrevioHtml;
      body.style.overflow = overflowPrevioBody;
    };
  }, [abierto]);

  if (!abierto || !montado) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-md backdrop-blur-sm"
      style={{ backdropFilter: "blur(4px)" }}
      onClick={onCerrar}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className={`relative max-h-[90vh] w-full overflow-y-auto rounded-lg bg-surface shadow-xl ring-1 ring-neutral-border outline-none ${className}`}
        onClick={(evento) => evento.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
