"use client";

import React, { useState, useRef } from "react";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Minus,
  Eye,
  Edit3,
  HelpCircle,
  X,
} from "lucide-react";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";
import Modal from "@/components/ui/Modal";

interface MarkdownEditorProps {
  valor: string;
  alCambiar: (valor: string) => void;
  label?: string;
  error?: string;
  placeholder?: string;
  filas?: number;
  className?: string;
}

export default function MarkdownEditor({
  valor,
  alCambiar,
  label = "Descripción y detalles del viaje",
  error,
  placeholder = "Describe los atractivos, itinerario, qué incluye y equipo recomendado usando las opciones de formato...",
  filas = 10,
  className = "",
}: MarkdownEditorProps) {
  const [pestana, setPestana] = useState<"escribir" | "vistaPrevia">("escribir");
  const [mostrarGuia, setMostrarGuia] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function insertarFormato(prefijo: string, sufijo: string = "", textoPorDefecto: string = "") {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const inicio = textarea.selectionStart;
    const fin = textarea.selectionEnd;
    const seleccion = valor.substring(inicio, fin);
    const textoInsertar = seleccion || textoPorDefecto;
    const nuevoValor =
      valor.substring(0, inicio) + prefijo + textoInsertar + sufijo + valor.substring(fin);

    alCambiar(nuevoValor);

    requestAnimationFrame(() => {
      textarea.focus();
      const nuevaPosInicio = inicio + prefijo.length;
      const nuevaPosFin = nuevaPosInicio + textoInsertar.length;
      textarea.setSelectionRange(nuevaPosInicio, nuevaPosFin);
    });
  }

  const caracteres = valor ? valor.length : 0;
  const palabras = valor ? valor.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Encabezado y pestañas */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <label className="text-xs font-semibold text-text-muted">
          {label}
        </label>
        <div className="flex items-center gap-1.5">
          <div className="inline-flex rounded border border-neutral-border p-0.5 bg-surface text-xs font-medium">
            <button
              type="button"
              onClick={() => setPestana("escribir")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                pestana === "escribir"
                  ? "bg-primary text-white"
                  : "text-text-muted hover:text-primary"
              }`}
            >
              <Edit3 size={13} />
              <span>Escribir</span>
            </button>
            <button
              type="button"
              onClick={() => setPestana("vistaPrevia")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                pestana === "vistaPrevia"
                  ? "bg-primary text-white"
                  : "text-text-muted hover:text-primary"
              }`}
            >
              <Eye size={13} />
              <span>Vista previa</span>
            </button>
          </div>
          <button
            type="button"
            onClick={() => setMostrarGuia(true)}
            className="p-1.5 rounded text-text-muted hover:text-primary hover:bg-surface-alt transition-colors"
            title="Guía de Formato de Texto"
            aria-label="Guía de Formato de Texto"
          >
            <HelpCircle size={16} />
          </button>
        </div>
      </div>

      {/* Modal de Guía de Formato de Texto */}
      <Modal
        abierto={mostrarGuia}
        onCerrar={() => setMostrarGuia(false)}
        titulo="Guía de Formato de Texto"
        zIndex="z-[80]"
        className="max-w-lg p-5"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-border pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/15 text-secondary">
                <HelpCircle size={18} />
              </div>
              <h3 className="text-base font-bold text-primary">
                Guía de Formato de Texto
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setMostrarGuia(false)}
              className="rounded-lg p-1.5 text-text-muted hover:bg-surface-alt hover:text-primary transition-colors"
              aria-label="Cerrar guía"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-2 text-xs text-text-muted">
            <p className="font-semibold text-primary">
              💡 No necesitas memorizar símbolos ni códigos:
            </p>
            <p>
              Utiliza la barra de herramientas superior para insertar formatos automáticamente sobre el texto seleccionado o en el cursor.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
            <div className="p-2.5 bg-surface-alt rounded border border-neutral-border">
              <span className="font-bold text-primary font-mono text-[11px]">## Título</span>
              <p className="text-[11px] text-text-muted mt-0.5">Sección destacada</p>
            </div>
            <div className="p-2.5 bg-surface-alt rounded border border-neutral-border">
              <span className="font-bold text-primary font-mono text-[11px]">**Texto resaltado**</span>
              <p className="text-[11px] text-text-muted mt-0.5">Negrita</p>
            </div>
            <div className="p-2.5 bg-surface-alt rounded border border-neutral-border">
              <span className="font-bold text-primary font-mono text-[11px]">*Texto en cursiva*</span>
              <p className="text-[11px] text-text-muted mt-0.5">Cursiva</p>
            </div>
            <div className="p-2.5 bg-surface-alt rounded border border-neutral-border">
              <span className="font-bold text-primary font-mono text-[11px]">- Elemento</span>
              <p className="text-[11px] text-text-muted mt-0.5">Lista con viñetas</p>
            </div>
            <div className="p-2.5 bg-surface-alt rounded border border-neutral-border">
              <span className="font-bold text-primary font-mono text-[11px]">1. Paso</span>
              <p className="text-[11px] text-text-muted mt-0.5">Lista numerada</p>
            </div>
            <div className="p-2.5 bg-surface-alt rounded border border-neutral-border">
              <span className="font-bold text-primary font-mono text-[11px]">&gt; Cita o nota</span>
              <p className="text-[11px] text-text-muted mt-0.5">Bloque de cita o nota</p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setMostrarGuia(false)}
              className="px-4 py-1.5 text-xs font-semibold rounded bg-primary text-white hover:bg-primary-hover transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      </Modal>

      {/* Contenedor principal del editor */}
      <div
        className={`rounded-md border bg-surface overflow-hidden ${
          error ? "border-error" : "border-neutral-border focus-within:border-primary"
        }`}
      >
        {/* Barra de herramientas (visible en modo escribir) */}
        {pestana === "escribir" && (
          <div className="flex items-center flex-wrap gap-0.5 border-b border-neutral-border bg-surface-alt/70 px-2 py-1.5">
            <button
              type="button"
              onClick={() => insertarFormato("**", "**", "texto en negrita")}
              className="p-1.5 rounded hover:bg-surface text-text-muted hover:text-primary transition-colors"
              title="Negrita (**texto**)"
            >
              <Bold size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertarFormato("*", "*", "texto en cursiva")}
              className="p-1.5 rounded hover:bg-surface text-text-muted hover:text-primary transition-colors"
              title="Cursiva (*texto*)"
            >
              <Italic size={15} />
            </button>
            <span className="h-4 w-px bg-neutral-border mx-1" aria-hidden="true" />
            <button
              type="button"
              onClick={() => insertarFormato("\n## ", "\n", "Título de sección")}
              className="p-1.5 rounded hover:bg-surface text-text-muted hover:text-primary transition-colors"
              title="Título H2 (## Sección)"
            >
              <Heading2 size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertarFormato("\n### ", "\n", "Subtítulo")}
              className="p-1.5 rounded hover:bg-surface text-text-muted hover:text-primary transition-colors"
              title="Subtítulo H3 (### Subtítulo)"
            >
              <Heading3 size={15} />
            </button>
            <span className="h-4 w-px bg-neutral-border mx-1" aria-hidden="true" />
            <button
              type="button"
              onClick={() => insertarFormato("- ", "", "Elemento de lista")}
              className="p-1.5 rounded hover:bg-surface text-text-muted hover:text-primary transition-colors"
              title="Lista con viñetas (- elemento)"
            >
              <List size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertarFormato("1. ", "", "Primer paso")}
              className="p-1.5 rounded hover:bg-surface text-text-muted hover:text-primary transition-colors"
              title="Lista numerada (1. paso)"
            >
              <ListOrdered size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertarFormato("> ", "", "Cita o nota")}
              className="p-1.5 rounded hover:bg-surface text-text-muted hover:text-primary transition-colors"
              title="Cita o nota (> texto)"
            >
              <Quote size={15} />
            </button>
            <span className="h-4 w-px bg-neutral-border mx-1" aria-hidden="true" />
            <button
              type="button"
              onClick={() => insertarFormato("[", "](https://ejemplo.com)", "texto del enlace")}
              className="p-1.5 rounded hover:bg-surface text-text-muted hover:text-primary transition-colors"
              title="Enlace ([texto](url))"
            >
              <LinkIcon size={15} />
            </button>
            <button
              type="button"
              onClick={() => insertarFormato("\n---\n", "", "")}
              className="p-1.5 rounded hover:bg-surface text-text-muted hover:text-primary transition-colors"
              title="Línea divisoria (---)"
            >
              <Minus size={15} />
            </button>
          </div>
        )}

        {/* Cuerpo: Área de texto o Vista previa */}
        {pestana === "escribir" ? (
          <textarea
            ref={textareaRef}
            rows={filas}
            value={valor}
            onChange={(e) => alCambiar(e.target.value)}
            placeholder={placeholder}
            className="w-full resize-y p-3 text-sm text-primary placeholder:text-text-muted/60 focus:outline-none font-sans"
          />
        ) : (
          <div className="min-h-[220px] max-h-[450px] overflow-y-auto p-4 bg-sand/15">
            {valor.trim() ? (
              <MarkdownRenderer contenido={valor} />
            ) : (
              <p className="text-xs text-text-muted italic py-6 text-center">
                Escribe algo en la pestaña &quot;Escribir&quot; para previsualizar aquí el formato enriquecido.
              </p>
            )}
          </div>
        )}

        {/* Pie: Contador de caracteres y palabras */}
        <div className="flex items-center justify-between border-t border-neutral-border bg-surface-alt/50 px-3 py-1 text-[11px] text-text-muted">
          <span>{palabras} {palabras === 1 ? "palabra" : "palabras"}</span>
          <span>{caracteres} caracteres</span>
        </div>
      </div>

      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
