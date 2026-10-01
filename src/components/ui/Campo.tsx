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
  disabled?: boolean;
  valor?: string;
  alCambiar?: (valor: string) => void;
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
  disabled = false,
  valor,
  alCambiar,
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
        {required ? (
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
        <input type={tipo} {...controlProps} className={clases} />
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
