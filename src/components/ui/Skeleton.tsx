interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`animate-pulse rounded bg-surface-alt ${className}`} />;
}

/** Esqueleto de tarjeta de viaje: imagen aspect 4/3 + líneas de texto. */
export function TarjetaViajeSkeleton() {
  return (
    <div className="overflow-hidden rounded-md border border-neutral-border bg-surface">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="space-y-sm p-md">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center justify-between pt-sm">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </div>
  );
}

/** Filas de esqueleto para tablas: colocar como <tbody> dentro de <table>. */
export function FilaTablaSkeleton({
  columnas = 5,
  filas = 5,
}: {
  columnas?: number;
  filas?: number;
}) {
  return (
    <tbody className="divide-y divide-neutral-border">
      {Array.from({ length: filas }, (_, fila) => (
        <tr key={fila}>
          {Array.from({ length: columnas }, (_, col) => (
            <td key={col} className="p-md">
              <Skeleton className="h-4 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

/** Esqueleto de detalle con galería: imagen grande + panel lateral. */
export function DetalleShowcaseSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-lg px-lg py-lg">
      <Skeleton className="h-4 w-32" />
      <div className="grid grid-cols-1 gap-lg lg:grid-cols-3">
        <div className="space-y-md lg:col-span-2">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="aspect-[16/9] w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="space-y-md rounded-md border border-neutral-border bg-surface p-lg">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}
