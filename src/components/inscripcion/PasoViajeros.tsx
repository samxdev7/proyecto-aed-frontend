"use client";

import Boton from "@/components/ui/Boton";
import Campo from "@/components/ui/Campo";
import Skeleton from "@/components/ui/Skeleton";
import CampoDinamicoFactory from "@/components/inscripcion/CampoDinamicoFactory";
import type { Acompanante } from "@/types/reserva";
import type { UsuarioPerfil } from "@/types/usuario";
import type { CampoFormulario } from "@/types/viaje";

interface PasoViajerosProps {
  perfil: UsuarioPerfil | null;
  acompanantes: Acompanante[];
  campos: CampoFormulario[];
  /** Respuestas por persona: clave "titular" o "acomp-<índice>". */
  respuestas: Record<string, Record<number, string>>;
  errores: Record<string, string>;
  alCambiarAcompanante: (
    indice: number,
    campo: keyof Acompanante,
    valor: string,
  ) => void;
  alCambiarRespuesta: (
    persona: string,
    idCampo: number,
    respuesta: string,
  ) => void;
  alAtras: () => void;
  alContinuar: () => void;
}

const TIPOS_IDENTIFICACION = ["cedula", "pasaporte"];

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
}: PasoViajerosProps) {
  /** Las preguntas del viaje se responden de forma individual para cada persona. */
  const preguntasDe = (persona: string) =>
    campos.length > 0 ? (
      <div className="space-y-3 border-t border-neutral-border pt-4 mt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Preguntas adicionales del viaje
          </h4>
          <span className="text-[11px] text-text-muted">
            {campos.length} {campos.length === 1 ? "pregunta" : "preguntas"}
          </span>
        </div>
        <div className="space-y-3">
          {campos.map((campo) => (
            <CampoDinamicoFactory
              key={campo.idCampo}
              campo={campo}
              personaId={persona}
              valor={respuestas[persona]?.[campo.idCampo] ?? ""}
              alCambiar={(valor) =>
                alCambiarRespuesta(persona, campo.idCampo, valor)
              }
              error={errores[`resp-${persona}-${campo.idCampo}`]}
            />
          ))}
        </div>
      </div>
    ) : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl font-bold text-navy">
          Datos de los viajeros
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          El titular se autocompleta con tu cuenta; completa los datos de cada
          acompañante y responde las preguntas de la expedición por separado para cada persona.
        </p>
      </div>

      {/* Titular */}
      <section className="space-y-3 rounded-lg border border-neutral-border bg-surface p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-border pb-2.5">
          <h3 className="text-sm font-bold text-primary flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              1
            </span>
            Titular de la reserva (Tú)
          </h3>
          <span className="text-xs text-text-muted bg-surface-alt px-2 py-0.5 rounded">
            Perfil verificado
          </span>
        </div>

        {perfil ? (
          <dl className="grid gap-3 text-sm sm:grid-cols-3 bg-surface-alt/50 p-3 rounded-md">
            <div>
              <dt className="text-xs font-semibold text-text-muted">Nombre completo</dt>
              <dd className="font-medium text-text-main break-words">
                {perfil.nombreCompleto}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-text-muted">Correo</dt>
              <dd className="font-medium text-text-main break-words">
                {perfil.correo}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-text-muted">Identificación</dt>
              <dd className="font-medium text-text-main break-words">
                {perfil.tipoIdentificacion.toUpperCase()}: {perfil.numeroIdentificacion}
              </dd>
            </div>
          </dl>
        ) : (
          <div className="space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        )}

        {preguntasDe("titular")}
      </section>

      {/* Acompañantes */}
      {acompanantes.map((acompanante, indice) => (
        <section
          key={indice}
          className="space-y-4 rounded-lg border border-neutral-border bg-surface p-5 shadow-sm"
        >
          <div className="border-b border-neutral-border pb-2.5">
            <h3 className="text-sm font-bold text-primary flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sand text-xs font-bold text-navy">
                {indice + 2}
              </span>
              Acompañante {indice + 1}
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo
              label="Primer nombre"
              required
              valor={acompanante.primerNombre}
              alCambiar={(valor) =>
                alCambiarAcompanante(indice, "primerNombre", valor)
              }
              error={errores[`${indice}-primerNombre`]}
            />
            <Campo
              label="Primer apellido"
              required
              valor={acompanante.primerApellido}
              alCambiar={(valor) =>
                alCambiarAcompanante(indice, "primerApellido", valor)
              }
              error={errores[`${indice}-primerApellido`]}
            />
            <Campo
              label="Tipo de identificación"
              opciones={TIPOS_IDENTIFICACION}
              valor={acompanante.tipoIdentificacion}
              alCambiar={(valor) =>
                alCambiarAcompanante(indice, "tipoIdentificacion", valor)
              }
            />
            <Campo
              label="Número de identificación"
              required
              placeholder="001-000000-0000A"
              valor={acompanante.numeroIdentificacion}
              alCambiar={(valor) =>
                alCambiarAcompanante(indice, "numeroIdentificacion", valor)
              }
              error={errores[`${indice}-numeroIdentificacion`]}
            />
          </div>

          {preguntasDe(`acomp-${indice}`)}
        </section>
      ))}

      <div className="flex gap-3 pt-2">
        <Boton variante="contorno" onClick={alAtras}>
          Atrás
        </Boton>
        <Boton className="flex-1" onClick={alContinuar}>
          Continuar al pago
        </Boton>
      </div>
    </div>
  );
}
