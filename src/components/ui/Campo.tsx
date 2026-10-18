"use client";

import { useId } from "react";

interface CampoProps {
  label: string;
  tipo?: string;
  placeholder?: string;
  multilinea?: boolean;
  /** Renderiza un <select> con estas opciones. */
  opciones?: string[];
  error?: string;
  hint?: string;
  required?: boolean;
  /** required sin el asterisco rojo junto al label (p. ej. login). */
  ocultarAsterisco?: boolean;
  disabled?: boolean;
  valor?: string;
  alCambiar?: (valor: string) => void;
  /** Llamada cuando el campo pierde el foco (para validación inline). */
  onBlur?: () => void;
  /** Props adicionales pasados directamente al elemento input (p.ej. min, step, onKeyDown). */
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  id?: string;
  name?: string;
}

export default function Campo({
  label,
  tipo = "text",
  placeholder,
  multilinea = false,
  opciones,
  error,
  hint,
  required = false,
  ocultarAsterisco = false,
  disabled = false,
  valor,
  alCambiar,
  onBlur,
  inputProps,
  id,
  name,
}: CampoProps) {
  const idGenerado = useId();
  const campoId = id ?? idGenerado;

  const clases = `w-full rounded-sm border bg-surface px-4 py-3 text-sm text-text-main outline-none transition placeholder:text-text-muted disabled:bg-surface-alt disabled:text-text-muted ${
    error
      ? "border-error focus:border-error focus:ring-1 focus:ring-error"
      : "border-neutral-border focus:border-primary focus:ring-1 focus:ring-primary"
  }`;

  const controlProps = {
    id: campoId,
    name: name ?? campoId,
    placeholder,
    value: valor ?? "",
    disabled,
    required,
    onBlur,
    onChange: (
      evento: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => alCambiar?.(evento.target.value),
  };

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={campoId}
        className="text-xs font-semibold text-text-muted"
      >
        {label}
        {required && !ocultarAsterisco ? (
          <span className="text-error" aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
      </label>
      {opciones ? (
        <select {...controlProps} className={clases}>
          {opciones.map((opcion) => (
            <option key={opcion} value={opcion}>
              {opcion}
            </option>
          ))}
        </select>
      ) : multilinea ? (
        <textarea rows={4} {...controlProps} className={`${clases} resize-none`} />
      ) : (
        <input type={tipo} {...controlProps} {...inputProps} className={clases} />
      )}
      {error ? (
        <p className="text-xs text-error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
