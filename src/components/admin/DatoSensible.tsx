"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface DatoSensibleProps {
  valor: string;
  /** Caracteres visibles al final de la máscara; 0 enmascara todo (montos). */
  ultimos?: number;
  /** true en detalle/modal: botón de ojo que revela/oculta. false en listados: máscara fija. */
  interactivo?: boolean;
  className?: string;
}

/** Dato sensible (monto, referencia, correo, cédula): enmascarado por defecto. */
export default function DatoSensible({
  valor,
  ultimos = 4,
  interactivo = false,
  className = "",
}: DatoSensibleProps) {
  const [visible, setVisible] = useState(false);
  const enmascarado = ultimos > 0 ? `••••${valor.slice(-ultimos)}` : "••••";

  if (!interactivo) {
    return <span className={className}>{enmascarado}</span>;
  }

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span>{visible ? valor : enmascarado}</span>
      <button
        type="button"
        onClick={() => setVisible((actual) => !actual)}
        className="text-admin-muted hover:text-admin-accent transition-colors"
        aria-label={visible ? "Ocultar dato" : "Mostrar dato"}
      >
        {visible ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </span>
  );
}
