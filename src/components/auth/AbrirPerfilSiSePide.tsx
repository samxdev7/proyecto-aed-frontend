"use client";

import { useEffect, useState } from "react";
import { obtenerSesion } from "@/lib/auth";
import { useMensajes } from "@/contexts/MensajesContext";
import CompletarPerfilPopup from "./CompletarPerfilPopup";

/**
 * Abre el popup de perfil cuando la URL trae ?perfil=1 (lo pone el callback de
 * Google y cualquier flujo que detecte perfil incompleto). Lee la query con
 * window.location para no necesitar Suspense en el layout.
 */
export default function AbrirPerfilSiSePide() {
  const [abierto, setAbierto] = useState(false);
  const { mostrarInfo } = useMensajes();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("perfil") !== "1") return;

    // El param se limpia siempre: si quedó pegado tras un logout, no debe
    // reabrir el popup en una próxima recarga.
    params.delete("perfil");
    const resto = params.toString();
    const url = resto
      ? `${window.location.pathname}?${resto}`
      : window.location.pathname;
    window.history.replaceState({}, "", url);

    // Sin sesión activa no hay perfil que completar.
    if (!obtenerSesion()) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAbierto(true);
  }, []);

  return (
    <CompletarPerfilPopup
      abierto={abierto}
      onCerrar={() => {
        setAbierto(false);
        mostrarInfo(
          "Perfil pendiente de completar",
          "Puedes completar tus datos personales en cualquier momento desde tu menú de perfil para poder reservar tus viajes.",
          7000
        );
      }}
    />
  );
}
