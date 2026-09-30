import Image from "next/image";
import { Mountain } from "lucide-react";

/** Placeholder blur local (SVG tiny inline como data-URI; nada externo). */
const BLUR_DATA_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%23f2ebe0'/%3E%3C/svg%3E";

interface GaleriaViajeProps {
  /** Lista preparada para varias fotos; hoy cada viaje trae una sola. */
  imagenes: string[];
  titulo: string;
}

export default function GaleriaViaje({ imagenes, titulo }: GaleriaViajeProps) {
  if (imagenes.length === 0) {
    return (
      <div className="flex aspect-[16/9] items-center justify-center rounded-lg border border-neutral-border bg-sand text-text-muted">
        <Mountain size={56} aria-hidden="true" />
      </div>
    );
  }

  const [principal, ...secundarias] = imagenes;

  return (
    <div className="space-y-sm">
      <div className="relative aspect-[16/9] overflow-hidden rounded-lg border border-neutral-border bg-sand">
        <Image
          src={principal}
          alt={titulo}
          fill
          sizes="100vw"
          priority
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          className="object-cover"
        />
      </div>
      {secundarias.length > 0 ? (
        <div className="grid grid-cols-3 gap-sm sm:grid-cols-4">
          {secundarias.map((imagen, indice) => (
            <div
              key={imagen}
              className="relative aspect-[4/3] overflow-hidden rounded-md border border-neutral-border bg-sand"
            >
              <Image
                src={imagen}
                alt={`${titulo} — foto ${indice + 2}`}
                fill
                sizes="(min-width: 640px) 25vw, 33vw"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                className="object-cover"
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
