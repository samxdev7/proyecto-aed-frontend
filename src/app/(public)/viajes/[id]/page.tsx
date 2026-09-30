import Link from "next/link";
import { notFound } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { Calendar, Check, ChevronLeft, MapPin, Users } from "lucide-react";
import { viajesService } from "@/services/viajes.service";
import GaleriaViaje from "@/components/viajes/GaleriaViaje";
import Boton from "@/components/ui/Boton";
import { ChipDificultad } from "@/components/ui/Chip";
import {
  formatoCordobas,
  formatoFecha,
  formatoUSDAproximado,
} from "@/lib/format";

interface ViajeDetallePageProps {
  params: Promise<{ id: string }>;
}

export default async function ViajeDetallePage({ params }: ViajeDetallePageProps) {
  const { id } = await params;
  const viaje = await viajesService.obtenerViaje(Number(id));
  if (!viaje) notFound();

  const imagenes = viaje.imagen ? [viaje.imagen] : [];
  const hayCupos = viaje.cuposDisponibles > 0;
  const ultimosCupos = hayCupos && viaje.cuposDisponibles <= 2;

  return (
    <div className="max-w-5xl mx-auto px-lg py-lg space-y-lg">
      <Link
        href="/viajes"
        className="inline-flex items-center gap-xs text-sm font-medium text-text-muted hover:text-primary transition-colors"
      >
        <ChevronLeft size={16} /> Volver al catálogo
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        <div className="lg:col-span-2 space-y-lg">
          <GaleriaViaje imagenes={imagenes} titulo={viaje.titulo} />

          <div className="space-y-xs">
            <div className="flex flex-wrap items-center gap-sm">
              <h1 className="text-3xl font-bold text-primary font-serif tracking-tight">
                {viaje.titulo}
              </h1>
              <ChipDificultad dificultad={viaje.dificultad} />
            </div>
            <p className="text-base text-text-muted leading-relaxed">
              {viaje.descripcion}
            </p>
          </div>

          <section className="space-y-md">
            <h2 className="text-xl font-bold text-primary">Itinerario</h2>
            <ol className="space-y-sm">
              {viaje.itinerario.map((paso, i) => (
                <li
                  key={paso}
                  className="flex gap-sm p-sm bg-surface-alt rounded-sm border-l-4 border-primary"
                >
                  <span className="text-sm font-bold text-primary min-w-[1.5rem]">{i + 1}.</span>
                  <span className="text-sm text-text-main">{paso}</span>
                </li>
              ))}
            </ol>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <section className="space-y-md">
              <h2 className="text-xl font-bold text-primary">Qué incluye</h2>
              <ul className="space-y-xs">
                {viaje.inclusiones.map((item) => (
                  <li key={item} className="flex items-start gap-xs text-sm text-text-main">
                    <Check size={16} className="mt-0.5 shrink-0 text-success" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
            <section className="space-y-md">
              <h2 className="text-xl font-bold text-primary">Equipo recomendado</h2>
              <ul className="space-y-xs">
                {viaje.equipo.map((item) => (
                  <li key={item} className="flex items-start gap-xs text-sm text-text-main">
                    {/* punto: radio completo justificado (viñeta) */}
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        <aside className="space-y-md self-start bg-surface p-lg rounded-md border border-neutral-border shadow-sm lg:sticky lg:top-lg">
          <div className="space-y-xs">
            <span className="text-xs font-bold text-text-muted uppercase">Inversión Total</span>
            <p className="text-3xl font-bold text-primary">
              {formatoCordobas(viaje.montoTotal)}
            </p>
            <p className="text-xs text-text-muted">
              {formatoUSDAproximado(viaje.montoTotal)}
            </p>
          </div>

          <div className="p-sm bg-sand rounded-sm border border-neutral-border space-y-xs">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-primary">Abono para reservar</span>
              <span className="text-sm font-bold text-primary">
                {formatoCordobas(viaje.montoReserva)}
              </span>
            </div>
            <p className="text-[10px] text-text-muted leading-tight">
              El monto restante se cancela antes de la salida.
            </p>
          </div>

          <div className="space-y-sm border-t border-neutral-border pt-md">
            <FilaDato icono={Calendar} etiqueta="Salida" valor={formatoFecha(viaje.fechaHoraIda)} />
            <FilaDato
              icono={Calendar}
              etiqueta="Regreso"
              valor={
                viaje.fechaHoraVuelta
                  ? formatoFecha(viaje.fechaHoraVuelta)
                  : "Misma jornada"
              }
            />
            <FilaDato icono={MapPin} etiqueta="Punto de encuentro" valor={viaje.puntoEncuentro} />
          </div>

          <div className="space-y-xs p-sm bg-surface-alt rounded-sm border border-neutral-border">
            <div className="flex items-center justify-between gap-xs">
              <span className="flex items-center gap-xs text-xs font-bold text-text-muted uppercase">
                <Users size={14} aria-hidden="true" /> Cupos
              </span>
              {ultimosCupos ? (
                <span className="rounded-sm bg-warning-bg px-2 py-1 text-xs font-medium text-warning-text">
                  ¡Últimos cupos!
                </span>
              ) : null}
            </div>
            <p className="text-sm font-medium text-text-main">
              {viaje.cuposDisponibles} de {viaje.cuposMaximos} cupos disponibles
            </p>
          </div>

          {hayCupos ? (
            <Boton href={`/inscripcion/${viaje.idViaje}`} fullWidth>
              Inscribirme Ahora
            </Boton>
          ) : (
            <Boton disabled fullWidth>
              Sin cupos disponibles
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
      <div className="p-xs bg-sand text-primary rounded-sm">
        <Icono size={18} aria-hidden="true" />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-bold text-text-muted uppercase">{etiqueta}</span>
        <span className="text-sm font-medium text-text-main">{valor}</span>
      </div>
    </div>
  );
}
