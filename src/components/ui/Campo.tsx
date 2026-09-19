"use client";

interface CampoProps {
  label: string;
  tipo?: string;
  placeholder?: string;
  multilinea?: boolean;
  valor?: string;
  alCambiar?: (valor: string) => void;
}

export default function Campo({
  label,
  tipo = "text",
  placeholder,
  multilinea = false,
  valor,
  alCambiar,
}: CampoProps) {
  const clases =
    "w-full rounded-md border border-ink/15 bg-sand/50 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink/40 focus:border-clay focus:ring-1 focus:ring-clay";

  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-ink/70">{label}</span>
      {multilinea ? (
        <textarea
          rows={4}
          placeholder={placeholder}
          value={valor}
          onChange={(evento) => alCambiar?.(evento.target.value)}
          className={`${clases} resize-none`}
        />
      ) : (
        <input
          type={tipo}
          placeholder={placeholder}
          value={valor}
          onChange={(evento) => alCambiar?.(evento.target.value)}
          className={clases}
        />
      )}
    </label>
  );
}