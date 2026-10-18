"use client";

import React, { useState, useEffect, useRef, useTransition, useCallback } from "react";
import Image from "next/image";
import {
  Folder,
  FolderPlus,
  Upload,
  RefreshCw,
  Search,
  Grid,
  List,
  Trash2,
  Edit2,
  ZoomIn,
  Check,
  ChevronRight,
  X,
  FileImage,
  AlertCircle,
  Loader2,
  HardDrive
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import {
  supabaseStorageService,
  ItemCarpeta,
  ItemArchivo,
  RUTA_BASE_VIAJES,
  formatoBytes,
  sanitizarNombre,
} from "@/services/supabaseStorage.service";

interface GaleriaSupabaseModalProps {
  abierto: boolean;
  onCerrar: () => void;
  onSeleccionarImagen: (urlPublica: string, item: ItemArchivo) => void;
  imagenSeleccionadaActual?: string;
}

export default function GaleriaSupabaseModal({
  abierto,
  onCerrar,
  onSeleccionarImagen,
  imagenSeleccionadaActual,
}: GaleriaSupabaseModalProps) {
  // Navegación
  const [rutaActual, setRutaActual] = useState(RUTA_BASE_VIAJES);
  const [carpetas, setCarpetas] = useState<ItemCarpeta[]>([]);
  const [archivos, setArchivos] = useState<ItemArchivo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [vistaCuadricula, setVistaCuadricula] = useState(true);

  // Estados de subida y drag-and-drop
  const [arrastrando, setArrastrando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [progresoSubida, setProgresoSubida] = useState<string | null>(null);

  // Modales secundarios de gestión
  const [modalNuevaCarpeta, setModalNuevaCarpeta] = useState(false);
  const [nombreNuevaCarpeta, setNombreNuevaCarpeta] = useState("");

  const [modalRenombrar, setModalRenombrar] = useState<{
    tipo: "carpeta" | "archivo";
    item: ItemCarpeta | ItemArchivo;
  } | null>(null);
  const [nombreNuevo, setNombreNuevo] = useState("");

  const [modalEliminar, setModalEliminar] = useState<{
    tipo: "carpeta" | "archivo";
    item: ItemCarpeta | ItemArchivo;
  } | null>(null);

  const [lightboxImagen, setLightboxImagen] = useState<ItemArchivo | null>(null);

  // Avisos y notificaciones internas
  const [aviso, setAviso] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  const [, startTransition] = useTransition();

  const inputArchivoRef = useRef<HTMLInputElement>(null);

  // Cargar contenido de la ruta actual
  const cargarDirectorio = useCallback(async (ruta: string = rutaActual) => {
    setCargando(true);
    setAviso(null);
    try {
      const data = await supabaseStorageService.listarContenido(ruta);
      setCarpetas(data.carpetas);
      setArchivos(data.archivos);
      setRutaActual(data.rutaActual);
    } catch (e) {
      setAviso({
        tipo: "error",
        texto: e instanceof Error ? e.message : "Error al cargar la galería.",
      });
    } finally {
      setCargando(false);
    }
  }, [rutaActual]);

  useEffect(() => {
    if (!abierto) return;
    let activo = true;
    Promise.resolve().then(() => {
      if (activo) {
        cargarDirectorio(rutaActual);
      }
    });
    return () => {
      activo = false;
    };
  }, [abierto, rutaActual, cargarDirectorio]);

  // Manejador de navegación por migajas de pan
  const segmentosRuta = rutaActual.split("/").filter(Boolean);

  const navegarAIndiceRuta = (indice: number) => {
    const nuevaRuta = segmentosRuta.slice(0, indice + 1).join("/");
    setRutaActual(nuevaRuta);
    setBusqueda("");
  };

  const abrirCarpeta = (carpeta: ItemCarpeta) => {
    setRutaActual(carpeta.rutaCompleta);
    setBusqueda("");
  };

  // Subir archivos
  const manejarArchivosSeleccionados = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setSubiendo(true);
    setAviso(null);

    const listaArchivos = Array.from(files).filter((f) =>
      f.type.startsWith("image/"),
    );

    if (listaArchivos.length === 0) {
      setAviso({
        tipo: "error",
        texto: "Solo se admiten archivos de imagen (JPEG, PNG, WebP, etc.).",
      });
      setSubiendo(false);
      return;
    }

    try {
      for (let i = 0; i < listaArchivos.length; i++) {
        const file = listaArchivos[i];
        setProgresoSubida(`Subiendo (${i + 1}/${listaArchivos.length}): ${file.name}`);
        await supabaseStorageService.subirImagen(rutaActual, file);
      }
      setAviso({
        tipo: "ok",
        texto: `Se subieron con éxito ${listaArchivos.length} imagen(es).`,
      });
      await cargarDirectorio(rutaActual);
    } catch (e) {
      setAviso({
        tipo: "error",
        texto: e instanceof Error ? e.message : "Error al subir imágenes.",
      });
    } finally {
      setSubiendo(false);
      setProgresoSubida(null);
      if (inputArchivoRef.current) inputArchivoRef.current.value = "";
    }
  };

  // Drag and Drop
  const alArrastrarSobre = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setArrastrando(true);
  };

  const alSalirArrastre = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setArrastrando(false);
  };

  const alSoltarArchivos = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setArrastrando(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await manejarArchivosSeleccionados(e.dataTransfer.files);
    }
  };

  // Crear Carpeta
  const confirmarCrearCarpeta = async (e: React.FormEvent) => {
    e.preventDefault();
    const nombreLimpio = sanitizarNombre(nombreNuevaCarpeta);
    if (!nombreLimpio) return;

    try {
      await supabaseStorageService.crearCarpeta(rutaActual, nombreLimpio);
      setModalNuevaCarpeta(false);
      setNombreNuevaCarpeta("");
      setAviso({ tipo: "ok", texto: `Carpeta '${nombreLimpio}' creada con éxito.` });
      await cargarDirectorio(rutaActual);
    } catch (err) {
      setAviso({
        tipo: "error",
        texto: err instanceof Error ? err.message : "Error al crear la carpeta.",
      });
    }
  };

  // Renombrar
  const abrirModalRenombrar = (tipo: "carpeta" | "archivo", item: ItemCarpeta | ItemArchivo) => {
    setModalRenombrar({ tipo, item });
    setNombreNuevo(item.nombre);
  };

  const confirmarRenombrar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalRenombrar) return;

    const nombreLimpio = sanitizarNombre(nombreNuevo);
    if (!nombreLimpio) return;

    try {
      if (modalRenombrar.tipo === "carpeta") {
        await supabaseStorageService.renombrarCarpeta(
          modalRenombrar.item.rutaCompleta,
          nombreLimpio,
        );
        setAviso({ tipo: "ok", texto: `Carpeta renombrada a '${nombreLimpio}'.` });
      } else {
        await supabaseStorageService.renombrarArchivo(
          modalRenombrar.item.rutaCompleta,
          nombreLimpio,
        );
        setAviso({ tipo: "ok", texto: `Imagen renombrada a '${nombreLimpio}'.` });
      }
      setModalRenombrar(null);
      await cargarDirectorio(rutaActual);
    } catch (err) {
      setAviso({
        tipo: "error",
        texto: err instanceof Error ? err.message : "Error al renombrar el elemento.",
      });
    }
  };

  // Eliminar
  const confirmarEliminar = async () => {
    if (!modalEliminar) return;

    try {
      if (modalEliminar.tipo === "carpeta") {
        await supabaseStorageService.eliminarCarpeta(modalEliminar.item.rutaCompleta);
        setAviso({
          tipo: "ok",
          texto: `Carpeta '${modalEliminar.item.nombre}' y sus contenidos eliminados.`,
        });
      } else {
        await supabaseStorageService.eliminarArchivo(modalEliminar.item.rutaCompleta);
        setAviso({
          tipo: "ok",
          texto: `Imagen '${modalEliminar.item.nombre}' eliminada.`,
        });
      }
      setModalEliminar(null);
      await cargarDirectorio(rutaActual);
    } catch (err) {
      setAviso({
        tipo: "error",
        texto: err instanceof Error ? err.message : "Error al eliminar el elemento.",
      });
    }
  };

  // Filtrado por búsqueda
  const carpetasFiltradas = carpetas.filter((c) =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase().trim()),
  );
  const archivosFiltrados = archivos.filter((a) =>
    a.nombre.toLowerCase().includes(busqueda.toLowerCase().trim()),
  );

  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo="Galería de Almacenamiento Supabase"
      className="max-w-5xl p-0 overflow-hidden bg-admin-surface border border-admin-border"
    >
      <div className="flex flex-col h-[85vh] max-h-[780px]">
        {/* Cabecera del Gestor de Archivos */}
        <div className="flex items-center justify-between border-b border-admin-border bg-admin-bg px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-admin-accent/15 text-admin-accent">
              <HardDrive className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-admin-text">
                Galería de Fotos y Portadas
              </h2>
              <p className="text-xs text-admin-muted">
                Almacenamiento en producción: Bucket <span className="font-mono font-semibold">cnm-files</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            className="rounded-lg p-2 text-admin-muted hover:bg-admin-border/50 hover:text-admin-text transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Barra de Herramientas y Migajas de Pan (Breadcrumbs) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-admin-border px-6 py-3 bg-white">
          {/* Breadcrumbs estilo Google Drive */}
          <nav className="flex items-center gap-1.5 text-sm overflow-x-auto py-1">
            <button
              type="button"
              onClick={() => {
                setRutaActual(RUTA_BASE_VIAJES);
                setBusqueda("");
              }}
              className="font-semibold text-admin-accent hover:underline flex items-center gap-1"
            >
              <span>viajes</span>
            </button>
            {segmentosRuta.slice(1).map((segmento, i) => {
              const esUltimo = i === segmentosRuta.length - 2;
              return (
                <React.Fragment key={segmento}>
                  <ChevronRight className="h-4 w-4 text-admin-muted shrink-0" />
                  <button
                    type="button"
                    onClick={() => navegarAIndiceRuta(i + 1)}
                    disabled={esUltimo}
                    className={`font-medium ${
                      esUltimo
                        ? "text-admin-text font-semibold cursor-default"
                        : "text-admin-accent hover:underline"
                    }`}
                  >
                    {segmento}
                  </button>
                </React.Fragment>
              );
            })}
          </nav>

          {/* Acciones de la barra */}
          <div className="flex items-center gap-2">
            {/* Input oculto para subir archivos */}
            <input
              ref={inputArchivoRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => manejarArchivosSeleccionados(e.target.files)}
            />

            <button
              type="button"
              onClick={() => inputArchivoRef.current?.click()}
              disabled={subiendo}
              className="flex items-center gap-1.5 rounded-md bg-admin-accent px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-admin-accent-hover transition-colors disabled:opacity-50"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Subir Imagen</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setNombreNuevaCarpeta("");
                setModalNuevaCarpeta(true);
              }}
              className="flex items-center gap-1.5 rounded-md border border-admin-border bg-white px-3 py-1.5 text-xs font-semibold text-admin-text hover:bg-admin-bg transition-colors"
            >
              <FolderPlus className="h-3.5 w-3.5 text-admin-accent" />
              <span>Nueva Carpeta</span>
            </button>

            <button
              type="button"
              onClick={() => cargarDirectorio(rutaActual)}
              title="Recargar archivos"
              className="rounded-md border border-admin-border p-1.5 text-admin-muted hover:bg-admin-bg hover:text-admin-text transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${cargando ? "animate-spin text-admin-accent" : ""}`} />
            </button>

            {/* Alternar vista de cuadrícula/lista */}
            <div className="flex rounded-md border border-admin-border bg-admin-bg p-0.5">
              <button
                type="button"
                onClick={() => setVistaCuadricula(true)}
                className={`rounded p-1 ${
                  vistaCuadricula ? "bg-white text-admin-accent shadow-xs" : "text-admin-muted"
                }`}
                title="Vista en cuadrícula"
              >
                <Grid className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setVistaCuadricula(false)}
                className={`rounded p-1 ${
                  !vistaCuadricula ? "bg-white text-admin-accent shadow-xs" : "text-admin-muted"
                }`}
                title="Vista en lista"
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Barra de Filtro de Búsqueda */}
        <div className="border-b border-admin-border bg-admin-surface px-6 py-2 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-admin-muted" />
            <input
              type="search"
              placeholder="Buscar por nombre en esta carpeta..."
              value={busqueda}
              onChange={(e) => startTransition(() => setBusqueda(e.target.value))}
              className="w-full rounded-md border border-admin-border bg-admin-bg py-1.5 pl-8 pr-3 text-xs outline-none focus:border-admin-accent focus:bg-white transition-all placeholder:text-admin-muted"
            />
          </div>

          <div className="text-xs text-admin-muted font-mono">
            {carpetasFiltradas.length} carpetas · {archivosFiltrados.length} imágenes
          </div>
        </div>

        {/* Notificación de aviso / estado */}
        {aviso && (
          <div
            role="status"
            className={`flex items-center justify-between px-6 py-2 text-xs font-medium ${
              aviso.tipo === "ok"
                ? "bg-estado-aprobada-bg text-estado-aprobada-text"
                : "bg-estado-rechazada-bg text-estado-rechazada-text"
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{aviso.texto}</span>
            </div>
            <button
              type="button"
              onClick={() => setAviso(null)}
              className="text-inherit hover:opacity-75"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Progreso de subida activa */}
        {subiendo && (
          <div className="flex items-center gap-2 bg-admin-accent/10 px-6 py-2 text-xs font-medium text-admin-accent border-b border-admin-accent/20">
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            <span>{progresoSubida || "Subiendo imágenes..."}</span>
          </div>
        )}

        {/* Área Central de Archivos con Drag & Drop */}
        <div
          onDragOver={alArrastrarSobre}
          onDragLeave={alSalirArrastre}
          onDrop={alSoltarArchivos}
          className={`flex-1 overflow-y-auto p-6 relative transition-colors ${
            arrastrando ? "bg-admin-accent/5 ring-2 ring-dashed ring-admin-accent inset-0" : ""
          }`}
        >
          {arrastrando && (
            <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/90 backdrop-blur-xs text-admin-accent font-semibold">
              <Upload className="h-12 w-12 mb-2 animate-bounce" />
              <p className="text-base">Suelta tus imágenes aquí para subirlas a la carpeta actual</p>
              <p className="text-xs text-admin-muted mt-1 font-mono">{rutaActual}</p>
            </div>
          )}

          {cargando ? (
            <div className="flex h-64 flex-col items-center justify-center text-admin-muted gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-admin-accent" />
              <p className="text-sm">Cargando archivos de Supabase Storage...</p>
            </div>
          ) : carpetasFiltradas.length === 0 && archivosFiltrados.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center text-admin-muted rounded-xl border-2 border-dashed border-admin-border p-8">
              <FileImage className="h-12 w-12 text-admin-muted/40 mb-3" />
              <h3 className="font-semibold text-admin-text text-sm">Carpeta vacía</h3>
              <p className="text-xs text-admin-muted mt-1 max-w-sm">
                No hay imágenes ni subcarpetas aquí. Sube una foto o arrástrala a este panel.
              </p>
              <button
                type="button"
                onClick={() => inputArchivoRef.current?.click()}
                className="mt-4 flex items-center gap-1.5 rounded-md bg-admin-accent px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-admin-accent-hover transition-colors"
              >
                <Upload className="h-4 w-4" />
                <span>Subir la primera imagen</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Sección de Carpetas */}
              {carpetasFiltradas.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-admin-muted mb-3 flex items-center gap-1.5">
                    <Folder className="h-3.5 w-3.5 text-amber-500" />
                    <span>Carpetas ({carpetasFiltradas.length})</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {carpetasFiltradas.map((carpeta) => (
                      <div
                        key={carpeta.rutaCompleta}
                        className="group relative flex items-center justify-between rounded-lg border border-admin-border bg-white p-3 shadow-xs hover:border-admin-accent hover:shadow-sm transition-all"
                      >
                        <button
                          type="button"
                          onClick={() => abrirCarpeta(carpeta)}
                          className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
                        >
                          <Folder className="h-5 w-5 text-amber-500 shrink-0 group-hover:scale-105 transition-transform" />
                          <span className="truncate text-xs font-semibold text-admin-text group-hover:text-admin-accent">
                            {carpeta.nombre}
                          </span>
                        </button>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              abrirModalRenombrar("carpeta", carpeta);
                            }}
                            title="Renombrar carpeta"
                            className="p-1 text-admin-muted hover:text-admin-accent rounded hover:bg-admin-bg transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setModalEliminar({ tipo: "carpeta", item: carpeta });
                            }}
                            title="Eliminar carpeta"
                            className="p-1 text-admin-muted hover:text-error rounded hover:bg-admin-bg transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sección de Imágenes */}
              {archivosFiltrados.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-admin-muted mb-3 flex items-center gap-1.5">
                    <FileImage className="h-3.5 w-3.5 text-admin-accent" />
                    <span>Imágenes ({archivosFiltrados.length})</span>
                  </h3>

                  {vistaCuadricula ? (
                    /* Vista en Cuadrícula (Estilo Google Photos) */
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                      {archivosFiltrados.map((archivo) => {
                        const esSeleccionada =
                          imagenSeleccionadaActual === archivo.urlPublica;
                        return (
                          <div
                            key={archivo.rutaCompleta}
                            className={`group relative flex flex-col rounded-lg border overflow-hidden bg-white transition-all shadow-xs ${
                              esSeleccionada
                                ? "border-admin-accent ring-2 ring-admin-accent"
                                : "border-admin-border hover:border-admin-accent/70 hover:shadow-md"
                            }`}
                          >
                            {/* Miniatura de imagen */}
                            <div className="relative aspect-4/3 w-full bg-admin-bg overflow-hidden">
                              <Image
                                src={archivo.urlPublica}
                                alt={archivo.nombre}
                                fill
                                unoptimized
                                sizes="(max-width: 768px) 50vw, 20vw"
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />

                              {/* Badge de seleccionada */}
                              {esSeleccionada && (
                                <div className="absolute top-2 left-2 flex items-center gap-1 rounded bg-admin-accent px-1.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                                  <Check className="h-3 w-3" />
                                  <span>Actual</span>
                                </div>
                              )}

                              {/* Acciones flotantes en hover */}
                              <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                                <div className="flex justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => setLightboxImagen(archivo)}
                                    title="Ver en grande"
                                    className="p-1.5 rounded-full bg-white/80 hover:bg-white text-slate-800 transition-colors"
                                  >
                                    <ZoomIn className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => abrirModalRenombrar("archivo", archivo)}
                                    title="Renombrar imagen"
                                    className="p-1.5 rounded-full bg-white/80 hover:bg-white text-slate-800 transition-colors"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setModalEliminar({ tipo: "archivo", item: archivo })
                                    }
                                    title="Eliminar imagen"
                                    className="p-1.5 rounded-full bg-white/80 hover:bg-error text-slate-800 hover:text-white transition-colors"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    onSeleccionarImagen(archivo.urlPublica, archivo);
                                    onCerrar();
                                  }}
                                  className="w-full rounded bg-admin-accent py-1.5 text-center text-xs font-bold text-white shadow-xs hover:bg-admin-accent-hover transition-colors"
                                >
                                  Seleccionar
                                </button>
                              </div>
                            </div>

                            {/* Metadatos inferiores */}
                            <div className="p-2.5">
                              <p
                                className="truncate text-xs font-semibold text-admin-text"
                                title={archivo.nombre}
                              >
                                {archivo.nombre}
                              </p>
                              <p className="text-[10px] text-admin-muted mt-0.5">
                                {formatoBytes(archivo.tamano)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Vista en Lista (Detallada) */
                    <div className="rounded-lg border border-admin-border overflow-hidden bg-white">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-admin-bg text-admin-muted uppercase tracking-wider text-[11px] border-b border-admin-border">
                          <tr>
                            <th className="p-3">Vista Previa</th>
                            <th className="p-3">Nombre</th>
                            <th className="p-3">Tamaño</th>
                            <th className="p-3 text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-admin-border">
                          {archivosFiltrados.map((archivo) => {
                            const esSeleccionada =
                              imagenSeleccionadaActual === archivo.urlPublica;
                            return (
                              <tr
                                key={archivo.rutaCompleta}
                                className={`hover:bg-admin-bg transition-colors ${
                                  esSeleccionada ? "bg-admin-accent/5 font-semibold" : ""
                                }`}
                              >
                                <td className="p-3 w-16">
                                  <div className="relative h-10 w-12 rounded overflow-hidden bg-admin-bg border border-admin-border">
                                    <Image
                                      src={archivo.urlPublica}
                                      alt={archivo.nombre}
                                      fill
                                      unoptimized
                                      className="object-cover"
                                    />
                                  </div>
                                </td>
                                <td className="p-3 font-medium text-admin-text">
                                  {archivo.nombre}
                                  {esSeleccionada && (
                                    <span className="ml-2 text-[10px] font-bold text-admin-accent">
                                      (Portada actual)
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 text-admin-muted font-mono">
                                  {formatoBytes(archivo.tamano)}
                                </td>
                                <td className="p-3 text-right space-x-1">
                                  <button
                                    type="button"
                                    onClick={() => setLightboxImagen(archivo)}
                                    title="Ver en grande"
                                    className="p-1.5 text-admin-muted hover:text-admin-text hover:bg-admin-border/50 rounded"
                                  >
                                    <ZoomIn className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => abrirModalRenombrar("archivo", archivo)}
                                    title="Renombrar"
                                    className="p-1.5 text-admin-muted hover:text-admin-accent hover:bg-admin-border/50 rounded"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setModalEliminar({ tipo: "archivo", item: archivo })
                                    }
                                    title="Eliminar"
                                    className="p-1.5 text-admin-muted hover:text-error hover:bg-admin-border/50 rounded"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onSeleccionarImagen(archivo.urlPublica, archivo);
                                      onCerrar();
                                    }}
                                    className="rounded bg-admin-accent px-2.5 py-1 text-xs font-semibold text-white hover:bg-admin-accent-hover transition-colors ml-2"
                                  >
                                    Seleccionar
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pie del Gestor */}
        <div className="flex items-center justify-between border-t border-admin-border bg-admin-bg px-6 py-3">
          <p className="text-xs text-admin-muted">
            Ruta activa: <span className="font-mono font-medium">{rutaActual}</span>
          </p>

          <button
            type="button"
            onClick={onCerrar}
            className="rounded-md border border-admin-border bg-white px-4 py-1.5 text-xs font-semibold text-admin-text hover:bg-admin-bg transition-colors"
          >
            Cerrar Galería
          </button>
        </div>
      </div>

      {/* Modal Secundario: Crear Nueva Carpeta */}
      {modalNuevaCarpeta && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl border border-admin-border">
            <h3 className="text-base font-bold text-admin-text">Nueva Carpeta</h3>
            <p className="text-xs text-admin-muted mt-1">
              Se creará dentro de <span className="font-mono">{rutaActual}</span>
            </p>

            <form onSubmit={confirmarCrearCarpeta} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-admin-muted uppercase">
                  Nombre de la carpeta
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. volcan-masaya"
                  value={nombreNuevaCarpeta}
                  onChange={(e) => setNombreNuevaCarpeta(e.target.value)}
                  className="mt-1 w-full rounded-md border border-admin-border p-2 text-sm outline-none focus:border-admin-accent focus:ring-1 focus:ring-admin-accent"
                />
                {nombreNuevaCarpeta && (
                  <p className="text-[11px] text-admin-muted mt-1">
                    Se guardará como: <span className="font-mono font-bold">{sanitizarNombre(nombreNuevaCarpeta)}</span>
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalNuevaCarpeta(false)}
                  className="rounded-md border border-admin-border px-3 py-1.5 text-xs font-medium text-admin-muted hover:bg-admin-bg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!nombreNuevaCarpeta.trim()}
                  className="rounded-md bg-admin-accent px-4 py-1.5 text-xs font-semibold text-white hover:bg-admin-accent-hover disabled:opacity-50"
                >
                  Crear Carpeta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Secundario: Renombrar */}
      {modalRenombrar && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl border border-admin-border">
            <h3 className="text-base font-bold text-admin-text">
              Renombrar {modalRenombrar.tipo === "carpeta" ? "Carpeta" : "Imagen"}
            </h3>

            <form onSubmit={confirmarRenombrar} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-admin-muted uppercase">
                  Nuevo nombre
                </label>
                <input
                  type="text"
                  required
                  value={nombreNuevo}
                  onChange={(e) => setNombreNuevo(e.target.value)}
                  className="mt-1 w-full rounded-md border border-admin-border p-2 text-sm outline-none focus:border-admin-accent focus:ring-1 focus:ring-admin-accent"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalRenombrar(null)}
                  className="rounded-md border border-admin-border px-3 py-1.5 text-xs font-medium text-admin-muted hover:bg-admin-bg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!nombreNuevo.trim()}
                  className="rounded-md bg-admin-accent px-4 py-1.5 text-xs font-semibold text-white hover:bg-admin-accent-hover disabled:opacity-50"
                >
                  Guardar Nombre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Secundario: Confirmar Eliminación */}
      {modalEliminar && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl border border-admin-border">
            <h3 className="text-base font-bold text-error flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              <span>¿Eliminar {modalEliminar.tipo === "carpeta" ? "Carpeta" : "Imagen"}?</span>
            </h3>
            <p className="text-xs text-admin-muted mt-2 leading-relaxed">
              ¿Estás seguro de que deseas eliminar permanentemente{" "}
              <strong className="text-admin-text">&apos;{modalEliminar.item.nombre}&apos;</strong>?
              {modalEliminar.tipo === "carpeta" &&
                " Esta acción borrará la carpeta y todas las imágenes que contiene de forma irreversible."}
            </p>

            <div className="flex justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => setModalEliminar(null)}
                className="rounded-md border border-admin-border px-3 py-1.5 text-xs font-medium text-admin-muted hover:bg-admin-bg"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarEliminar}
                className="rounded-md bg-error px-4 py-1.5 text-xs font-semibold text-white hover:bg-error/90"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Secundario: Lightbox (Zoom de Imagen) */}
      {lightboxImagen && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setLightboxImagen(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl w-full rounded-lg bg-black overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between bg-slate-900/90 px-4 py-2 text-white">
              <span className="text-xs font-mono font-medium truncate">{lightboxImagen.nombre}</span>
              <button
                type="button"
                onClick={() => setLightboxImagen(null)}
                className="rounded p-1 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="relative h-[65vh] w-full bg-slate-950 flex items-center justify-center">
              <Image
                src={lightboxImagen.urlPublica}
                alt={lightboxImagen.nombre}
                fill
                unoptimized
                className="object-contain"
              />
            </div>
            <div className="flex items-center justify-between bg-slate-900/90 px-4 py-3">
              <span className="text-xs text-slate-400 font-mono">
                {formatoBytes(lightboxImagen.tamano)}
              </span>
              <button
                type="button"
                onClick={() => {
                  onSeleccionarImagen(lightboxImagen.urlPublica, lightboxImagen);
                  setLightboxImagen(null);
                  onCerrar();
                }}
                className="rounded bg-admin-accent px-4 py-1.5 text-xs font-bold text-white hover:bg-admin-accent-hover transition-colors"
              >
                Seleccionar como Portada
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
