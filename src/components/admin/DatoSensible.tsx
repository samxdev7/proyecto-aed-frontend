"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface DatoSensibleProps {
  valor?: string | null;
  /** Caracteres visibles al final de la máscara; 0 enmascara todo (montos). */
  ultimos?: number;
  /** true en detalle/modal: botón de ojo que revela/oculta. false en listados: máscara fija. */
  interactivo?: boolean;
  className?: string;
  fallback?: string;
}

/**
 * Enmascara de forma segura cadenas de texto evitando errores en tiempo de ejecución
 * si el dato es nulo, indefinido o vacío.
 */
export function enmascararDato(
  valor?: string | null,
  ultimos = 4,
  fallback = "—"
): { enmascarado: string; esValido: boolean; valorLimpio: string } {
  if (valor == null) {
    return { enmascarado: fallback, esValido: false, valorLimpio: "" };
  }
  const valorLimpio = typeof valor === "string" ? valor.trim() : String(valor).trim();
  if (!valorLimpio || valorLimpio === "null" || valorLimpio === "undefined") {
    return { enmascarado: fallback, esValido: false, valorLimpio: "" };
  }

  const digitos = Math.max(0, ultimos);
  const enmascarado = digitos > 0 ? `••••${valorLimpio.slice(-digitos)}` : "••••";
  return { enmascarado, esValido: true, valorLimpio };
}

/** Dato sensible (monto, referencia, correo, cédula): enmascarado por defecto. */
export default function DatoSensible({
  valor,
  ultimos = 4,
  interactivo = false,
  className = "",
  fallback = "—",
}: DatoSensibleProps) {
  const [visible, setVisible] = useState(false);
  const { enmascarado, esValido, valorLimpio } = enmascararDato(valor, ultimos, fallback);

  if (!esValido) {
    return <span className={className}>{fallback}</span>;
  }

  if (!interactivo) {
    return <span className={className}>{enmascarado}</span>;
  }

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span>{visible ? valorLimpio : enmascarado}</span>
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
