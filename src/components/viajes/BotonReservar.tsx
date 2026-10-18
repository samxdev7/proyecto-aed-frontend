"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { obtenerSesion } from "@/lib/auth";
import Boton from "@/components/ui/Boton";
import Modal from "@/components/ui/Modal";

/**
 * Botón "Reservar" del detalle de viaje. Si el usuario es administrador no
 * navega a la inscripción: muestra la alerta en el mismo lugar.
 */
export default function BotonReservar({ idViaje }: { idViaje: number }) {
  const router = useRouter();
  const [adminBloqueado, setAdminBloqueado] = useState(false);

  function reservar() {
    if (obtenerSesion()?.rol === "administrador") {
      setAdminBloqueado(true);
      return;
    }
    router.push(`/inscripcion/${idViaje}`);
  }

  return (
    <>
      <Boton type="button" fullWidth onClick={reservar}>
        Reservar
      </Boton>
      <Modal
        abierto={adminBloqueado}
        onCerrar={() => setAdminBloqueado(false)}
        titulo="Reserva no disponible"
        className="max-w-md p-lg"
      >
        <div className="flex flex-col items-center gap-md text-center">
          <svg
            viewBox="0 0 512 512"
            className="h-16 w-16 text-error"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M335.188 154.188 256 233.375l-79.188-79.187-22.624 22.624L233.375 256l-79.187 79.188 22.624 22.624L256 278.625l79.188 79.187 22.624-22.624L278.625 256l79.187-79.188z" />
            <path d="M256 0C114.609 0 0 114.609 0 256s114.609 256 256 256 256-114.609 256-256S397.391 0 256 0m0 472c-119.297 0-216-96.703-216-216S136.703 40 256 40s216 96.703 216 216-96.703 216-216 216" />
          </svg>
          <h2 className="text-lg font-bold text-text-main">
            Los administradores no pueden reservar cupos
          </h2>
          <p className="text-sm text-text-muted">
            Esta cuenta tiene rol de administrador. Para reservar un cupo, usa
            una cuenta de cliente.
          </p>
        </div>
      </Modal>
    </>
  );
}
