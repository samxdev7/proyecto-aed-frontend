import Link from "next/link";
import { notFound } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { Calendar, ChevronLeft, MapPin, Users } from "lucide-react";
import { viajesService } from "@/services/viajes.service";
import GaleriaViaje from "@/components/viajes/GaleriaViaje";
import BotonReservar from "@/components/viajes/BotonReservar";
import Boton from "@/components/ui/Boton";
import { ChipDificultad } from "@/components/ui/Chip";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";
import { formatoCordobas, formatoFecha, formatoHora } from "@/lib/format";

interface ViajeDetallePageProps {
  params: Promise<{ id: string }>;
}

export default async function ViajeDetallePage({ params }: ViajeDetallePageProps) {
  const { id } = await params;
  const viaje = await viajesService.obtenerViaje(Number(id));
  if (!viaje) notFound();

  const inscripcionAbierta =
    viaje.estado === "activo" && viaje.cuposDisponibles > 0;
  const ultimosCupos = inscripcionAbierta && viaje.cuposDisponibles <= 2;

  return (
    <div className="mx-auto max-w-6xl space-y-lg px-4 py-md sm:px-6 md:px-lg md:py-lg">
      <Link
        href="/viajes"
        className="inline-flex items-center gap-xs text-sm font-medium text-text-muted transition-colors hover:text-primary"
      >
        <ChevronLeft size={16} /> Volver al catálogo
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="space-y-lg lg:col-span-2">
          <GaleriaViaje
            imagenes={viaje.imagenUrl ? [viaje.imagenUrl] : []}
            titulo={viaje.titulo}
          />

          <div className="space-y-xs">
            <div className="flex flex-wrap items-center gap-sm">
              <h1 className="font-serif text-3xl font-bold tracking-tight text-primary">
                {viaje.titulo}
              </h1>
              <ChipDificultad dificultad={viaje.dificultad} />
            </div>
            {viaje.descripcion ? (
              <div className="pt-2">
                <MarkdownRenderer contenido={viaje.descripcion} />
              </div>
            ) : null}
          </div>
        </div>

        <aside className="self-start space-y-md rounded-md border border-neutral-border bg-surface p-5 sm:p-6 shadow-sm lg:sticky lg:top-lg">
          <div className="space-y-xs">
            <span className="text-xs font-bold uppercase tracking-wide text-text-muted">
              Costo Total
            </span>
            <p className="text-3xl font-bold text-primary whitespace-nowrap">
              {formatoCordobas(viaje.montoTotal)}
            </p>
          </div>

          <div className="space-y-1.5 rounded-sm border border-neutral-border bg-sand p-3.5 sm:p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-primary">
                Abono para reservar
              </span>
              <span className="text-base sm:text-lg font-bold text-primary whitespace-nowrap shrink-0">
                {formatoCordobas(viaje.montoReserva)}
              </span>
            </div>
            <p className="text-xs leading-normal text-text-muted">
              El monto restante se cancela antes de la salida.
            </p>
          </div>

          <div className="space-y-sm border-t border-neutral-border pt-md">
            <FilaDato
              icono={Calendar}
              etiqueta="Salida"
              valor={`${formatoFecha(viaje.fechaHoraIda)}, ${formatoHora(viaje.fechaHoraIda)}`}
            />
            <FilaDato
              icono={Calendar}
              etiqueta="Regreso"
              valor={`${formatoFecha(viaje.fechaHoraVuelta)}, ${formatoHora(viaje.fechaHoraVuelta)}`}
            />
            <FilaDato
              icono={MapPin}
              etiqueta="Punto de encuentro"
              valor={viaje.puntoEncuentro}
            />
          </div>

          <div className="space-y-xs rounded-sm border border-neutral-border bg-surface-alt p-sm">
            <div className="flex items-center justify-between gap-xs">
              <span className="flex items-center gap-xs text-xs font-bold uppercase text-text-muted">
                <Users size={14} aria-hidden="true" /> Cupos
              </span>
              {ultimosCupos ? (
                <span className="rounded-sm bg-warning-bg px-2 py-1 text-xs font-medium text-warning-text">
                  ¡Últimos cupos!
                </span>
              ) : null}
            </div>
            <p className="text-sm font-medium text-text-main">
              {viaje.cuposDisponibles} de {viaje.cuposMaximos} cupos
              disponibles
            </p>
          </div>

          {inscripcionAbierta ? (
            <BotonReservar idViaje={viaje.idViaje} />
          ) : (
            <Boton disabled fullWidth>
              {viaje.estado === "activo"
                ? "Sin cupos disponibles"
                : "Inscripciones cerradas"}
            </Boton>
          )}

          <p className="text-center text-[10px] text-text-muted">
            Al inscribirte, aceptas los términos y condiciones del club.
          </p>
        </aside>
      </div>
    </div>
  );
}

function FilaDato({
  icono: Icono,
  etiqueta,
  valor,
}: {
  icono: LucideIcon;
  etiqueta: string;
  valor: string;
}) {
  return (
    <div className="flex items-start gap-sm">
      <div className="rounded-sm bg-sand p-xs text-primary">
        <Icono size={18} aria-hidden="true" />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase text-text-muted">
          {etiqueta}
        </span>
        <span className="text-sm font-medium text-text-main">{valor}</span>
      </div>
    </div>
  );
}
