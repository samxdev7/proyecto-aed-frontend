"use client";

import { useEffect, useRef } from "react";

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

  useEffect(() => {
    onCerrarRef.current = onCerrar;
  }, [onCerrar]);

  useEffect(() => {
    if (!abierto) return;
    const alPresionar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") onCerrarRef.current();
    };
    document.addEventListener("keydown", alPresionar);
    document.body.style.overflow = "hidden";

    // Solo enfocar el panel al abrir si ningún elemento hijo ya tiene el foco
    if (panelRef.current && !panelRef.current.contains(document.activeElement)) {
      panelRef.current.focus();
    }

    return () => {
      document.removeEventListener("keydown", alPresionar);
      document.body.style.overflow = "";
    };
  }, [abierto]);

  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-md backdrop-blur-sm"
      onClick={onCerrar}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className={`max-h-[90vh] w-full overflow-y-auto rounded-lg bg-surface shadow-xl ring-1 ring-neutral-border outline-none ${className}`}
        onClick={(evento) => evento.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
