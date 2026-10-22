"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Check } from "lucide-react";

interface SelectorFechaHoraProps {
  label: string;
  valor: string; // Formato YYYY-MM-DDTHH:mm
  alCambiar: (nuevoValor: string) => void;
  error?: string;
  hint?: string;
  min?: string; // Formato YYYY-MM-DDTHH:mm o YYYY-MM-DD
  required?: boolean;
  disabled?: boolean;
  onBlur?: () => void;
  id?: string;
}

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const DIAS_SEMANA = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

const HORAS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTOS = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Formatea una fecha local para mostrar al usuario (ej. "25 oct 2026, 14:30") */
function formatearParaMostrar(isoLocal: string): string {
  if (!isoLocal) return "";
  const [fechaParte, horaParte] = isoLocal.split("T");
  if (!fechaParte) return "";
  const [y, m, d] = fechaParte.split("-").map(Number);
  const mesCorto = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"][m - 1] ?? "";
  const horaTexto = horaParte ? `, ${horaParte}` : "";
  return `${d} ${mesCorto} ${y}${horaTexto}`;
}

export default function SelectorFechaHora({
  label,
  valor,
  alCambiar,
  error,
  hint,
  min,
  required = false,
  disabled = false,
  onBlur,
  id,
}: SelectorFechaHoraProps) {
  const idGenerado = useId();
  const campoId = id ?? idGenerado;

  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);
  const horaListaRef = useRef<HTMLDivElement>(null);
  const minutoListaRef = useRef<HTMLDivElement>(null);

  // Parsear valor actual o inicializar
  const ahora = new Date();
  let fechaSeleccionada = "";
  let horaSeleccionada = "12";
  let minutoSeleccionado = "00";

  if (valor && valor.includes("T")) {
    const [f, h] = valor.split("T");
    fechaSeleccionada = f;
    const [hh, mm] = (h || "12:00").split(":");
    horaSeleccionada = hh.padStart(2, "0");
    minutoSeleccionado = (mm || "00").slice(0, 2).padStart(2, "0");
  }

  // Estado para el mes y año en visualización del calendario
  const [vistaMes, setVistaMes] = useState<number>(() => {
    if (fechaSeleccionada) {
      const [, m] = fechaSeleccionada.split("-").map(Number);
      return m - 1;
    }
    return ahora.getMonth();
  });

  const [vistaAnio, setVistaAnio] = useState<number>(() => {
    if (fechaSeleccionada) {
      const [y] = fechaSeleccionada.split("-").map(Number);
      return y;
    }
    return ahora.getFullYear();
  });

  // Manejar clic fuera para cerrar el selector
  useEffect(() => {
    if (!abierto) return;

    function manejarClicFuera(evento: MouseEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(evento.target as Node)) {
        setAbierto(false);
        onBlur?.();
      }
    }

    document.addEventListener("mousedown", manejarClicFuera);
    return () => {
      document.removeEventListener("mousedown", manejarClicFuera);
    };
  }, [abierto, onBlur]);

  // Hacer scroll automático al número activo en los rollers cuando se abre el panel
  useEffect(() => {
    if (abierto) {
      if (horaListaRef.current) {
        const itemActivo = horaListaRef.current.querySelector<HTMLElement>('[data-activo="true"]');
        if (itemActivo) {
          horaListaRef.current.scrollTop = itemActivo.offsetTop - horaListaRef.current.offsetTop - 36;
        }
      }
      if (minutoListaRef.current) {
        const itemActivo = minutoListaRef.current.querySelector<HTMLElement>('[data-activo="true"]');
        if (itemActivo) {
          minutoListaRef.current.scrollTop = itemActivo.offsetTop - minutoListaRef.current.offsetTop - 36;
        }
      }
    }
  }, [abierto, horaSeleccionada, minutoSeleccionado]);

  // Navegación de mes
  function mesAnterior() {
    if (vistaMes === 0) {
      setVistaMes(11);
      setVistaAnio((y) => y - 1);
    } else {
      setVistaMes((m) => m - 1);
    }
  }

  function mesSiguiente() {
    if (vistaMes === 11) {
      setVistaMes(0);
      setVistaAnio((y) => y + 1);
    } else {
      setVistaMes((m) => m + 1);
    }
  }

  // Parsear min fecha
  let minFechaStr = "";
  if (min) {
    minFechaStr = min.includes("T") ? min.split("T")[0] : min;
  }

  // Días del mes a renderizar
  const primerDiaMes = new Date(vistaAnio, vistaMes, 1);
  // getDay(): 0 es Domingo, convertir a 0=Lunes, 6=Domingo
  const diaSemanaInicio = (primerDiaMes.getDay() + 6) % 7;
  const diasEnMes = new Date(vistaAnio, vistaMes + 1, 0).getDate();

  function actualizarValor(nuevaFecha: string, nuevaHora: string, nuevoMinuto: string) {
    if (!nuevaFecha) return;
    const finalValor = `${nuevaFecha}T${nuevaHora}:${nuevoMinuto}`;
    alCambiar(finalValor);
  }

  function seleccionarDia(dia: number) {
    const fStr = `${vistaAnio}-${pad(vistaMes + 1)}-${pad(dia)}`;
    actualizarValor(fStr, horaSeleccionada, minutoSeleccionado);
  }

  function seleccionarHora(h: string) {
    const fStr = fechaSeleccionada || `${vistaAnio}-${pad(vistaMes + 1)}-${pad(ahora.getDate())}`;
    actualizarValor(fStr, h, minutoSeleccionado);
  }

  function seleccionarMinuto(m: string) {
    const fStr = fechaSeleccionada || `${vistaAnio}-${pad(vistaMes + 1)}-${pad(ahora.getDate())}`;
    actualizarValor(fStr, horaSeleccionada, m);
  }

  function seleccionarHoyYAhora() {
    const hoy = new Date();
    const fStr = `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}-${pad(hoy.getDate())}`;
    const hStr = pad(hoy.getHours());
    const mStr = pad(hoy.getMinutes());
    setVistaAnio(hoy.getFullYear());
    setVistaMes(hoy.getMonth());
    actualizarValor(fStr, hStr, mStr);
  }

  const hoyStr = `${ahora.getFullYear()}-${pad(ahora.getMonth() + 1)}-${pad(ahora.getDate())}`;
  const textoMostrado = formatearParaMostrar(valor);

  return (
    <div className="relative flex flex-col gap-1" ref={contenedorRef}>
      <label htmlFor={campoId} className="text-xs font-semibold text-text-muted">
        {label}
        {required && (
          <span className="text-error" aria-hidden="true">
            {" "}*
          </span>
        )}
      </label>

      {/* Botón activador que muestra la fecha y abre el selector */}
      <button
        type="button"
        id={campoId}
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setAbierto((prev) => !prev);
          }
        }}
        className={`flex w-full items-center justify-between rounded-sm border bg-surface px-3 py-2.5 text-left text-sm text-text-main outline-none transition disabled:bg-surface-alt disabled:text-text-muted ${
          error
            ? "border-error ring-1 ring-error"
            : abierto
            ? "border-primary ring-1 ring-primary"
            : "border-neutral-border hover:border-neutral-400"
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <CalendarIcon size={16} className={valor ? "text-primary" : "text-text-muted"} />
          <span className={textoMostrado ? "text-text-main font-medium" : "text-text-muted"}>
            {textoMostrado || "Seleccionar fecha y hora..."}
          </span>
        </div>
        <Clock size={15} className="text-text-muted shrink-0" />
      </button>

      {error ? (
        <p className="text-xs text-error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-text-muted">{hint}</p>
      ) : null}

      {/* Panel flotante de selección (Calendario + Roller de Tiempo) */}
      {abierto && (
        <div
          role="dialog"
          aria-label={`Selector de fecha y hora para ${label}`}
          className="absolute top-full left-0 mt-1 z-50 w-full sm:w-[350px] rounded-lg border border-admin-border bg-white p-3 shadow-xl ring-1 ring-black/5"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Sección Calendario */}
            <div className="flex-1 min-w-0">
              {/* Encabezado Mes / Año */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-admin-border">
                <button
                  type="button"
                  onClick={mesAnterior}
                  aria-label="Mes anterior"
                  className="rounded p-1 hover:bg-admin-bg text-admin-muted hover:text-admin-text transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-semibold text-admin-text">
                  {MESES[vistaMes]} {vistaAnio}
                </span>
                <button
                  type="button"
                  onClick={mesSiguiente}
                  aria-label="Mes siguiente"
                  className="rounded p-1 hover:bg-admin-bg text-admin-muted hover:text-admin-text transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Días de la semana */}
              <div className="grid grid-cols-7 gap-1 text-center mb-1">
                {DIAS_SEMANA.map((dia) => (
                  <span key={dia} className="text-[10px] font-semibold text-admin-muted">
                    {dia}
                  </span>
                ))}
              </div>

              {/* Cuadrícula de días */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {/* Espacios vacíos antes del primer día */}
                {Array.from({ length: diaSemanaInicio }, (_, i) => (
                  <div key={`vacio-${i}`} className="h-7 w-7" />
                ))}

                {/* Días del mes */}
                {Array.from({ length: diasEnMes }, (_, i) => {
                  const dia = i + 1;
                  const diaFechaStr = `${vistaAnio}-${pad(vistaMes + 1)}-${pad(dia)}`;
                  const esPasado = minFechaStr ? diaFechaStr < minFechaStr : false;
                  const esSeleccionado = fechaSeleccionada === diaFechaStr;
                  const esHoy = diaFechaStr === hoyStr;

                  return (
                    <button
                      key={dia}
                      type="button"
                      disabled={esPasado}
                      onClick={() => seleccionarDia(dia)}
                      className={`h-7 w-7 rounded text-xs font-medium transition-colors flex items-center justify-center ${
                        esSeleccionado
                          ? "bg-admin-accent text-white font-bold shadow-xs"
                          : esPasado
                          ? "text-neutral-300 cursor-not-allowed line-through"
                          : esHoy
                          ? "border border-admin-accent text-admin-accent hover:bg-admin-bg"
                          : "text-admin-text hover:bg-admin-bg"
                      }`}
                    >
                      {dia}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Separador vertical en desktop */}
            <div className="hidden sm:block w-px bg-admin-border self-stretch" />

            {/* Sección Roller de Tiempo (Hora y Minuto) */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-admin-muted pb-1 mb-1 border-b border-admin-border w-full justify-around">
                <span>Hora</span>
                <span>Min</span>
              </div>

              <div className="flex gap-1.5 h-44">
                {/* Columna de Horas (00 a 23) - Espaciado idéntico y uniforme */}
                <div
                  ref={horaListaRef}
                  className="flex flex-col gap-0.5 overflow-y-auto w-12 px-0.5 py-0.5 border border-admin-border rounded bg-neutral-50 scroll-smooth"
                  style={{ scrollbarWidth: "thin" }}
                >
                  {HORAS.map((h) => {
                    const activa = h === horaSeleccionada;
                    return (
                      <button
                        key={`hora-${h}`}
                        type="button"
                        data-activo={activa}
                        onClick={() => seleccionarHora(h)}
                        className={`h-6 w-full shrink-0 flex items-center justify-center rounded text-[11px] font-mono transition-colors ${
                          activa
                            ? "bg-admin-accent text-white font-bold"
                            : "text-admin-text hover:bg-admin-bg"
                        }`}
                      >
                        {h}
                      </button>
                    );
                  })}
                </div>

                {/* Columna de Minutos (00 a 59) - Espaciado idéntico y uniforme */}
                <div
                  ref={minutoListaRef}
                  className="flex flex-col gap-0.5 overflow-y-auto w-12 px-0.5 py-0.5 border border-admin-border rounded bg-neutral-50 scroll-smooth"
                  style={{ scrollbarWidth: "thin" }}
                >
                  {MINUTOS.map((m) => {
                    const activo = m === minutoSeleccionado;
                    return (
                      <button
                        key={`min-${m}`}
                        type="button"
                        data-activo={activo}
                        onClick={() => seleccionarMinuto(m)}
                        className={`h-6 w-full shrink-0 flex items-center justify-center rounded text-[11px] font-mono transition-colors ${
                          activo
                            ? "bg-admin-accent text-white font-bold"
                            : "text-admin-text hover:bg-admin-bg"
                        }`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Pie de acciones del selector */}
          <div className="mt-3 pt-2 border-t border-admin-border flex items-center justify-between">
            <button
              type="button"
              onClick={seleccionarHoyYAhora}
              className="text-[11px] font-medium text-admin-accent hover:underline"
            >
              Hoy y ahora
            </button>
            <button
              type="button"
              onClick={() => {
                setAbierto(false);
                onBlur?.();
              }}
              className="flex items-center gap-1 rounded bg-admin-accent px-2.5 py-1 text-xs font-semibold text-white hover:bg-admin-accent-hover transition-colors shadow-xs"
            >
              <Check size={14} />
              <span>Listo</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
