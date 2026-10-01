"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Boton from "@/components/ui/Boton";
import Campo from "@/components/ui/Campo";
import TemporizadorRetencion from "@/components/inscripcion/TemporizadorRetencion";
import { DATOS_PAGO } from "@/config/pago";
import { formatoCordobas, formatoUSDAproximado } from "@/lib/format";
import type { BorradorReserva } from "@/services/reserva.service";
import type { Viaje } from "@/types/viaje";

interface PasoPagoProps {
  viaje: Viaje;
  cantidad: number;
  borrador: BorradorReserva;
  enviando: boolean;
  /** Mensaje del backend si el POST falló (p.ej. "cupos insuficientes"). */
  errorEnvio: string | null;
  alConfirmar: (numeroReferenciaPago: string, capturaComprobanteUrl: string) => void;
  alAtras: () => void;
}

interface ErroresPago {
  referencia?: string;
  comprobante?: string;
}

/** Comprime la captura en el cliente: lado mayor máx 1200px, JPEG 0.72. */
async function comprimirImagen(archivo: File): Promise<string> {
  const bitmap = await createImageBitmap(archivo);
  const escala = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * escala);
  canvas.height = Math.round(bitmap.height * escala);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.72);
}

export default function PasoPago({
  viaje,
  cantidad,
  borrador,
  enviando,
  errorEnvio,
  alConfirmar,
  alAtras,
}: PasoPagoProps) {
  const [referencia, setReferencia] = useState("");
  const [comprobante, setComprobante] = useState<string | null>(null);
  const [nombreArchivo, setNombreArchivo] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [expirado, setExpirado] = useState(false);
  const [errores, setErrores] = useState<ErroresPago>({});

  // El backend re-fija su propia ventana al crear la reserva; esto solo
  // retiene el cupo en UX y deshabilita el envío al agotarse.
  useEffect(() => {
    setExpirado(new Date(borrador.fechaLimitePago).getTime() <= Date.now());
  }, [borrador.fechaLimitePago]);

  const monto = viaje.montoReserva * cantidad;
  const bloqueado = enviando || procesando || expirado;

  async function alElegirArchivo(evento: React.ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;
    setProcesando(true);
    try {
      const dataUri = await comprimirImagen(archivo);
      setComprobante(dataUri);
      setNombreArchivo(archivo.name);
      setErrores((previas) => ({ ...previas, comprobante: undefined }));
    } catch {
      setErrores((previas) => ({
        ...previas,
        comprobante: "No pudimos procesar la imagen. Prueba con otra foto.",
      }));
    } finally {
      setProcesando(false);
    }
  }

  function confirmar() {
    const nuevos: ErroresPago = {};
    const ref = referencia.trim();
    if (!ref) {
      nuevos.referencia = "Ingresa el número de referencia";
    } else if (ref.length > 50) {
      nuevos.referencia = "Máximo 50 caracteres";
    }
    if (!comprobante) {
      nuevos.comprobante = "Adjunta la captura de la transferencia";
    }
    setErrores(nuevos);
    if (Object.keys(nuevos).length === 0 && comprobante) {
      alConfirmar(ref, comprobante);
    }
  }

  return (
    <div className="space-y-md">
      <TemporizadorRetencion
        fechaLimite={borrador.fechaLimitePago}
        alExpirar={() => setExpirado(true)}
      />

      <div>
        <h2 className="text-xl font-bold text-primary">Pago por transferencia</h2>
        <p className="mt-1 text-sm text-text-muted">
          Transferí el abono exacto, guarda el número de referencia y sube la
          captura del comprobante. Tu solicitud se envía con ambos datos.
        </p>
      </div>

      <dl className="space-y-sm rounded-md bg-sand p-md text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-ink/70">Banco</dt>
          <dd className="font-medium text-navy">{DATOS_PAGO.banco}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-ink/70">
            Cuenta ({DATOS_PAGO.moneda.toLowerCase()})
          </dt>
          <dd className="font-mono font-medium text-navy">
            {DATOS_PAGO.cuenta}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-ink/70">Titular</dt>
          <dd className="font-medium text-navy">{DATOS_PAGO.titular}</dd>
        </div>
        <div className="flex items-center justify-between border-t border-ink/10 pt-sm">
          <dt className="font-semibold text-navy">Monto exacto</dt>
          <dd className="font-bold text-navy">
            {formatoCordobas(monto)}
            <span className="ml-1 text-xs font-normal text-ink/50">
              ({formatoUSDAproximado(monto)})
            </span>
          </dd>
        </div>
      </dl>

      <Campo
        label="Número de referencia de la transferencia"
        required
        placeholder="Ej. TRF-123456789"
        hint="Tal como aparece en tu comprobante (máx. 50 caracteres)"
        valor={referencia}
        alCambiar={setReferencia}
        error={errores.referencia}
      />

      <div className="flex flex-col gap-1">
        <label
          htmlFor="captura-comprobante"
          className="text-xs font-semibold text-text-muted"
        >
          Captura del comprobante
          <span className="text-error" aria-hidden="true">
            {" "}
            *
          </span>
        </label>
        <input
          id="captura-comprobante"
          type="file"
          accept="image/*"
          onChange={alElegirArchivo}
          disabled={procesando}
          className="block w-full text-sm text-text-muted file:mr-md file:rounded-sm file:border-0 file:bg-primary file:px-md file:py-xs file:text-sm file:font-medium file:text-sand"
        />
        {procesando ? (
          <p className="text-xs text-text-muted">Procesando imagen…</p>
        ) : null}
        {errores.comprobante ? (
          <p className="text-xs text-error" role="alert">
            {errores.comprobante}
          </p>
        ) : null}
        {comprobante ? (
          <figure className="mt-sm space-y-1">
            <div className="relative h-48 w-full overflow-hidden rounded-md border border-neutral-border bg-surface-alt">
              {/* Data-URI: next/image lo pasa directo sin optimización. */}
              <Image
                src={comprobante}
                alt={`Comprobante: ${nombreArchivo}`}
                fill
                sizes="(min-width: 768px) 60vw, 100vw"
                className="object-contain"
              />
            </div>
            <figcaption className="text-xs text-text-muted">
              {nombreArchivo}
            </figcaption>
          </figure>
        ) : null}
      </div>

      {expirado ? (
        <p
          className="rounded-md bg-estado-rechazada-bg px-md py-sm text-sm font-medium text-estado-rechazada-text"
          role="alert"
        >
          Se agotó el tiempo de retención. Vuelve al paso anterior e inicia la
          reserva de nuevo.
        </p>
      ) : null}

      {errorEnvio ? (
        <p
          className="rounded-md bg-estado-rechazada-bg px-md py-sm text-sm font-medium text-estado-rechazada-text"
          role="alert"
        >
          {errorEnvio}
        </p>
      ) : null}

      <div className="flex gap-sm">
        <Boton variante="contorno" onClick={alAtras} disabled={enviando}>
          Atrás
        </Boton>
        <Boton
          className="flex-1"
          onClick={confirmar}
          loading={enviando}
          disabled={bloqueado}
        >
          Confirmar reserva
        </Boton>
      </div>
    </div>
  );
}
