"use client";

import React, { useRef } from "react";
import type { CampoFormulario, TipoCampoFormulario } from "@/types/viaje";
import {
  FileText,
  Calendar,
  UploadCloud,
  CheckSquare,
  CircleDot,
  AlertCircle,
  FileCheck,
  X,
} from "lucide-react";

interface CampoDinamicoFactoryProps {
  campo: CampoFormulario;
  valor: string;
  alCambiar: (valor: string) => void;
  error?: string;
  disabled?: boolean;
  /** Identificador de la persona (ej. "titular" o "acomp-0") para scoped radio names */
  personaId?: string;
}

function renderIconoTipo(tipo: TipoCampoFormulario) {
  switch (tipo) {
    case "texto":
      return <FileText size={15} className="text-primary shrink-0" />;
    case "seleccion_unica":
      return <CircleDot size={15} className="text-primary shrink-0" />;
    case "seleccion_multiple":
      return <CheckSquare size={15} className="text-primary shrink-0" />;
    case "fecha":
      return <Calendar size={15} className="text-primary shrink-0" />;
    case "archivo":
      return <UploadCloud size={15} className="text-primary shrink-0" />;
    default:
      return <FileText size={15} className="text-primary shrink-0" />;
  }
}

export default function CampoDinamicoFactory({
  campo,
  valor,
  alCambiar,
  error,
  disabled = false,
  personaId = "titular",
}: CampoDinamicoFactoryProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parsear seleccionados para selección múltiple (almacenados como valores separados por coma)
  const seleccionadosMultiples =
    campo.tipoCampo === "seleccion_multiple" && valor
      ? valor.split(", ").map((s) => s.trim()).filter(Boolean)
      : [];

  const handleToggleMultiple = (opcion: string) => {
    let nuevos: string[];
    if (seleccionadosMultiples.includes(opcion)) {
      nuevos = seleccionadosMultiples.filter((item) => item !== opcion);
    } else {
      nuevos = [...seleccionadosMultiples, opcion];
    }
    alCambiar(nuevos.join(", "));
  };

  const handleArchivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      alCambiar(`${file.name} (${Math.round(file.size / 1024)} KB)`);
    }
  };

  const handleQuitarArchivo = () => {
    alCambiar("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const renderControl = () => {
    switch (campo.tipoCampo) {
      case "texto":
        return (
          <div className="relative">
            <input
              type="text"
              disabled={disabled}
              value={valor}
              onChange={(e) => alCambiar(e.target.value)}
              placeholder="Escribe tu respuesta aquí..."
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm bg-surface outline-none transition-all ${
                error
                  ? "border-error focus:ring-2 focus:ring-error/20"
                  : "border-neutral-border focus:ring-2 focus:ring-primary/20 focus:border-primary"
              }`}
            />
          </div>
        );

      case "seleccion_unica":
        return (
          <div className="space-y-2 pt-1">
            {campo.opciones && campo.opciones.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {campo.opciones.map((opcion) => {
                  const activa = valor === opcion;
                  return (
                    <label
                      key={opcion}
                      className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer text-sm transition-all select-none ${
                        activa
                          ? "border-primary bg-primary/5 text-primary font-medium ring-1 ring-primary"
                          : "border-neutral-border bg-surface hover:bg-surface-alt text-text-main"
                      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <input
                        type="radio"
                        disabled={disabled}
                        name={`campo-${campo.idCampo}-${personaId}`}
                        value={opcion}
                        checked={activa}
                        onChange={() => alCambiar(opcion)}
                        className="accent-primary h-4 w-4 shrink-0"
                      />
                      <span className="truncate">{opcion}</span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-text-muted italic">Sin opciones configuradas.</p>
            )}
          </div>
        );

      case "seleccion_multiple":
        return (
          <div className="space-y-2 pt-1">
            {campo.opciones && campo.opciones.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {campo.opciones.map((opcion) => {
                  const marcada = seleccionadosMultiples.includes(opcion);
                  return (
                    <label
                      key={opcion}
                      className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer text-sm transition-all select-none ${
                        marcada
                          ? "border-primary bg-primary/5 text-primary font-medium ring-1 ring-primary"
                          : "border-neutral-border bg-surface hover:bg-surface-alt text-text-main"
                      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <input
                        type="checkbox"
                        disabled={disabled}
                        checked={marcada}
                        onChange={() => handleToggleMultiple(opcion)}
                        className="accent-primary h-4 w-4 rounded shrink-0"
                      />
                      <span className="truncate">{opcion}</span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-text-muted italic">Sin opciones configuradas.</p>
            )}
          </div>
        );

      case "fecha":
        return (
          <div className="relative max-w-xs">
            <input
              type="date"
              disabled={disabled}
              value={valor}
              onChange={(e) => alCambiar(e.target.value)}
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm bg-surface outline-none transition-all ${
                error
                  ? "border-error focus:ring-2 focus:ring-error/20"
                  : "border-neutral-border focus:ring-2 focus:ring-primary/20 focus:border-primary"
              }`}
            />
          </div>
        );

      case "archivo":
        return (
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              disabled={disabled}
              onChange={handleArchivoChange}
              className="hidden"
              id={`file-campo-${campo.idCampo}-${personaId}`}
            />
            {valor ? (
              <div className="flex items-center justify-between p-3 rounded-lg border border-primary/30 bg-primary/5 max-w-md">
                <div className="flex items-center gap-2.5 truncate">
                  <FileCheck size={18} className="text-primary shrink-0" />
                  <span className="text-sm font-medium text-primary truncate">{valor}</span>
                </div>
                {!disabled && (
                  <button
                    type="button"
                    onClick={handleQuitarArchivo}
                    className="p-1 text-text-muted hover:text-error transition-colors"
                    title="Eliminar adjunto"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ) : (
              <label
                htmlFor={`file-campo-${campo.idCampo}-${personaId}`}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-neutral-border hover:border-primary bg-surface hover:bg-surface-alt text-sm font-medium text-text-muted hover:text-primary cursor-pointer transition-colors ${
                  disabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <UploadCloud size={18} />
                <span>Adjuntar archivo / comprobante</span>
              </label>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-1.5 p-3.5 bg-surface-alt/40 rounded-lg border border-neutral-border/60">
      <div className="flex items-start justify-between gap-2">
        <label className="text-sm font-semibold text-text-main flex items-center gap-1.5">
          {renderIconoTipo(campo.tipoCampo)}
          <span>{campo.etiquetaPregunta}</span>
          {campo.obligatorio && (
            <span className="text-error font-bold" title="Campo obligatorio">
              *
            </span>
          )}
        </label>
        {campo.obligatorio ? (
          <span className="text-[10px] font-bold text-error uppercase tracking-wider bg-error/10 px-1.5 py-0.5 rounded border border-error/20 shrink-0">
            Requerido
          </span>
        ) : (
          <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider bg-neutral-border/30 px-1.5 py-0.5 rounded shrink-0">
            Opcional
          </span>
        )}
      </div>

      {renderControl()}

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-error font-medium pt-0.5" role="alert">
          <AlertCircle size={13} className="shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
