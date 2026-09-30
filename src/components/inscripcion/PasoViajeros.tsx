"use client";

import Boton from "@/components/ui/Boton";
import Campo from "@/components/ui/Campo";
import Skeleton from "@/components/ui/Skeleton";
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
  /** Las preguntas del viaje se responden una vez por persona. */
  const preguntasDe = (persona: string) =>
    campos.length > 0 ? (
      <div className="space-y-4 border-t border-neutral-border pt-4">
        <h4 className="text-xs font-bold uppercase text-text-muted">
          Preguntas del viaje
        </h4>
        {campos.map((campo) => (
          <Campo
            key={campo.idCampo}
            label={campo.etiquetaPregunta}
            required={campo.obligatorio}
            opciones={campo.opciones}
            valor={
              respuestas[persona]?.[campo.idCampo] ?? campo.opciones?.[0] ?? ""
            }
            alCambiar={(valor) =>
              alCambiarRespuesta(persona, campo.idCampo, valor)
            }
            error={errores[`resp-${persona}-${campo.idCampo}`]}
          />
        ))}
      </div>
    ) : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl font-bold text-navy">
          Datos de los viajeros
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          El titular se toma de tu cuenta; completa los datos de cada
          acompañante y responde las preguntas del viaje por separado para cada
          persona.
        </p>
      </div>

      <section className="space-y-2 rounded-md border border-neutral-border p-4">
        <h3 className="text-sm font-bold text-primary">Titular (tú)</h3>
        {perfil ? (
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold text-text-muted">Nombre</dt>
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
              <dt className="text-xs font-semibold text-text-muted">
                Identificación
              </dt>
              <dd className="font-medium text-text-main break-words">
                {perfil.numeroIdentificacion}
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

      {acompanantes.map((acompanante, indice) => (
        <section
          key={indice}
          className="space-y-4 rounded-md border border-neutral-border p-4"
        >
          <h3 className="text-sm font-bold text-primary">
            Acompañante {indice + 1}
          </h3>
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

      <div className="flex gap-3">
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
