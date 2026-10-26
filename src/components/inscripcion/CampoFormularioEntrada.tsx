"use client";

import React, { useRef, useState } from "react";
import { Paperclip, UploadCloud, X, Check, FileText } from "lucide-react";
import { subirArchivoEntrada } from "@/services/supabaseStorage.service";
import SelectorFechaHora from "@/components/ui/SelectorFechaHora";
import { opcionesDeCampo } from "@/services/viajes.service";
import type { CampoFormulario } from "@/types/viaje";

interface CampoFormularioEntradaProps {
  campo: CampoFormulario;
  valor: string;
  error?: string;
  alCambiar: (nuevoValor: string) => void;
}

function parsearSeleccionMultiple(v: string): string[] {
  if (!v) return [];
  try {
    const parseado = JSON.parse(v);
    if (Array.isArray(parseado)) return parseado as string[];
  } catch {
    return v.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

export default function CampoFormularioEntrada({
  campo,
  valor,
  error,
  alCambiar,
}: CampoFormularioEntradaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [nombreArchivo, setNombreArchivo] = useState<string>(() => {
    if (campo.tipoCampo === "archivo" && valor) {
      if (valor.startsWith("http://") || valor.startsWith("https://")) {
        try {
          const pathname = new URL(valor).pathname;
          const parts = pathname.split("/");
          return decodeURIComponent(parts[parts.length - 1]);
        } catch {
          return "Archivo adjunto";
        }
      }
      return valor.startsWith("data:") ? "Archivo adjunto" : valor;
    }
    return "";
  });
  const [cargandoArchivo, setCargandoArchivo] = useState(false);
  const [errorLocal, setErrorLocal] = useState("");

  const inputClases = `w-full rounded-sm border bg-surface px-4 py-3 text-sm text-text-main outline-none transition placeholder:text-text-muted ${
    error || errorLocal
      ? "border-error focus:border-error focus:ring-1 focus:ring-error"
      : "border-neutral-border focus:border-primary focus:ring-1 focus:ring-primary"
  }`;

  const idInput = `campo-resp-${campo.idCampo}`;

  // 1. TEXTO LIBRE
  if (campo.tipoCampo === "texto") {
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={idInput} className="text-xs font-semibold text-text-muted">
          {campo.etiquetaPregunta}
          {campo.obligatorio && <span className="text-error" aria-hidden="true"> *</span>}
        </label>
        <input
          id={idInput}
          name={idInput}
          type="text"
          placeholder="Escribe tu respuesta..."
          value={valor}
          onChange={(e) => alCambiar(e.target.value)}
          className={inputClases}
        />
        {error && <p className="text-xs text-error" role="alert">{error}</p>}
      </div>
    );
  }

  // 2. OPCIÓN ÚNICA (Dropdown con placeholder)
  if (campo.tipoCampo === "seleccion_unica") {
    const opciones = opcionesDeCampo(campo);
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={idInput} className="text-xs font-semibold text-text-muted">
          {campo.etiquetaPregunta}
          {campo.obligatorio && <span className="text-error" aria-hidden="true"> *</span>}
        </label>
        <select
          id={idInput}
          name={idInput}
          value={valor}
          onChange={(e) => alCambiar(e.target.value)}
          className={`${inputClases} cursor-pointer`}
        >
          <option value="">Selecciona una opción...</option>
          {opciones.map((opcion) => (
            <option key={opcion} value={opcion}>
              {opcion}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-error" role="alert">{error}</p>}
      </div>
    );
  }

  // 3. OPCIÓN MÚLTIPLE (Lista con casillas de verificación / checkboxes)
  if (campo.tipoCampo === "seleccion_multiple") {
    const opciones = opcionesDeCampo(campo);
    const seleccionados = parsearSeleccionMultiple(valor);

    function alternarOpcion(opcion: string) {
      const esta = seleccionados.includes(opcion);
      const nuevaLista = esta
        ? seleccionados.filter((item) => item !== opcion)
        : [...seleccionados, opcion];
      alCambiar(nuevaLista.length > 0 ? JSON.stringify(nuevaLista) : "");
    }

    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <label className="text-xs font-semibold text-text-muted">
            {campo.etiquetaPregunta}
            {campo.obligatorio && <span className="text-error" aria-hidden="true"> *</span>}
          </label>
          <span className="text-[11px] text-text-muted italic">
            Selecciona una o varias opciones
          </span>
        </div>
        <div className="space-y-1.5 rounded-sm border border-neutral-border bg-surface p-3">
          {opciones.map((opcion) => {
            const activo = seleccionados.includes(opcion);
            return (
              <label
                key={opcion}
                onClick={() => alternarOpcion(opcion)}
                className={`flex items-start gap-3 p-2 rounded-sm border transition-colors cursor-pointer select-none ${
                  activo
                    ? "border-primary bg-primary/5 text-primary font-medium"
                    : "border-transparent hover:bg-surface-alt text-text-main"
                }`}
              >
                <div
                  className={`mt-0.5 h-4 w-4 shrink-0 rounded border flex items-center justify-center transition-colors ${
                    activo
                      ? "border-primary bg-primary text-white"
                      : "border-neutral-border bg-white"
                  }`}
                >
                  {activo && <Check size={12} strokeWidth={3} />}
                </div>
                <span className="text-sm leading-tight">{opcion}</span>
              </label>
            );
          })}
        </div>
        {error && <p className="text-xs text-error" role="alert">{error}</p>}
      </div>
    );
  }

  // 4. FECHA (Selector en español con formato dd/mm/yyyy)
  if (campo.tipoCampo === "fecha") {
    return (
      <SelectorFechaHora
        id={idInput}
        label={campo.etiquetaPregunta}
        valor={valor}
        alCambiar={alCambiar}
        required={campo.obligatorio}
        error={error}
        soloFecha
      />
    );
  }

  // 5. SUBE UN ARCHIVO (Almacenamiento directo en Supabase Storage)
  if (campo.tipoCampo === "archivo") {
    async function manejarArchivo(e: React.ChangeEvent<HTMLInputElement>) {
      const archivo = e.target.files?.[0];
      if (!archivo) return;

      if (archivo.size > 10 * 1024 * 1024) {
        setErrorLocal("El archivo no debe exceder 10 MB.");
        return;
      }

      setErrorLocal("");
      setCargandoArchivo(true);
      try {
        const resultado = await subirArchivoEntrada(archivo, archivo.name);
        setNombreArchivo(archivo.name);
        alCambiar(resultado.urlPublica);
      } catch (err) {
        setErrorLocal(
          err instanceof Error
            ? err.message
            : "No se pudo subir el archivo a Supabase Storage."
        );
      } finally {
        setCargandoArchivo(false);
      }
    }

    function quitarArchivo() {
      setNombreArchivo("");
      alCambiar("");
      setErrorLocal("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }

    return (
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-text-muted">
          {campo.etiquetaPregunta}
          {campo.obligatorio && <span className="text-error" aria-hidden="true"> *</span>}
        </label>

        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.pdf"
          onChange={manejarArchivo}
          className="hidden"
          id={idInput}
        />

        {valor ? (
          <div className="flex items-center justify-between gap-3 p-3 rounded-sm border border-primary/30 bg-primary/5">
            <div className="flex items-center gap-2.5 min-w-0">
              <FileText size={18} className="text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-primary truncate">
                  {nombreArchivo || "Archivo adjunto"}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-text-muted">Almacenado en Supabase</span>
                  {(valor.startsWith("http://") || valor.startsWith("https://") || valor.startsWith("data:")) && (
                    <a
                      href={valor}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-medium text-primary hover:underline"
                    >
                      Ver archivo
                    </a>
                  )}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={quitarArchivo}
              className="p-1 rounded text-text-muted hover:text-error hover:bg-white transition-colors"
              title="Quitar archivo"
              aria-label="Quitar archivo adjunto"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={cargandoArchivo}
            className={`flex items-center justify-center gap-2 p-3 rounded-sm border border-dashed border-neutral-border hover:border-primary bg-surface hover:bg-surface-alt transition-colors text-xs font-medium text-text-muted hover:text-primary ${
              error || errorLocal ? "border-error text-error" : ""
            }`}
          >
            {cargandoArchivo ? (
              <span className="inline-flex items-center gap-2 text-primary font-medium">
                <UploadCloud size={16} className="animate-pulse" />
                Subiendo a Supabase Storage...
              </span>
            ) : (
              <>
                <UploadCloud size={16} />
                <span>Adjuntar archivo (JPG, PNG o PDF máx. 10MB)</span>
              </>
            )}
          </button>
        )}

        {(error || errorLocal) && (
          <p className="text-xs text-error" role="alert">
            {error || errorLocal}
          </p>
        )}
      </div>
    );
  }

  return null;
}
