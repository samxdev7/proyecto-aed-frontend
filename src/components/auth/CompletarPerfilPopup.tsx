"use client";

import Modal from "@/components/ui/Modal";
import SeccionCompletarPerfil from "./SeccionCompletarPerfil";
import type { UsuarioPerfil } from "@/types/usuario";

interface CompletarPerfilPopupProps {
  abierto: boolean;
  /** Cierra el popup (omitir, X, fondo o Escape) sin navegar. */
  onCerrar: () => void;
  alCompletar?: (perfil: UsuarioPerfil) => void;
  titulo?: string;
  descripcion?: string;
}

/**
 * Popup de perfil con el blur de fondo del Modal. Reemplaza a la ruta
 * /completar-perfil: el usuario nunca sale de la pantalla donde estaba.
 */
export default function CompletarPerfilPopup({
  abierto,
  onCerrar,
  alCompletar,
  titulo = "Completa tu perfil de usuario",
  descripcion = "Tus datos personales son necesarios para formalizar reservas y asegurar tus cupos en las expediciones.",
}: CompletarPerfilPopupProps) {
  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo={titulo}
      className="max-w-xl p-lg"
    >
      <SeccionCompletarPerfil
        permitirOmitir
        titulo={titulo}
        descripcion={descripcion}
        alCerrar={onCerrar}
        alCerrarExito={onCerrar}
        alCompletar={alCompletar}
      />
    </Modal>
  );
}
