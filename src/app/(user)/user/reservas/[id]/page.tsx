"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Clock, Eye, EyeOff, FileText, User } from "lucide-react";
import { adminService } from "@/services/admin.service";
import type { ReservaDetalle as ReservaDetalleTipo } from "@/services/reserva.service";
import { userService } from "@/services/user.service";
import { formatoFecha, formatoPrecio } from "@/lib/format";
import type { CampoFormulario } from "@/types/viaje";
import Boton from "@/components/ui/Boton";
import Chip from "@/components/ui/Chip";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";

export default function ReservaDetalle() {
  const params = useParams<{ id: string }>();
  const idReserva = Number(params.id);
  const [reserva, setReserva] = useState<ReservaDetalleTipo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reintentos, setReintentos] = useState(0);
  const [campos, setCampos] = useState<CampoFormulario[]>([]);
  const [referenciaVisible, setReferenciaVisible] = useState(false);

  useEffect(() => {
    if (Number.isNaN(idReserva)) return;
    userService
      .getReservaDetalle(idReserva)
      .then((data) => {
        setReserva(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [idReserva, reintentos]);

  useEffect(() => {
    if (!reserva) return;
    adminService
      .listarCampos(reserva.idViaje)
      .then(setCampos)
      .catch(() => setCampos([]));
  }, [reserva]);

  function reintentar() {
    setLoading(true);
    setError(false);
    setReintentos((n) => n + 1);
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-lg py-lg space-y-lg">
        <Skeleton className="h-48 w-full rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          <Skeleton className="h-40 w-full rounded-md" />
          <Skeleton className="h-40 w-full rounded-md" />
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-lg py-lg">
        <EmptyState
          titulo="No pudimos cargar la reserva"
          descripcion="Ocurrió un error al obtener los detalles. Inténtalo de nuevo."
          accion={{ etiqueta: "Reintentar", onClick: reintentar }}
        />
      </div>
    );
  }
  if (!reserva) {
    return (
      <div className="max-w-4xl mx-auto px-lg py-lg">
        <EmptyState
          titulo="Reserva no encontrada"
          descripcion="La reserva que buscas no existe o no pertenece a tu cuenta."
          accion={{ etiqueta: "Ver mis reservas", href: "/user/reservas" }}
        />
      </div>
    );
  }

  const limite = reserva.fechaLimitePago
    ? new Date(reserva.fechaLimitePago)
    : null;

  /** Un grupo de respuestas por persona que las respondió. */
  const agrupadas = [
    ...reserva.respuestasFormulario.reduce((grupos, respuesta) => {
      const persona = respuesta.persona ?? "titular";
      const grupo = grupos.get(persona) ?? [];
      grupo.push(respuesta);
      grupos.set(persona, grupo);
      return grupos;
    }, new Map<string, ReservaDetalleTipo["respuestasFormulario"]>()),
  ];

  return (
    <div className="max-w-4xl mx-auto px-lg py-lg space-y-lg">
      <div className="bg-surface p-lg rounded-md border border-neutral-border shadow-sm space-y-md">
        <div className="flex justify-between items-start">
          <div>
            {/* h2: el layout ya pone el h1 "Área de Cliente" (un solo h1 por página). */}
            <h2 className="text-2xl font-bold text-primary">
              Detalle de Reserva
            </h2>
            <p className="text-sm text-text-muted">
              Reserva #{reserva.idReserva}
            </p>
          </div>
          <Chip
            estado={reserva.estado}
            className="px-3 py-1 font-bold uppercase"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg pt-md border-t border-neutral-border">
          <div className="space-y-xs">
            <p className="text-xs font-bold text-text-muted uppercase">Viaje</p>
            <p className="font-medium">{reserva.tituloViaje}</p>
          </div>
          <div className="space-y-xs">
            <p className="text-xs font-bold text-text-muted uppercase">
              Fecha de creación
            </p>
            <p className="font-medium">{formatoFecha(reserva.fechaCreacion)}</p>
          </div>
          <div className="space-y-xs">
            <p className="text-xs font-bold text-text-muted uppercase">
              Monto total
            </p>
            <p className="font-bold text-lg text-primary">
              {formatoPrecio(reserva.montoTotal)}
            </p>
          </div>
        </div>

        {limite ? (
          <p className="flex items-center gap-2 text-sm text-text-muted">
            <Clock size={14} aria-hidden="true" />
            Retención del cupo hasta:{" "}
            {limite.toLocaleString("es-ES", {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </p>
        ) : null}

        {reserva.estado === "rechazada" && reserva.motivoRechazo ? (
          <p className="rounded-md bg-estado-rechazada-bg px-4 py-3 text-sm text-estado-rechazada-text">
            Motivo del rechazo: {reserva.motivoRechazo}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
        <div className="bg-surface p-lg rounded-md border border-neutral-border shadow-sm space-y-md">
          <h3 className="text-lg font-bold text-primary flex items-center gap-sm">
            <User size={20} /> Datos del Titular
          </h3>
          <div className="space-y-xs">
            <p className="text-sm font-medium">{reserva.nombreUsuario}</p>
            <p className="text-sm text-text-muted">{reserva.correoUsuario}</p>
          </div>
        </div>

        <div className="bg-surface p-lg rounded-md border border-neutral-border shadow-sm space-y-md">
          <h3 className="text-lg font-bold text-primary flex items-center gap-sm">
            <FileText size={20} /> Información de Pago
          </h3>
          <div className="space-y-xs">
            <p className="text-xs font-bold text-text-muted uppercase">
              Referencia
            </p>
            <div className="flex items-center gap-3">
              <code className="rounded-sm bg-surface-alt px-2 py-1 text-sm font-mono">
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
            <p className="text-xs font-bold text-text-muted uppercase">
              Comprobante
            </p>
            {reserva.capturaComprobanteUrl ? (
              <div className="space-y-2">
                <a
                  href={reserva.capturaComprobanteUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- blob local del mock, sin optimización posible */}
                  <img
                    src={reserva.capturaComprobanteUrl}
                    alt="Comprobante de pago"
                    className="max-h-56 rounded-md border border-neutral-border bg-surface-alt object-contain"
                  />
                </a>
                <p className="text-xs text-text-muted">
                  Toca la imagen para abrirla en tamaño completo.
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

      <div className="rounded-md border border-neutral-border bg-surface-alt px-4 py-3 text-sm text-text-muted">
        Reserva de solo consulta: los datos y el comprobante se envían una sola
        vez con la inscripción y no pueden modificarse desde esta página. Si
        necesitas corregir algo, avisa a la administración del club.
      </div>

      <div className="bg-surface p-lg rounded-md border border-neutral-border shadow-sm space-y-md">
        <h3 className="text-lg font-bold text-primary">Acompañantes</h3>
        {reserva.acompanantes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
            {reserva.acompanantes.map((acc, i) => (
              <div
                key={i}
                className="p-sm bg-surface-alt rounded-sm border border-neutral-border flex justify-between items-center"
              >
                <span className="text-sm font-medium">
                  {acc.primerNombre} {acc.primerApellido}
                </span>
                <span className="text-xs text-text-muted">
                  {acc.numeroIdentificacion}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted italic">
            No hay acompañantes registrados.
          </p>
        )}
      </div>

      <div className="bg-surface p-lg rounded-md border border-neutral-border shadow-sm space-y-md">
        <h3 className="text-lg font-bold text-primary">
          Respuestas del formulario
        </h3>
        <p className="text-xs text-text-muted">
          Un juego de preguntas por viajero, incluido el titular.
        </p>
        {agrupadas.length > 0 ? (
          <div className="space-y-4">
            {agrupadas.map(([persona, respuestas]) => (
              <div key={persona} className="space-y-2">
                <h4 className="text-sm font-bold text-primary">
                  {etiquetaPersona(persona)}
                </h4>
                <dl className="space-y-2">
                  {respuestas.map((respuesta) => (
                    <div key={respuesta.idCampo}>
                      <dt className="text-xs font-bold text-text-muted uppercase">
                        {campos.find(
                          (campo) => campo.idCampo === respuesta.idCampo,
                        )?.etiquetaPregunta ?? `Pregunta ${respuesta.idCampo}`}
                      </dt>
                      <dd className="text-sm">{respuesta.respuesta}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted italic">
            Este viaje no tenía preguntas adicionales.
          </p>
        )}
      </div>
    </div>
  );
}

/** Etiqueta de la persona dueña de un grupo de respuestas. */
function etiquetaPersona(persona: string): string {
  if (persona === "titular") return "Titular (tú)";
  const indice = Number(persona.replace("acomp-", ""));
  return Number.isNaN(indice) ? "Viajero" : `Acompañante ${indice + 1}`;
}
