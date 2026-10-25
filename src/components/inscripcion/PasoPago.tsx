"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Clock, UploadCloud, X, Image as ImageIcon } from "lucide-react";
import Boton from "@/components/ui/Boton";
import Campo from "@/components/ui/Campo";
import Modal from "@/components/ui/Modal";
import TemporizadorRetencion from "@/components/inscripcion/TemporizadorRetencion";
import { DATOS_PAGO } from "@/config/pago";
import { formatoCordobas } from "@/lib/format";
import { subirComprobantePago } from "@/services/supabaseStorage.service";
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
  alReiniciar?: () => void;
}

interface ErroresPago {
  referencia?: string;
  comprobante?: string;
}

interface ImagenComprimida {
  dataUri: string;
  blob: Blob;
}

/** Comprime la captura en el cliente: lado mayor máx 1200px, JPEG 0.72. */
async function comprimirImagen(archivo: File): Promise<ImagenComprimida> {
  const bitmap = await createImageBitmap(archivo);
  const escala = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * escala);
  canvas.height = Math.round(bitmap.height * escala);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const dataUri = canvas.toDataURL("image/jpeg", 0.72);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error("Error al convertir imagen a blob"));
      },
      "image/jpeg",
      0.72,
    );
  });
  return { dataUri, blob };
}

export default function PasoPago({
  viaje,
  cantidad,
  borrador,
  enviando,
  errorEnvio,
  alConfirmar,
  alAtras,
  alReiniciar,
}: PasoPagoProps) {
  const [referencia, setReferencia] = useState("");
  const [comprobante, setComprobante] = useState<string | null>(null);
  const [comprobanteBlob, setComprobanteBlob] = useState<Blob | null>(null);
  const [nombreArchivo, setNombreArchivo] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [procesando, setProcesando] = useState(false);
  const [subiendoStorage, setSubiendoStorage] = useState(false);
  const [tiempoAgotado, setTiempoAgotado] = useState(
    () => new Date(borrador.fechaLimitePago).getTime() <= Date.now(),
  );
  const [modalExpiradoAbierto, setModalExpiradoAbierto] = useState(
    () => new Date(borrador.fechaLimitePago).getTime() <= Date.now(),
  );
  const [errores, setErrores] = useState<ErroresPago>({});

  const expirado = tiempoAgotado;

  function alAgotarseTiempo() {
    setTiempoAgotado(true);
    setModalExpiradoAbierto(true);
  }

  const monto = viaje.montoReserva * cantidad;
  const bloqueado = enviando || procesando || subiendoStorage || expirado;

  async function alElegirArchivo(evento: React.ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;
    if (!["image/jpeg", "image/png"].includes(archivo.type)) {
      setErrores((previas) => ({
        ...previas,
        comprobante: "Formato no válido. Solo se aceptan .jpg, .jpeg o .png.",
      }));
      evento.target.value = "";
      return;
    }
    if (archivo.size > 5 * 1024 * 1024) {
      setErrores((previas) => ({
        ...previas,
        comprobante: "El comprobante no debe superar los 5 MB.",
      }));
      evento.target.value = "";
      return;
    }
    setProcesando(true);
    try {
      const { dataUri, blob } = await comprimirImagen(archivo);
      setComprobante(dataUri);
      setComprobanteBlob(blob);
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

  async function confirmar() {
    const nuevos: ErroresPago = {};
    const ref = referencia.trim();
    if (!ref) {
      nuevos.referencia = "Ingresa el número de referencia";
    } else if (ref.length > 50) {
      nuevos.referencia = "Máximo 50 caracteres";
    }
    if (!comprobanteBlob) {
      nuevos.comprobante = "Adjunta la captura de la transferencia";
    }
    setErrores(nuevos);
    if (Object.keys(nuevos).length === 0 && comprobanteBlob) {
      setSubiendoStorage(true);
      try {
        const urlPublica = await subirComprobantePago(comprobanteBlob);
        alConfirmar(ref, urlPublica);
      } catch (err) {
        setErrores((prev) => ({
          ...prev,
          comprobante:
            err instanceof Error
              ? err.message
              : "No se pudo subir la captura del comprobante. Intenta nuevamente.",
        }));
      } finally {
        setSubiendoStorage(false);
      }
    }
  }

  return (
    <div className="space-y-md">
      <TemporizadorRetencion
        fechaLimite={borrador.fechaLimitePago}
        alExpirar={alAgotarseTiempo}
        ocultarAlExpirar
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

      <div className="flex flex-col gap-1.5">
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
          ref={fileInputRef}
          id="captura-comprobante"
          type="file"
          accept=".jpg,.jpeg,.png"
          onChange={alElegirArchivo}
          disabled={bloqueado}
          className="hidden"
        />

        {comprobante ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3 p-3 rounded-sm border border-primary/30 bg-primary/5">
              <div className="flex items-center gap-2.5 min-w-0">
                <ImageIcon size={18} className="text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-primary truncate">
                    {nombreArchivo || "Comprobante adjuntado"}
                  </p>
                  <p className="text-[10px] text-text-muted">Optimizado y listo para enviar</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setComprobante(null);
                  setNombreArchivo("");
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                disabled={bloqueado}
                className="p-1 rounded text-text-muted hover:text-error hover:bg-white transition-colors"
                title="Quitar comprobante"
                aria-label="Quitar comprobante adjuntado"
              >
                <X size={16} />
              </button>
            </div>

            <figure className="space-y-1">
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
            </figure>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={bloqueado}
            className={`flex items-center justify-center gap-2 p-3.5 rounded-sm border border-dashed border-neutral-border hover:border-primary bg-surface hover:bg-surface-alt transition-colors text-xs font-medium text-text-muted hover:text-primary ${
              errores.comprobante ? "border-error text-error" : ""
            }`}
          >
            {procesando ? (
              <span>Optimizando comprobante…</span>
            ) : (
              <>
                <UploadCloud size={16} />
                <span>Adjuntar comprobante (JPG o PNG máx. 5 MB)</span>
              </>
            )}
          </button>
        )}

        {errores.comprobante ? (
          <p className="text-xs text-error" role="alert">
            {errores.comprobante}
          </p>
        ) : null}
      </div>

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
        {expirado ? (
          <Boton
            className="flex-1"
            onClick={alReiniciar || alAtras}
          >
            Volver a rellenar
          </Boton>
        ) : (
          <Boton
            className="flex-1"
            onClick={confirmar}
            loading={enviando || subiendoStorage}
            disabled={bloqueado}
          >
            Confirmar reserva
          </Boton>
        )}
      </div>

      <Modal
        abierto={modalExpiradoAbierto}
        onCerrar={() => setModalExpiradoAbierto(false)}
        titulo="Tiempo de reserva agotado"
        className="max-w-md p-lg text-center"
      >
        <div className="flex flex-col items-center gap-md">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-warning-bg text-warning">
            <Clock size={36} aria-hidden="true" />
          </div>

          <div className="space-y-xs">
            <h3 className="text-xl font-bold text-primary">
              El tiempo para completar el pago ha finalizado
            </h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Han finalizado los 30 minutos establecidos para procesar el pago y tu cupo ya no se encuentra retenido. Por favor, vuelve a iniciar el proceso de inscripción y rellenado para asegurar tus lugares.
            </p>
          </div>

          <div className="w-full pt-xs">
            <Boton
              type="button"
              fullWidth
              onClick={() => {
                setModalExpiradoAbierto(false);
                if (alReiniciar) {
                  alReiniciar();
                } else {
                  alAtras();
                }
              }}
            >
              Volver a rellenar la reserva
            </Boton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
