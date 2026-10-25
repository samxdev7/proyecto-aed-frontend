"use client";

import React from "react";

interface MarkdownRendererProps {
  contenido?: string | null;
  className?: string;
}

/**
 * Parsea y formatea inline tokens: enlaces, negrita, cursiva y código inline.
 */
function renderizarInline(texto: string): React.ReactNode[] {
  // Regex para:
  // 1: [texto](url)
  // 2: **negrita**
  // 3: *cursiva*
  // 4: `codigo`
  const regex = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;
  const elementos: React.ReactNode[] = [];
  let ultimoIndice = 0;
  let coincidencia: RegExpExecArray | null;

  while ((coincidencia = regex.exec(texto)) !== null) {
    if (coincidencia.index > ultimoIndice) {
      elementos.push(texto.slice(ultimoIndice, coincidencia.index));
    }

    const [completo, , textoEnlace, urlEnlace, textoNegrita, textoCursiva, textoCodigo] = coincidencia;

    if (textoEnlace && urlEnlace) {
      elementos.push(
        <a
          key={`link-${coincidencia.index}`}
          href={urlEnlace}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-secondary hover:underline transition-colors"
        >
          {textoEnlace}
        </a>,
      );
    } else if (textoNegrita) {
      elementos.push(
        <strong key={`b-${coincidencia.index}`} className="font-semibold text-primary">
          {textoNegrita}
        </strong>,
      );
    } else if (textoCursiva) {
      elementos.push(
        <em key={`i-${coincidencia.index}`} className="italic">
          {textoCursiva}
        </em>,
      );
    } else if (textoCodigo) {
      elementos.push(
        <code
          key={`c-${coincidencia.index}`}
          className="rounded bg-sand px-1.5 py-0.5 font-mono text-xs text-primary"
        >
          {textoCodigo}
        </code>,
      );
    }

    ultimoIndice = coincidencia.index + completo.length;
  }

  if (ultimoIndice < texto.length) {
    elementos.push(texto.slice(ultimoIndice));
  }

  return elementos;
}

/**
 * Renderizador ligero y sin dependencias para contenido Markdown en descripciones de viajes.
 * Soporta encabezados (#, ##, ###), listas ordenadas/desordenadas, citas (>), reglas horizontales (---),
 * negritas, cursivas, enlaces y saltos de párrafo fluidos.
 */
export default function MarkdownRenderer({ contenido, className = "" }: MarkdownRendererProps) {
  if (!contenido || !contenido.trim()) {
    return null;
  }

  const lineas = contenido.replace(/\r\n/g, "\n").split("\n");
  const bloques: React.ReactNode[] = [];

  let i = 0;
  while (i < lineas.length) {
    const linea = lineas[i];
    const lineaTrim = linea.trim();

    // Líneas vacías
    if (!lineaTrim) {
      i++;
      continue;
    }

    // Encabezado H1: # Título
    if (lineaTrim.startsWith("# ") && !lineaTrim.startsWith("## ")) {
      bloques.push(
        <h2 key={`h1-${i}`} className="mt-4 mb-2 text-xl font-bold text-primary tracking-tight">
          {renderizarInline(lineaTrim.slice(2))}
        </h2>,
      );
      i++;
      continue;
    }

    // Encabezado H2: ## Título
    if (lineaTrim.startsWith("## ") && !lineaTrim.startsWith("### ")) {
      bloques.push(
        <h3 key={`h2-${i}`} className="mt-4 mb-2 pb-1 text-lg font-bold text-primary border-b border-neutral-border/60">
          {renderizarInline(lineaTrim.slice(3))}
        </h3>,
      );
      i++;
      continue;
    }

    // Encabezado H3: ### Título
    if (lineaTrim.startsWith("### ")) {
      bloques.push(
        <h4 key={`h3-${i}`} className="mt-3 mb-1.5 text-base font-semibold text-primary">
          {renderizarInline(lineaTrim.slice(4))}
        </h4>,
      );
      i++;
      continue;
    }

    // Regla horizontal: --- o ***
    if (/^(\-{3,}|\*{3,})$/.test(lineaTrim)) {
      bloques.push(<hr key={`hr-${i}`} className="my-4 border-neutral-border" />);
      i++;
      continue;
    }

    // Cita / Blockquote: > texto
    if (lineaTrim.startsWith(">")) {
      const citas: string[] = [];
      while (i < lineas.length && lineas[i].trim().startsWith(">")) {
        citas.push(lineas[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      bloques.push(
        <blockquote
          key={`quote-${i}`}
          className="my-3 border-l-4 border-secondary/60 bg-sand/40 px-3.5 py-2 text-sm italic text-text-muted rounded-r"
        >
          {citas.map((cita, idx) => (
            <p key={`qp-${idx}`}>{renderizarInline(cita)}</p>
          ))}
        </blockquote>,
      );
      continue;
    }

    // Lista desordenada: - elemento o * elemento
    if (/^[\*\-]\s+/.test(lineaTrim)) {
      const items: string[] = [];
      while (i < lineas.length && /^[\*\-]\s+/.test(lineas[i].trim())) {
        items.push(lineas[i].trim().replace(/^[\*\-]\s+/, ""));
        i++;
      }
      bloques.push(
        <ul key={`ul-${i}`} className="my-2.5 space-y-1 pl-5 list-disc text-sm text-text-muted">
          {items.map((item, idx) => (
            <li key={`li-${idx}`} className="leading-relaxed">
              {renderizarInline(item)}
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    // Lista ordenada: 1. elemento
    if (/^\d+\.\s+/.test(lineaTrim)) {
      const items: string[] = [];
      while (i < lineas.length && /^\d+\.\s+/.test(lineas[i].trim())) {
        items.push(lineas[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      bloques.push(
        <ol key={`ol-${i}`} className="my-2.5 space-y-1 pl-5 list-decimal text-sm text-text-muted">
          {items.map((item, idx) => (
            <li key={`oli-${idx}`} className="leading-relaxed">
              {renderizarInline(item)}
            </li>
          ))}
        </ol>,
      );
      continue;
    }

    // Párrafo estándar: acumular líneas consecutivas que no sean bloques especiales
    const parrafoLineas: string[] = [];
    while (
      i < lineas.length &&
      lineas[i].trim() &&
      !lineas[i].trim().startsWith("#") &&
      !lineas[i].trim().startsWith(">") &&
      !/^[\*\-]\s+/.test(lineas[i].trim()) &&
      !/^\d+\.\s+/.test(lineas[i].trim()) &&
      !/^(\-{3,}|\*{3,})$/.test(lineas[i].trim())
    ) {
      parrafoLineas.push(lineas[i].trim());
      i++;
    }

    bloques.push(
      <p key={`p-${i}`} className="my-2 text-sm leading-relaxed text-text-muted">
        {parrafoLineas.map((line, idx) => (
          <React.Fragment key={`pl-${idx}`}>
            {renderizarInline(line)}
            {idx < parrafoLineas.length - 1 && <br />}
          </React.Fragment>
        ))}
      </p>,
    );
  }

  return <div className={`markdown-body space-y-1 ${className}`}>{bloques}</div>;
}
