"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api-client";
import { reservaService, type BorradorReserva } from "@/services/reserva.service";
import { userService } from "@/services/user.service";
import { opcionesDeCampo, viajesService } from "@/services/viajes.service";
import type { Acompanante, ReservaDetalle } from "@/types/reserva";
import type { UsuarioPerfil } from "@/types/usuario";
import type { CampoFormulario, Viaje } from "@/types/viaje";
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
  const [cantidad, setCantidad] = useState(1);
  const [acompanantes, setAcompanantes] = useState<Acompanante[]>([]);
  const [campos, setCampos] = useState<CampoFormulario[]>([]);
  /** Respuestas del formulario: una por campo, para toda la reserva. */
  const [respuestas, setRespuestas] = useState<Record<number, string>>({});
  const [perfil, setPerfil] = useState<UsuarioPerfil | null>(null);
  const [borrador, setBorrador] = useState<BorradorReserva | null>(null);
  const [reserva, setReserva] = useState<ReservaDetalle | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [errores, setErrores] = useState<Record<string, string>>({});

  useEffect(() => {
    let activo = true;
    viajesService
      .listarCampos(viaje.idViaje)
      .then((data) => {
        if (activo) setCampos(data);
      })
      .catch(() => {
        if (activo) setCampos([]);
      });
    userService
      .getMyProfile()
      .then((data) => {
        if (activo) setPerfil(data);
      })
      .catch(() => {
        if (activo) setPerfil(null);
      });
    return () => {
      activo = false;
    };
  }, [viaje.idViaje]);

  /** Respuesta guardada de un campo, con la primera opción como default. */
  function respuestaDe(campo: CampoFormulario): string {
    return respuestas[campo.idCampo] ?? opcionesDeCampo(campo)[0] ?? "";
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
        if (!respuestaDe(campo).trim()) {
          nuevos[`resp-${campo.idCampo}`] = "Respuesta obligatoria";
        }
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
    setEnviando(true);
    setErrorEnvio(null);
    const respuestasFormulario = campos
      .map((campo) => ({
        idCampo: campo.idCampo,
        valorRespuesta: respuestaDe(campo),
      }))
      .filter((respuesta) => respuesta.valorRespuesta.trim());
    reservaService
      .crearReserva({
        idViaje: viaje.idViaje,
        numeroReferenciaPago,
        capturaComprobanteUrl,
        ...(acompanantes.length > 0 ? { acompanantes } : {}),
        ...(respuestasFormulario.length > 0 ? { respuestasFormulario } : {}),
      })
      .then((creada) => {
        setReserva(creada);
        setPaso(4);
        setEnviando(false);
      })
      .catch((error) => {
        // p.ej. 409 "cupos insuficientes": el message del backend en español.
        setErrorEnvio(
          error instanceof ApiError
            ? error.message
            : "No pudimos crear tu reserva. Inténtalo de nuevo.",
        );
        setEnviando(false);
      });
  }

  if (paso === 4 && reserva) {
    return <PasoConfirmacion reserva={reserva} />;
  }

  return (
    <div className="space-y-md">
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
          alCambiarRespuesta={(idCampo, valor) =>
            setRespuestas((previas) => ({ ...previas, [idCampo]: valor }))
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
          errorEnvio={errorEnvio}
          alConfirmar={confirmarPago}
          alAtras={() => setPaso(2)}
        />
      ) : null}
    </div>
  );
}
