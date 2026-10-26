"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  User,
  Users,
} from "lucide-react";
import Boton from "@/components/ui/Boton";
import Campo from "@/components/ui/Campo";
import Skeleton from "@/components/ui/Skeleton";
import CampoFormularioEntrada from "@/components/inscripcion/CampoFormularioEntrada";
import { formatoIdentificacion } from "@/lib/format";
import type { Acompanante } from "@/types/reserva";
import type { UsuarioPerfil } from "@/types/usuario";
import type { CampoFormulario } from "@/types/viaje";

interface PasoViajerosProps {
  perfil: UsuarioPerfil | null;
  acompanantes: Acompanante[];
  campos: CampoFormulario[];
  /** Respuestas una sola vez por reserva: idCampo → valor. */
  respuestas: Record<number, string>;
  errores: Record<string, string>;
  alCambiarAcompanante: (
    indice: number,
    campo: keyof Acompanante,
    valor: string,
  ) => void;
  alCambiarRespuesta: (idCampo: number, valor: string) => void;
  alAtras: () => void;
  alContinuar: () => void;
  setErrores?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const TIPOS_IDENTIFICACION = ["cedula", "pasaporte"];

interface SubPaso {
  id: string;
  etiqueta: string;
  tipo: "titular" | "acompanante" | "preguntas";
  indiceAcompanante?: number;
}

export default function PasoViajeros({
  perfil,
  acompanantes,
  campos,
  respuestas,
  errores,
  alCambiarAcompanante,
  alCambiarRespuesta,
  alAtras,
  alContinuar,
  setErrores,
}: PasoViajerosProps) {
  const [subPaso, setSubPaso] = useState(0);

  // Lista de páginas / sub-pasos ordenados
  const subPasos: SubPaso[] = [
    { id: "titular", etiqueta: "Titular", tipo: "titular" },
    ...acompanantes.map((_, idx) => ({
      id: `acomp-${idx}`,
      etiqueta: `Acompañante ${idx + 1}`,
      tipo: "acompanante" as const,
      indiceAcompanante: idx,
    })),
    ...(campos.length > 0
      ? [{ id: "preguntas", etiqueta: "Preguntas del viaje", tipo: "preguntas" as const }]
      : []),
  ];

  // Asegurar que el subPaso esté dentro del rango si cambia la cantidad de acompañantes
  const pasoActual = Math.min(Math.max(0, subPaso), Math.max(0, subPasos.length - 1));

  // Si aparecen errores desde el padre (al pulsar Continuar al pago), navegar automáticamente al primer paso con error
  useEffect(() => {
    const primerAcompConError = acompanantes.findIndex(
      (_, i) =>
        errores[`${i}-primerNombre`] ||
        errores[`${i}-primerApellido`] ||
        errores[`${i}-numeroIdentificacion`],
    );
    if (primerAcompConError !== -1) {
      const idx = subPasos.findIndex(
        (sp) => sp.tipo === "acompanante" && sp.indiceAcompanante === primerAcompConError,
      );
      if (idx !== -1 && idx !== pasoActual) {
        setSubPaso(idx);
        return;
      }
    }

    const tieneErrorPreguntas = campos.some((c) => errores[`resp-${c.idCampo}`]);
    if (primerAcompConError === -1 && tieneErrorPreguntas) {
      const idx = subPasos.findIndex((sp) => sp.tipo === "preguntas");
      if (idx !== -1 && idx !== pasoActual) {
        setSubPaso(idx);
      }
    }
  }, [errores, acompanantes, campos, subPasos, pasoActual]);

  function validarPaso(indice: number): boolean {
    const sp = subPasos[indice];
    if (!sp) return true;

    if (sp.tipo === "acompanante" && sp.indiceAcompanante !== undefined) {
      const acomp = acompanantes[sp.indiceAcompanante];
      const nuevos: Record<string, string> = {};
      if (!acomp.primerNombre.trim()) {
        nuevos[`${sp.indiceAcompanante}-primerNombre`] = "Obligatorio";
      }
      if (!acomp.primerApellido.trim()) {
        nuevos[`${sp.indiceAcompanante}-primerApellido`] = "Obligatorio";
      }
      if (!acomp.numeroIdentificacion.trim()) {
        nuevos[`${sp.indiceAcompanante}-numeroIdentificacion`] = "Obligatorio";
      }
      if (Object.keys(nuevos).length > 0) {
        if (setErrores) {
          setErrores((prev) => ({ ...prev, ...nuevos }));
        }
        return false;
      }
    } else if (sp.tipo === "preguntas") {
      const nuevos: Record<string, string> = {};
      campos
        .filter((campo) => campo.obligatorio)
        .forEach((campo) => {
          const val = (respuestas[campo.idCampo] ?? "").trim();
          if (!val || val === "[]") {
            nuevos[`resp-${campo.idCampo}`] = "Respuesta obligatoria";
          }
        });
      if (Object.keys(nuevos).length > 0) {
        if (setErrores) {
          setErrores((prev) => ({ ...prev, ...nuevos }));
        }
        return false;
      }
    }

    return true;
  }

  function irAlSiguiente() {
    if (!validarPaso(pasoActual)) {
      return;
    }
    if (pasoActual < subPasos.length - 1) {
      setSubPaso(pasoActual + 1);
    }
  }

  function irAlAnterior() {
    if (pasoActual > 0) {
      setSubPaso(pasoActual - 1);
    }
  }

  function navegarASubPaso(indiceDestino: number) {
    if (indiceDestino === pasoActual) return;
    if (indiceDestino > pasoActual) {
      if (!validarPaso(pasoActual)) {
        return;
      }
    }
    setSubPaso(indiceDestino);
  }

  function intentarContinuar() {
    if (!validarPaso(pasoActual)) {
      return;
    }
    alContinuar();
  }

  const subPasoActual = subPasos[pasoActual];

  return (
    <div className="mx-auto max-w-xl space-y-md">
      {/* Encabezado centrado */}
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-primary">
          Datos de los viajeros
        </h2>
        <p className="text-xs text-text-muted">
          Página {pasoActual + 1} de {subPasos.length} · {subPasoActual?.etiqueta}
        </p>
      </div>

      {/* Paginador ordenado y centrado */}
      <div
        className="flex items-center justify-center flex-wrap gap-2 py-2 border-y border-neutral-border/70"
        role="tablist"
        aria-label="Páginas de datos de inscripción"
      >
        {subPasos.map((sp, idx) => {
          const esActivo = idx === pasoActual;
          const tieneError =
            sp.tipo === "acompanante" && sp.indiceAcompanante !== undefined
              ? Boolean(
                  errores[`${sp.indiceAcompanante}-primerNombre`] ||
                  errores[`${sp.indiceAcompanante}-primerApellido`] ||
                  errores[`${sp.indiceAcompanante}-numeroIdentificacion`],
                )
              : sp.tipo === "preguntas"
              ? campos.some((c) => errores[`resp-${c.idCampo}`])
              : false;

          return (
            <button
              key={sp.id}
              type="button"
              role="tab"
              aria-selected={esActivo}
              onClick={() => navegarASubPaso(idx)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all ${
                esActivo
                  ? "bg-primary text-white shadow-sm ring-2 ring-primary/20"
                  : tieneError
                  ? "bg-estado-rechazada-bg text-estado-rechazada-text border border-error/30"
                  : "bg-surface-alt text-text-muted hover:text-text-main hover:bg-neutral-border/50"
              }`}
            >
              <span>
                {idx + 1}. {sp.etiqueta}
              </span>
              {tieneError && <AlertCircle size={12} className="text-error" />}
            </button>
          );
        })}
      </div>

      {/* Contenido centrado de la página activa */}
      {subPasoActual?.tipo === "titular" && (
        <section className="space-y-md rounded-md border border-neutral-border bg-surface p-md shadow-xs">
          <div className="flex items-center gap-sm border-b border-neutral-border pb-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-primary">
                Titular de la reserva (Tú)
              </h3>
              <p className="text-xs text-text-muted">
                Datos asociados a tu cuenta de usuario.
              </p>
            </div>
          </div>

          {perfil ? (
            <dl className="grid gap-sm text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold text-text-muted">Nombre completo</dt>
                <dd className="break-words font-medium text-text-main">
                  {perfil.primerNombre} {perfil.segundoNombre ? `${perfil.segundoNombre} ` : ""}
                  {perfil.primerApellido} {perfil.segundoApellido ? ` ${perfil.segundoApellido}` : ""}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-text-muted">Correo electrónico</dt>
                <dd className="break-words font-medium text-text-main">
                  {perfil.correo}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-text-muted">Identificación</dt>
                <dd className="break-words font-medium text-text-main">
                  {formatoIdentificacion(
                    perfil.tipoIdentificacion,
                    perfil.numeroIdentificacion,
                  )}
                </dd>
              </div>
              {perfil.telefono ? (
                <div>
                  <dt className="text-xs font-semibold text-text-muted">Teléfono</dt>
                  <dd className="break-words font-medium text-text-main">
                    {perfil.telefono}
                  </dd>
                </div>
              ) : null}
            </dl>
          ) : (
            <div className="space-y-sm">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          )}

          <div className="rounded-md bg-surface-alt p-sm text-xs text-text-muted">
            <p>
              Tus datos personales se obtienen automáticamente de tu perfil verificado. Si requieres modificarlos, puedes hacerlo desde los ajustes de tu cuenta.
            </p>
          </div>
        </section>
      )}

      {subPasoActual?.tipo === "acompanante" &&
        subPasoActual.indiceAcompanante !== undefined && (
          <section className="space-y-md rounded-md border border-neutral-border bg-surface p-md shadow-xs">
            <div className="flex items-center gap-sm border-b border-neutral-border pb-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Users size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-primary">
                  Acompañante {subPasoActual.indiceAcompanante + 1} de {acompanantes.length}
                </h3>
                <p className="text-xs text-text-muted">
                  Ingresa los datos personales requeridos para este cupo adicional.
                </p>
              </div>
            </div>

            {(() => {
              const indice = subPasoActual.indiceAcompanante;
              const acomp = acompanantes[indice];
              if (!acomp) return null;

              return (
                <div className="grid gap-md sm:grid-cols-2">
                  <Campo
                    id={`acomp-${indice}-primerNombre`}
                    name={`acomp-${indice}-primerNombre`}
                    label="Primer nombre"
                    required
                    valor={acomp.primerNombre}
                    alCambiar={(valor) =>
                      alCambiarAcompanante(indice, "primerNombre", valor)
                    }
                    error={errores[`${indice}-primerNombre`]}
                  />
                  <Campo
                    id={`acomp-${indice}-primerApellido`}
                    name={`acomp-${indice}-primerApellido`}
                    label="Primer apellido"
                    required
                    valor={acomp.primerApellido}
                    alCambiar={(valor) =>
                      alCambiarAcompanante(indice, "primerApellido", valor)
                    }
                    error={errores[`${indice}-primerApellido`]}
                  />
                  <Campo
                    id={`acomp-${indice}-tipoIdentificacion`}
                    name={`acomp-${indice}-tipoIdentificacion`}
                    label="Tipo de identificación"
                    opciones={TIPOS_IDENTIFICACION}
                    valor={acomp.tipoIdentificacion}
                    alCambiar={(valor) =>
                      alCambiarAcompanante(
                        indice,
                        "tipoIdentificacion",
                        valor as Acompanante["tipoIdentificacion"],
                      )
                    }
                  />
                  <Campo
                    id={`acomp-${indice}-numeroIdentificacion`}
                    name={`acomp-${indice}-numeroIdentificacion`}
                    label="Número de identificación"
                    required
                    placeholder="001-000000-0000A"
                    valor={acomp.numeroIdentificacion}
                    alCambiar={(valor) =>
                      alCambiarAcompanante(indice, "numeroIdentificacion", valor)
                    }
                    error={errores[`${indice}-numeroIdentificacion`]}
                  />
                </div>
              );
            })()}
          </section>
        )}

      {subPasoActual?.tipo === "preguntas" && campos.length > 0 && (
        <section className="space-y-md rounded-md border border-neutral-border bg-surface p-md shadow-xs">
          <div className="flex items-center gap-sm border-b border-neutral-border pb-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-primary">
                Preguntas del viaje
              </h3>
              <p className="text-xs text-text-muted">
                Una respuesta por pregunta, válida para toda la reserva.
              </p>
            </div>
          </div>

          <div className="space-y-md">
            {campos.map((campo) => (
              <CampoFormularioEntrada
                key={campo.idCampo}
                campo={campo}
                valor={respuestas[campo.idCampo] ?? ""}
                alCambiar={(valor) => alCambiarRespuesta(campo.idCampo, valor)}
                error={errores[`resp-${campo.idCampo}`]}
              />
            ))}
          </div>
        </section>
      )}

      {/* Controles de navegación y paginación */}
      <div className="flex items-center justify-between gap-sm pt-sm border-t border-neutral-border">
        {pasoActual === 0 ? (
          <Boton variante="contorno" onClick={alAtras}>
            <ChevronLeft size={16} />
            <span>Volver a Cupos</span>
          </Boton>
        ) : (
          <Boton variante="contorno" onClick={irAlAnterior}>
            <ChevronLeft size={16} />
            <span>Anterior</span>
          </Boton>
        )}

        <span className="text-xs text-text-muted font-medium hidden sm:inline">
          Página {pasoActual + 1} de {subPasos.length}
        </span>

        {pasoActual < subPasos.length - 1 ? (
          <Boton onClick={irAlSiguiente}>
            <span>Siguiente</span>
            <ChevronRight size={16} />
          </Boton>
        ) : (
          <Boton onClick={intentarContinuar}>
            <span>Continuar al pago</span>
            <ChevronRight size={16} />
          </Boton>
        )}
      </div>
    </div>
  );
}
