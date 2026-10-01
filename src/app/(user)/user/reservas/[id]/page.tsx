"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CalendarX, Eye, EyeOff, FileText, User, Users } from "lucide-react";
import { reservaService } from "@/services/reserva.service";
import type { ReservaDetalle } from "@/types/reserva";
import { formatoCordobas, formatoFecha, formatoUSDAproximado } from "@/lib/format";
import Boton from "@/components/ui/Boton";
import Chip from "@/components/ui/Chip";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import TemporizadorRetencion from "@/components/inscripcion/TemporizadorRetencion";
import Image from "next/image";

export default function ReservaDetallePage() {
  const params = useParams<{ id: string }>();
  const idReserva = Number(params.id);
  const esIdInvalido = Number.isNaN(idReserva);
  const [reserva, setReserva] = useState<ReservaDetalle | null>(null);
  const [loading, setLoading] = useState(!esIdInvalido);
  const [error, setError] = useState(false);
  const [reintentos, setReintentos] = useState(0);
  const [referenciaVisible, setReferenciaVisible] = useState(false);

  useEffect(() => {
    if (Number.isNaN(idReserva)) return;
    let activo = true;
    reservaService
      .obtenerReserva(idReserva)
      .then((data) => {
        if (activo) {
          setReserva(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (activo) {
          setError(true);
          setLoading(false);
        }
      });
    return () => {
      activo = false;
    };
  }, [idReserva, reintentos]);

  function reintentar() {
    setLoading(true);
    setError(false);
    setReintentos((n) => n + 1);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-lg">
        <Skeleton className="h-48 w-full rounded-md" />
        <div className="grid grid-cols-1 gap-lg md:grid-cols-2">
          <Skeleton className="h-40 w-full rounded-md" />
          <Skeleton className="h-40 w-full rounded-md" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        titulo="No pudimos cargar la reserva"
        descripcion="Ocurrió un error al obtener los detalles. Inténtalo de nuevo."
        accion={{ etiqueta: "Reintentar", onClick: reintentar }}
      />
    );
  }

  if (!reserva) {
    return (
      <EmptyState
        titulo="Reserva no encontrada"
        descripcion="La reserva que buscas no existe o no pertenece a tu cuenta."
        accion={{ etiqueta: "Ver mis reservas", href: "/user/reservas" }}
      />
    );
  }

  /** montoReserva = abono POR PERSONA; el total abonado incluye acompañantes. */
  const personas = 1 + reserva.acompanantes.length;
  const totalAbonado = reserva.montoReserva * personas;

  return (
    <div className="mx-auto max-w-4xl space-y-lg">
      <div className="space-y-md rounded-md border border-neutral-border bg-surface p-lg shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            {/* h2: el layout ya pone el h1 "Área de Cliente" (un solo h1 por página). */}
            <h2 className="text-2xl font-bold text-primary">
              Detalle de Reserva
            </h2>
            <p className="text-sm text-text-muted">
              Reserva #{reserva.idReserva} · {reserva.tituloViaje}
            </p>
          </div>
          <Chip
            estado={reserva.estado}
            className="px-sm py-xs font-bold uppercase"
          />
        </div>

        <div className="grid grid-cols-1 gap-lg border-t border-neutral-border pt-md md:grid-cols-3">
          <div className="space-y-xs">
            <p className="text-xs font-bold uppercase text-text-muted">
              Fecha de reserva
            </p>
            <p className="font-medium">{formatoFecha(reserva.fechaReserva)}</p>
          </div>
          <div className="space-y-xs">
            <p className="text-xs font-bold uppercase text-text-muted">
              Abono (por persona)
            </p>
            <p className="font-medium">
              {formatoCordobas(reserva.montoReserva)}{" "}
              <span className="text-xs font-normal text-text-muted">
                ({formatoUSDAproximado(reserva.montoReserva)})
              </span>
            </p>
          </div>
          <div className="space-y-xs">
            <p className="text-xs font-bold uppercase text-text-muted">
              Total abonado ({personas}{" "}
              {personas === 1 ? "persona" : "personas"})
            </p>
            <p className="text-lg font-bold text-primary">
              {formatoCordobas(totalAbonado)}
            </p>
          </div>
        </div>

        {reserva.estado === "pendiente" ? (
          <div className="space-y-xs">
            <p className="text-xs text-text-muted">
              La reserva queda pendiente de pago/revisión hasta:
            </p>
            <TemporizadorRetencion fechaLimite={reserva.fechaLimitePago} />
          </div>
        ) : null}

        {reserva.estado === "rechazada" && reserva.motivoRechazo ? (
          <p className="rounded-md bg-estado-rechazada-bg px-md py-sm text-sm text-estado-rechazada-text">
            Motivo del rechazo: {reserva.motivoRechazo}
          </p>
        ) : null}

        {reserva.estado === "expirada" ? (
          <p className="flex items-center gap-xs text-sm text-text-muted">
            <CalendarX size={14} aria-hidden="true" />
            La ventana de pago venció y la reserva expiró. Si el viaje sigue
            activo, puedes inscribirte de nuevo.
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-lg md:grid-cols-2">
        <div className="space-y-md rounded-md border border-neutral-border bg-surface p-lg shadow-sm">
          <h3 className="flex items-center gap-sm text-lg font-bold text-primary">
            <User size={20} aria-hidden="true" /> Datos del Titular
          </h3>
          <div className="space-y-xs">
            <p className="text-sm font-medium">{reserva.nombreUsuario}</p>
            <p className="text-sm text-text-muted">{reserva.correoUsuario}</p>
          </div>
        </div>

        <div className="space-y-md rounded-md border border-neutral-border bg-surface p-lg shadow-sm">
          <h3 className="flex items-center gap-sm text-lg font-bold text-primary">
            <FileText size={20} aria-hidden="true" /> Información de Pago
          </h3>
          <div className="space-y-xs">
            <p className="text-xs font-bold uppercase text-text-muted">
              Referencia
            </p>
            <div className="flex items-center gap-sm">
              <code className="rounded-sm bg-surface-alt px-xs py-xs font-mono text-sm">
                {referenciaVisible
                  ? (reserva.numeroReferenciaPago ?? "—")
                  : "••••••••"}
              </code>
              {reserva.numeroReferenciaPago ? (
                <Boton
                  tamano="sm"
                  variante="contorno"
                  onClick={() => setReferenciaVisible((valor) => !valor)}
                >
                  {referenciaVisible ? (
                    <EyeOff size={14} aria-hidden="true" />
                  ) : (
                    <Eye size={14} aria-hidden="true" />
                  )}
                  {referenciaVisible ? "Ocultar" : "Revelar"}
                </Boton>
              ) : null}
            </div>
          </div>

          <div className="space-y-xs">
            <p className="text-xs font-bold uppercase text-text-muted">
              Comprobante
            </p>
            {reserva.capturaComprobanteUrl ? (
              <div className="space-y-xs">
                <a
                  href={reserva.capturaComprobanteUrl}
                  download="comprobante-pago"
                >
                  <div className="relative h-56 w-full overflow-hidden rounded-md border border-neutral-border bg-surface-alt">
                    {/* Data-URI del backend: next/image lo pasa directo. */}
                    <Image
                      src={reserva.capturaComprobanteUrl}
                      alt="Comprobante de pago"
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-contain"
                    />
                  </div>
                </a>
                <p className="text-xs text-text-muted">
                  Toca la imagen para descargar el comprobante.
                </p>
              </div>
            ) : (
              <p className="text-sm text-text-muted">
                Sin comprobante adjunto.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-md border border-neutral-border bg-surface-alt px-md py-sm text-sm text-text-muted">
        Reserva de solo consulta: los datos y el comprobante se envían una sola
        vez con la inscripción y no pueden modificarse desde esta página. Si
        necesitas corregir algo, avisa a la administración del club.
      </div>

      <div className="space-y-md rounded-md border border-neutral-border bg-surface p-lg shadow-sm">
        <h3 className="flex items-center gap-sm text-lg font-bold text-primary">
          <Users size={20} aria-hidden="true" /> Acompañantes
        </h3>
        {reserva.acompanantes.length > 0 ? (
          <div className="grid grid-cols-1 gap-sm md:grid-cols-2">
            {reserva.acompanantes.map((acompanante, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-sm border border-neutral-border bg-surface-alt p-sm"
              >
                <span className="text-sm font-medium">
                  {acompanante.primerNombre} {acompanante.primerApellido}
                </span>
                <span className="text-xs text-text-muted">
                  {acompanante.numeroIdentificacion}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm italic text-text-muted">
            No hay acompañantes registrados.
          </p>
        )}
      </div>

      <div className="space-y-sm rounded-md border border-neutral-border bg-surface p-lg shadow-sm">
        <h3 className="text-lg font-bold text-primary">
          Respuestas del formulario
        </h3>
        <p className="text-xs text-text-muted">
          Una respuesta por pregunta, compartida por toda la reserva.
        </p>
        {reserva.respuestasFormulario.length > 0 ? (
          <dl className="space-y-sm">
            {reserva.respuestasFormulario.map((respuesta) => (
              <div
                key={respuesta.idCampo}
                className="space-y-xs border-b border-neutral-border pb-sm last:border-b-0 last:pb-0"
              >
                <dt className="text-xs font-bold uppercase text-text-muted">
                  {respuesta.etiquetaPregunta ?? `Pregunta ${respuesta.idCampo}`}
                </dt>
                <dd className="text-sm">{respuesta.valorRespuesta}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-sm italic text-text-muted">
            Este viaje no tenía preguntas adicionales.
          </p>
        )}
      </div>
    </div>
  );
}
