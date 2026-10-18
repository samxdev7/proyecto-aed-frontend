"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  ArchiveRestore,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Archive,
  RefreshCw,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import { ChipDificultad } from "@/components/ui/Chip";
import { FilaTablaSkeleton } from "@/components/ui/Skeleton";
import { viajesService } from "@/services/viajes.service";
import { formatoCordobas, formatoFecha } from "@/lib/format";
import type { Viaje } from "@/types/viaje";

interface ModalViajesArchivadosProps {
  abierto: boolean;
  onCerrar: () => void;
  onViajeDesarchivado?: () => void;
}

const ITEMS_POR_PAGINA = 5;

function ModalViajesArchivadosContent({
  onCerrar,
  onViajeDesarchivado,
}: {
  onCerrar: () => void;
  onViajeDesarchivado?: () => void;
}) {
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagina, setPagina] = useState(1);
  const [desarchivandoId, setDesarchivandoId] = useState<number | null>(null);
  const [aviso, setAviso] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  useEffect(() => {
    let activo = true;
    viajesService
      .listarViajesArchivados()
      .then((lista) => {
        if (!activo) return;
        setViajes(lista);
        setCargando(false);
      })
      .catch((e) => {
        if (!activo) return;
        setError(
          e instanceof Error
            ? e.message
            : "No pudimos cargar la lista de viajes archivados.",
        );
        setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, []);

  async function cargarArchivados() {
    setCargando(true);
    setError(null);
    setAviso(null);
    try {
      const lista = await viajesService.listarViajesArchivados();
      setViajes(lista);
      setPagina(1);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No pudimos cargar la lista de viajes archivados.",
      );
    } finally {
      setCargando(false);
    }
  }

  async function desarchivar(viaje: Viaje) {
    if (
      !window.confirm(
        `¿Deseas desarchivar el viaje "${viaje.titulo}"? Volverá a aparecer en la sección principal de viajes.`,
      )
    ) {
      return;
    }

    setDesarchivandoId(viaje.idViaje);
    setAviso(null);
    try {
      await viajesService.desarchivarViaje(viaje.idViaje);
      setAviso({
        tipo: "ok",
        texto: `Viaje "${viaje.titulo}" desarchivado exitosamente.`,
      });

      // Actualizar lista local
      const nuevaLista = viajes.filter((v) => v.idViaje !== viaje.idViaje);
      setViajes(nuevaLista);

      // Ajustar página si la actual queda vacía
      const totalPaginas = Math.ceil(nuevaLista.length / ITEMS_POR_PAGINA) || 1;
      if (pagina > totalPaginas) {
        setPagina(totalPaginas);
      }

      // Notificar al componente padre para que refresque los viajes principales
      onViajeDesarchivado?.();
    } catch (e) {
      setAviso({
        tipo: "error",
        texto:
          e instanceof Error
            ? e.message
            : "No se pudo desarchivar el viaje. Inténtalo de nuevo.",
      });
    } finally {
      setDesarchivandoId(null);
    }
  }

  const totalPaginas = Math.ceil(viajes.length / ITEMS_POR_PAGINA) || 1;
  const inicio = (pagina - 1) * ITEMS_POR_PAGINA;
  const viajesPaginados = viajes.slice(inicio, inicio + ITEMS_POR_PAGINA);

  return (
    <Modal
      abierto={true}
      onCerrar={onCerrar}
      titulo="Viajes Archivados"
      className="max-w-5xl"
    >
      <div className="p-md sm:p-lg space-y-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-border pb-sm">
          <div>
            <p className="text-sm text-admin-muted">
              Historial de expediciones archivadas. Puedes consultar sus detalles o restaurarlas al catálogo activo.
            </p>
          </div>
          <button
            onClick={cargarArchivados}
            disabled={cargando}
            className="self-start sm:self-auto inline-flex items-center gap-xs rounded-sm border border-neutral-border bg-surface px-sm py-xs text-xs font-medium text-admin-text hover:bg-surface-alt transition disabled:opacity-50"
            title="Recargar viajes archivados"
          >
            <RefreshCw size={14} className={cargando ? "animate-spin" : ""} />
            Actualizar
          </button>
        </div>

        {aviso && (
          <div
            role="status"
            className={`rounded-sm px-md py-sm text-sm font-medium ${
              aviso.tipo === "ok"
                ? "bg-estado-aprobada-bg text-estado-aprobada-text"
                : "bg-estado-rechazada-bg text-estado-rechazada-text"
            }`}
          >
            {aviso.texto}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-sm bg-estado-rechazada-bg px-md py-sm text-sm text-estado-rechazada-text"
          >
            {error}
          </div>
        )}

        {cargando ? (
          <div className="bg-admin-surface rounded-md shadow-sm border border-admin-border overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-admin-bg text-xs text-admin-muted border-b border-admin-border uppercase tracking-wider">
                <tr>
                  <th className="p-md font-medium">Imagen</th>
                  <th className="p-md font-medium">Título</th>
                  <th className="p-md font-medium">Dificultad</th>
                  <th className="p-md font-medium">Salida</th>
                  <th className="p-md font-medium">Cupos</th>
                  <th className="p-md font-medium">Monto</th>
                  <th className="p-md font-medium text-right">Acción</th>
                </tr>
              </thead>
              <FilaTablaSkeleton columnas={7} />
            </table>
          </div>
        ) : viajes.length === 0 ? (
          <EmptyState
            icono={Archive}
            titulo="No hay viajes archivados"
            descripcion="Cuando archives viajes en estado cerrado desde el panel principal, aparecerán aquí para su consulta o restauración."
          />
        ) : (
          <>
            <div className="bg-admin-surface rounded-md shadow-sm border border-admin-border overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-admin-bg text-xs text-admin-muted border-b border-admin-border uppercase tracking-wider">
                  <tr>
                    <th className="p-md font-medium">Imagen</th>
                    <th className="p-md font-medium">Título</th>
                    <th className="p-md font-medium">Dificultad</th>
                    <th className="p-md font-medium">Salida</th>
                    <th className="p-md font-medium">Cupos</th>
                    <th className="p-md font-medium">Monto</th>
                    <th className="p-md font-medium text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-border">
                  {viajesPaginados.map((viaje) => (
                    <tr
                      key={viaje.idViaje}
                      className="hover:bg-admin-bg transition-colors"
                    >
                      <td className="p-md">
                        {viaje.imagenUrl ? (
                          <Image
                            src={viaje.imagenUrl}
                            alt=""
                            width={48}
                            height={36}
                            unoptimized
                            className="h-9 w-12 rounded-sm object-cover opacity-80"
                          />
                        ) : (
                          <div className="flex h-9 w-12 items-center justify-center rounded-sm bg-admin-bg text-admin-muted">
                            <ImageIcon size={16} />
                          </div>
                        )}
                      </td>
                      <td className="p-md">
                        <div className="font-medium text-sm text-text-main">
                          {viaje.titulo}
                        </div>
                        <div className="text-xs text-admin-muted">
                          {viaje.puntoEncuentro}
                        </div>
                      </td>
                      <td className="p-md">
                        <ChipDificultad dificultad={viaje.dificultad} />
                      </td>
                      <td className="p-md text-sm text-text-muted">
                        {formatoFecha(viaje.fechaHoraIda)}
                      </td>
                      <td className="p-md text-sm text-text-muted">
                        {viaje.cuposDisponibles} / {viaje.cuposMaximos}
                      </td>
                      <td className="p-md text-sm font-medium text-text-main">
                        {formatoCordobas(viaje.montoTotal)}
                      </td>
                      <td className="p-md text-right">
                        <button
                          onClick={() => desarchivar(viaje)}
                          disabled={desarchivandoId === viaje.idViaje}
                          className="inline-flex items-center gap-xs rounded-sm bg-surface-alt px-sm py-xs text-xs font-semibold text-primary hover:bg-sand transition disabled:opacity-50"
                          title="Desarchivar y restaurar a viajes activos"
                        >
                          <ArchiveRestore size={16} />
                          <span>Desarchivar</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-sm pt-xs border-t border-neutral-border text-xs text-admin-muted">
              <div>
                Mostrando{" "}
                <span className="font-semibold text-text-main">
                  {inicio + 1}
                </span>{" "}
                a{" "}
                <span className="font-semibold text-text-main">
                  {Math.min(inicio + ITEMS_POR_PAGINA, viajes.length)}
                </span>{" "}
                de{" "}
                <span className="font-semibold text-text-main">
                  {viajes.length}
                </span>{" "}
                viajes archivados
              </div>

              <div className="flex items-center gap-xs">
                <button
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  disabled={pagina <= 1}
                  className="inline-flex items-center gap-1 rounded-sm border border-neutral-border bg-surface px-sm py-xs text-xs font-medium text-text-main hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={14} /> Anterior
                </button>
                <span className="px-sm text-text-main font-medium">
                  {pagina} / {totalPaginas}
                </span>
                <button
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                  disabled={pagina >= totalPaginas}
                  className="inline-flex items-center gap-1 rounded-sm border border-neutral-border bg-surface px-sm py-xs text-xs font-medium text-text-main hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Siguiente <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

export default function ModalViajesArchivados({
  abierto,
  onCerrar,
  onViajeDesarchivado,
}: ModalViajesArchivadosProps) {
  if (!abierto) return null;
  return (
    <ModalViajesArchivadosContent
      onCerrar={onCerrar}
      onViajeDesarchivado={onViajeDesarchivado}
    />
  );
}
