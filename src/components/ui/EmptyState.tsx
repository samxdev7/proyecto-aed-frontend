import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import Boton from "@/components/ui/Boton";

interface EmptyStateProps {
  icono?: LucideIcon;
  titulo: string;
  descripcion?: string;
  /** CTA opcional: enlace o acción. */
  accion?: { etiqueta: string; href?: string; onClick?: () => void };
}

export default function EmptyState({
  icono: Icono = Inbox,
  titulo,
  descripcion,
  accion,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-sm rounded-md border border-dashed border-neutral-border bg-surface px-lg py-xl text-center">
      <div className="rounded-md bg-surface-alt p-sm text-text-muted">
        <Icono size={28} />
      </div>
      <h3 className="text-lg font-bold text-primary">{titulo}</h3>
      {descripcion ? (
        <p className="max-w-md text-sm text-text-muted">{descripcion}</p>
      ) : null}
      {accion ? (
        <Boton
          href={accion.href}
          onClick={accion.onClick}
          tamano="sm"
          className="mt-xs"
        >
          {accion.etiqueta}
        </Boton>
      ) : null}
    </div>
  );
}
