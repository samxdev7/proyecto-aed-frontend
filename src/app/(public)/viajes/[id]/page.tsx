import Link from "next/link";
import { notFound } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { Calendar, Check, ChevronLeft, MapPin, Users } from "lucide-react";
import { splitLineas, viajesService } from "@/services/viajes.service";
import GaleriaViaje from "@/components/viajes/GaleriaViaje";
import Boton from "@/components/ui/Boton";
import { ChipDificultad } from "@/components/ui/Chip";
import { formatoCordobas, formatoFecha, formatoUSDAproximado } from "@/lib/format";

/**
 * Inclusiones base del club para toda expedición (el backend solo persiste
 * las adicionales del viaje). Copiada del servicio viejo de mock.
 */
const INCLUSIONES_BASE = [
  "Transporte ida y vuelta desde el punto de encuentro",
  "Guías del club durante toda la ruta",
  "Charla de seguridad y equipo comunitario",
  "Coordinación del grupo de WhatsApp del viaje",
];

interface ViajeDetallePageProps {
  params: Promise<{ id: string }>;
}

export default async function ViajeDetallePage({ params }: ViajeDetallePageProps) {
  const { id } = await params;
  const viaje = await viajesService.obtenerViaje(Number(id));
  if (!viaje) notFound();

  const itinerario = splitLineas(viaje.itinerario);
  const equipo = splitLineas(viaje.equipo);
  const inclusiones = [
    ...INCLUSIONES_BASE,
    ...splitLineas(viaje.inclusionesAdicionales),
  ];
  const inscripcionAbierta =
    viaje.estado === "activo" && viaje.cuposDisponibles > 0;
  const ultimosCupos = inscripcionAbierta && viaje.cuposDisponibles <= 2;

  return (
    <div className="mx-auto max-w-5xl space-y-lg px-lg py-lg">
      <Link
        href="/viajes"
        className="inline-flex items-center gap-xs text-sm font-medium text-text-muted transition-colors hover:text-primary"
      >
        <ChevronLeft size={16} /> Volver al catálogo
      </Link>

      <div className="grid grid-cols-1 gap-lg lg:grid-cols-3">
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
              <p className="text-base leading-relaxed text-text-muted">
                {viaje.descripcion}
              </p>
            ) : null}
          </div>

          {itinerario.length > 0 ? (
            <section className="space-y-md">
              <h2 className="text-xl font-bold text-primary">Itinerario</h2>
              <ol className="space-y-sm">
                {itinerario.map((paso, i) => (
                  <li
                    key={paso}
                    className="flex gap-sm rounded-sm border-l-4 border-primary bg-surface-alt p-sm"
                  >
                    <span className="min-w-[1.5rem] text-sm font-bold text-primary">
                      {i + 1}.
                    </span>
                    <span className="text-sm text-text-main">{paso}</span>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          <div className="grid grid-cols-1 gap-md md:grid-cols-2">
            <section className="space-y-md">
              <h2 className="text-xl font-bold text-primary">Qué incluye</h2>
              <ul className="space-y-xs">
                {inclusiones.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-xs text-sm text-text-main"
                  >
                    <Check
                      size={16}
                      className="mt-0.5 shrink-0 text-success"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
            {equipo.length > 0 ? (
              <section className="space-y-md">
                <h2 className="text-xl font-bold text-primary">
                  Equipo recomendado
                </h2>
                <ul className="space-y-xs">
                  {equipo.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-xs text-sm text-text-main"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        </div>

        <aside className="self-start space-y-md rounded-md border border-neutral-border bg-surface p-lg shadow-sm lg:sticky lg:top-lg">
          <div className="space-y-xs">
            <span className="text-xs font-bold uppercase text-text-muted">
              Inversión Total
            </span>
            <p className="text-3xl font-bold text-primary">
              {formatoCordobas(viaje.montoTotal)}
            </p>
            <p className="text-xs text-text-muted">
              {formatoUSDAproximado(viaje.montoTotal)}
            </p>
          </div>

          <div className="space-y-xs rounded-sm border border-neutral-border bg-sand p-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-primary">
                Abono para reservar
              </span>
              <span className="text-sm font-bold text-primary">
                {formatoCordobas(viaje.montoReserva)}
              </span>
            </div>
            <p className="text-[10px] leading-tight text-text-muted">
              El monto restante se cancela antes de la salida.
            </p>
          </div>

          <div className="space-y-sm border-t border-neutral-border pt-md">
            <FilaDato
              icono={Calendar}
              etiqueta="Salida"
              valor={formatoFecha(viaje.fechaHoraIda)}
            />
            <FilaDato
              icono={Calendar}
              etiqueta="Regreso"
              valor={formatoFecha(viaje.fechaHoraVuelta)}
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
            <Boton href={`/inscripcion/${viaje.idViaje}`} fullWidth>
              Inscribirme Ahora
            </Boton>
          ) : (
            <Boton disabled fullWidth>
              {viaje.estado === "activo"
                ? "Sin cupos disponibles"
                : "Inscripciones cerradas"}
            </Boton>
          )}

          {viaje.enlaceWhatsApp ? (
            <a
              href={viaje.enlaceWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-md py-sm text-sm font-medium text-sand transition hover:bg-primary-dark"
            >
              Unirme al grupo de WhatsApp
            </a>
          ) : null}

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
