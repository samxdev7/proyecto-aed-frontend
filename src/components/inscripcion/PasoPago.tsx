"use client";

import { useEffect, useRef, useState } from "react";
import Boton from "@/components/ui/Boton";
import Campo from "@/components/ui/Campo";
import TemporizadorRetencion from "@/components/inscripcion/TemporizadorRetencion";
import { formatoCordobas, formatoUSDAproximado } from "@/lib/format";
import type { BorradorReserva } from "@/services/reserva.service";
import type { Viaje } from "@/types/viaje";

interface PasoPagoProps {
  viaje: Viaje;
  cantidad: number;
  borrador: BorradorReserva;
  enviando: boolean;
  alConfirmar: (numeroReferenciaPago: string, capturaComprobanteUrl: string) => void;
  alAtras: () => void;
  alExpirar: () => void;
}

interface ErroresPago {
  referencia?: string;
  comprobante?: string;
}

export default function PasoPago({
  viaje,
  cantidad,
  borrador,
  enviando,
  alConfirmar,
  alAtras,
  alExpirar,
}: PasoPagoProps) {
  const [referencia, setReferencia] = useState("");
  const [comprobante, setComprobante] = useState<string | null>(null);
  const [nombreArchivo, setNombreArchivo] = useState("");
  const [errores, setErrores] = useState<ErroresPago>({});
  const refComprobante = useRef<string | null>(null);

  // El objectURL local se libera al salir del paso; la reserva guarda el URL como mock.
  useEffect(
    () => () => {
      if (refComprobante.current) URL.revokeObjectURL(refComprobante.current);
    },
    [],
  );

  const monto = viaje.montoReserva * cantidad;

  function alElegirArchivo(evento: React.ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;
    if (refComprobante.current) URL.revokeObjectURL(refComprobante.current);
    const url = URL.createObjectURL(archivo);
    refComprobante.current = url;
    setComprobante(url);
    setNombreArchivo(archivo.name);
    setErrores((previas) => ({ ...previas, comprobante: undefined }));
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
    <div className="space-y-6">
      <TemporizadorRetencion
        fechaLimite={borrador.fechaLimitePago}
        alExpirar={alExpirar}
      />

      <div>
        <h2 className="font-serif text-xl font-bold text-navy">
          Pago por transferencia
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          Transferí el abono exacto, guarda el número de referencia y sube la
          captura del comprobante. Tu solicitud se envía con ambos datos.
        </p>
      </div>

      <dl className="space-y-2 rounded-md bg-sand p-4 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-ink/70">Banco</dt>
          <dd className="font-medium text-navy">BanPro</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-ink/70">Cuenta (córdobas)</dt>
          <dd className="font-mono font-medium text-navy">100-022-000123-4</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-ink/70">Titular</dt>
          <dd className="font-medium text-navy">
            Club Nicaragüense de Montañismo
          </dd>
        </div>
        <div className="flex items-center justify-between border-t border-ink/10 pt-2">
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
          className="block w-full text-sm text-text-muted file:mr-4 file:rounded-sm file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-sand"
        />
        {errores.comprobante ? (
          <p className="text-xs text-error" role="alert">
            {errores.comprobante}
          </p>
        ) : null}
        {comprobante ? (
          <figure className="mt-3 space-y-1">
            {/* eslint-disable-next-line @next/next/no-img-element -- preview local de un blob, no hay optimización posible */}
            <img
              src={comprobante}
              alt={`Comprobante: ${nombreArchivo}`}
              className="max-h-48 rounded-md border border-neutral-border bg-surface-alt object-contain"
            />
            <figcaption className="text-xs text-text-muted">
              {nombreArchivo}
            </figcaption>
          </figure>
        ) : null}
      </div>

      <div className="flex gap-3">
        <Boton variante="contorno" onClick={alAtras} disabled={enviando}>
          Atrás
        </Boton>
        <Boton className="flex-1" onClick={confirmar} loading={enviando}>
          Confirmar reserva
        </Boton>
      </div>
    </div>
  );
}
