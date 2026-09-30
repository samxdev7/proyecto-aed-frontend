"use client";

import { useEffect, useState } from "react";
import { CalendarX } from "lucide-react";
import { adminService } from "@/services/admin.service";
import {
  reservaService,
  type BorradorReserva,
  type ReservaDetalle,
} from "@/services/reserva.service";
import { userService } from "@/services/user.service";
import type { Acompanante } from "@/types/reserva";
import type { UsuarioPerfil } from "@/types/usuario";
import type { CampoFormulario, Viaje } from "@/types/viaje";
import EmptyState from "@/components/ui/EmptyState";
import IndicadorPasos from "@/components/inscripcion/IndicadorPasos";
import PasoConfirmacion from "@/components/inscripcion/PasoConfirmacion";
import PasoCupos from "@/components/inscripcion/PasoCupos";
import PasoPago from "@/components/inscripcion/PasoPago";
import PasoViajeros from "@/components/inscripcion/PasoViajeros";

type Paso = 1 | 2 | 3 | 4;

const acompananteVacio = (): Acompanante => ({
  primerNombre: "",
  primerApellido: "",
  tipoIdentificacion: "cedula",
  numeroIdentificacion: "",
});

export default function FlujoInscripcion({ viaje }: { viaje: Viaje }) {
  const [paso, setPaso] = useState<Paso>(1);
  const [expirado, setExpirado] = useState(false);
  const [cantidad, setCantidad] = useState(1);
  const [acompanantes, setAcompanantes] = useState<Acompanante[]>([]);
  const [campos, setCampos] = useState<CampoFormulario[]>([]);
  /** Respuestas por persona: clave "titular" o "acomp-<índice>". */
  const [respuestas, setRespuestas] = useState<
    Record<string, Record<number, string>>
  >({});
  const [perfil, setPerfil] = useState<UsuarioPerfil | null>(null);
  const [borrador, setBorrador] = useState<BorradorReserva | null>(null);
  const [reserva, setReserva] = useState<ReservaDetalle | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});

  useEffect(() => {
    adminService
      .listarCampos(viaje.idViaje)
      .then(setCampos)
      .catch(() => setCampos([]));
    userService
      .getMyProfile()
      .then(setPerfil)
      .catch(() => setPerfil(null));
  }, [viaje.idViaje]);

  /** El titular siempre responde; cada acompañante suma la suya. */
  const personas = ["titular", ...acompanantes.map((_, i) => `acomp-${i}`)];

  /** Respuesta guardada de una persona, con la primera opción como default. */
  function respuestaDe(persona: string, campo: CampoFormulario): string {
    return respuestas[persona]?.[campo.idCampo] ?? campo.opciones?.[0] ?? "";
  }

  function cambiarCantidad(nueva: number) {
    setCantidad(nueva);
    setAcompanantes((previas) =>
      Array.from(
        { length: nueva - 1 },
        (_, i) => previas[i] ?? acompananteVacio(),
      ),
    );
  }

  function cambiarAcompanante(
    indice: number,
    campo: keyof Acompanante,
    valor: string,
  ) {
    setAcompanantes((previas) =>
      previas.map((item, i) =>
        i === indice ? { ...item, [campo]: valor } : item,
      ),
    );
  }

  function validarViajeros(): boolean {
    const nuevos: Record<string, string> = {};
    acompanantes.forEach((acompanante, i) => {
      if (!acompanante.primerNombre.trim()) {
        nuevos[`${i}-primerNombre`] = "Obligatorio";
      }
      if (!acompanante.primerApellido.trim()) {
        nuevos[`${i}-primerApellido`] = "Obligatorio";
      }
      if (!acompanante.numeroIdentificacion.trim()) {
        nuevos[`${i}-numeroIdentificacion`] = "Obligatorio";
      }
    });
    campos
      .filter((campo) => campo.obligatorio)
      .forEach((campo) => {
        personas.forEach((persona) => {
          if (!respuestaDe(persona, campo).trim()) {
            nuevos[`resp-${persona}-${campo.idCampo}`] =
              "Respuesta obligatoria";
          }
        });
      });
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  }

  function continuarAPago() {
    if (!validarViajeros()) return;
    // La retención del cupo arranca acá: el countdown sale de esta fecha límite.
    setBorrador(reservaService.crearBorrador(viaje.idViaje, cantidad));
    setPaso(3);
  }

  function confirmarPago(
    numeroReferenciaPago: string,
    capturaComprobanteUrl: string,
  ) {
    if (!borrador) return;
    setEnviando(true);
    reservaService
      .crearReserva(
        {
          idViaje: viaje.idViaje,
          numeroReferenciaPago,
          capturaComprobanteUrl,
          acompanantes,
          respuestasFormulario: personas
            .flatMap((persona) =>
              campos.map((campo) => ({
                idCampo: campo.idCampo,
                respuesta: respuestaDe(persona, campo),
                persona,
              })),
            )
            .filter((entrada) => entrada.respuesta.trim()),
        },
        borrador,
      )
      .then((creada) => {
        setReserva(creada);
        setEnviando(false);
        setPaso(4);
      })
      .catch(() => {
        setEnviando(false);
        setExpirado(true);
      });
  }

  function reiniciar() {
    setExpirado(false);
    setBorrador(null);
    setReserva(null);
    setPaso(1);
  }

  if (expirado) {
    return (
      <EmptyState
        icono={CalendarX}
        titulo="Se agotó el tiempo de retención"
        descripcion="Los cupos reservados fueron liberados. Si aún hay disponibilidad, puedes iniciar la reserva de nuevo."
        accion={{ etiqueta: "Reintentar", onClick: reiniciar }}
      />
    );
  }

  if (paso === 4 && reserva) {
    return <PasoConfirmacion reserva={reserva} />;
  }

  return (
    <div className="space-y-6">
      <IndicadorPasos actual={paso} />
      {paso === 1 ? (
        <PasoCupos
          viaje={viaje}
          cantidad={cantidad}
          alCambiarCantidad={cambiarCantidad}
          alContinuar={() => setPaso(2)}
        />
      ) : null}
      {paso === 2 ? (
        <PasoViajeros
          perfil={perfil}
          acompanantes={acompanantes}
          campos={campos}
          respuestas={respuestas}
          errores={errores}
          alCambiarAcompanante={cambiarAcompanante}
          alCambiarRespuesta={(persona, idCampo, respuesta) =>
            setRespuestas((previas) => ({
              ...previas,
              [persona]: { ...previas[persona], [idCampo]: respuesta },
            }))
          }
          alAtras={() => setPaso(1)}
          alContinuar={continuarAPago}
        />
      ) : null}
      {paso === 3 && borrador ? (
        <PasoPago
          viaje={viaje}
          cantidad={cantidad}
          borrador={borrador}
          enviando={enviando}
          alConfirmar={confirmarPago}
          alAtras={() => setPaso(2)}
          alExpirar={() => setExpirado(true)}
        />
      ) : null}
    </div>
  );
}
