"use client";

import Boton from "@/components/ui/Boton";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-sm px-lg text-center">
      <h2 className="text-xl font-bold text-primary">Algo salió mal</h2>
      <p className="max-w-md text-sm text-text-muted">
        No pudimos cargar esta sección. Inténtalo nuevamente.
      </p>
      <Boton onClick={reset} tamano="sm" className="mt-sm">
        Reintentar
      </Boton>
    </div>
  );
}
