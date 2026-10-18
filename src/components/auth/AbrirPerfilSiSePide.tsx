"use client";

import { useEffect, useState } from "react";
import CompletarPerfilPopup from "./CompletarPerfilPopup";

/**
 * Abre el popup de perfil cuando la URL trae ?perfil=1 (lo pone el callback de
 * Google y cualquier flujo que detecte perfil incompleto). Lee la query con
 * window.location para no necesitar Suspense en el layout.
 */
export default function AbrirPerfilSiSePide() {
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("perfil") !== "1") return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAbierto(true);
    params.delete("perfil");
    const resto = params.toString();
    const url = resto
      ? `${window.location.pathname}?${resto}`
      : window.location.pathname;
    window.history.replaceState({}, "", url);
  }, []);

  return <CompletarPerfilPopup abierto={abierto} onCerrar={() => setAbierto(false)} />;
}
