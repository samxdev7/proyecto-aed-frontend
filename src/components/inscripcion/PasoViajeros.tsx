"use client";

import Boton from "@/components/ui/Boton";
import Campo from "@/components/ui/Campo";
import Skeleton from "@/components/ui/Skeleton";
import { opcionesDeCampo } from "@/services/viajes.service";
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
  return (
    <div className="space-y-md">
      <div>
        <h2 className="text-xl font-bold text-primary">
          Datos de los viajeros
        </h2>
        <p className="mt-1 text-sm text-text-muted">
          El titular se toma de tu cuenta; completa los datos de cada
          acompañante. Las preguntas del viaje se responden una sola vez para
          toda la reserva.
        </p>
      </div>

      <section className="space-y-sm rounded-md border border-neutral-border p-md">
        <h3 className="text-sm font-bold text-primary">Titular (tú)</h3>
        {perfil ? (
          <dl className="grid gap-sm text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold text-text-muted">Nombre</dt>
              <dd className="break-words font-medium text-text-main">
                {perfil.primerNombre} {perfil.primerApellido}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-text-muted">Correo</dt>
              <dd className="break-words font-medium text-text-main">
                {perfil.correo}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-text-muted">
                Identificación
              </dt>
              <dd className="break-words font-medium text-text-main">
                {perfil.tipoIdentificacion}: {perfil.numeroIdentificacion}
              </dd>
            </div>
          </dl>
        ) : (
          <div className="space-y-sm">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        )}
      </section>

      {acompanantes.map((acompanante, indice) => (
        <section
          key={indice}
          className="space-y-md rounded-md border border-neutral-border p-md"
        >
          <h3 className="text-sm font-bold text-primary">
            Acompañante {indice + 1}
          </h3>
          <div className="grid gap-md sm:grid-cols-2">
            <Campo
              id={`acomp-${indice}-primerNombre`}
              name={`acomp-${indice}-primerNombre`}
              label="Primer nombre"
              required
              valor={acompanante.primerNombre}
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
              valor={acompanante.primerApellido}
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
              valor={acompanante.tipoIdentificacion}
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
              valor={acompanante.numeroIdentificacion}
              alCambiar={(valor) =>
                alCambiarAcompanante(indice, "numeroIdentificacion", valor)
              }
              error={errores[`${indice}-numeroIdentificacion`]}
            />
          </div>
        </section>
      ))}

      {campos.length > 0 ? (
        <section className="space-y-md rounded-md border border-neutral-border p-md">
          <h3 className="text-sm font-bold text-primary">
            Preguntas del viaje
          </h3>
          <p className="text-xs text-text-muted">
            Una respuesta por pregunta, válida para toda la reserva.
          </p>
          {campos.map((campo) => (
            <Campo
              key={campo.idCampo}
              id={`campo-resp-${campo.idCampo}`}
              name={`campo-resp-${campo.idCampo}`}
              label={campo.etiquetaPregunta}
              required={campo.obligatorio}
              tipo={campo.tipoCampo === "fecha" ? "date" : "text"}
              opciones={opcionesDeCampo(campo)}
              valor={respuestas[campo.idCampo] ?? opcionesDeCampo(campo)[0] ?? ""}
              alCambiar={(valor) => alCambiarRespuesta(campo.idCampo, valor)}
              error={errores[`resp-${campo.idCampo}`]}
            />
          ))}
        </section>
      ) : null}

      <div className="flex gap-sm">
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
