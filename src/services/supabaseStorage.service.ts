import { supabase } from "@/lib/supabase";

export const BUCKET_NAME = "cnm-files";
export const RUTA_BASE_VIAJES = "viajes";

export const BUCKET_COMPROBANTES = "capturas-comprobantes";
export const RUTA_BASE_COMPROBANTES = "images";

export const BUCKET_USER_ENTRIES = "user-entries-files";
export const RUTA_BASE_USER_ENTRIES = "files";

export { supabase };

export interface ItemCarpeta {
  nombre: string;
  rutaCompleta: string;
}

export interface ItemArchivo {
  nombre: string;
  rutaCompleta: string;
  urlPublica: string;
  tamano: number;
  actualizadoEn: string;
  tipo: string;
}

export interface ContenidoDirectorio {
  carpetas: ItemCarpeta[];
  archivos: ItemArchivo[];
  rutaActual: string;
}

/**
 * Normaliza una ruta eliminando slashes redundantes al inicio y final.
 */
function normalizarRuta(ruta: string): string {
  return ruta.replace(/^\/+|\/+$/g, "").trim();
}

/**
 * Limpia y genera un nombre seguro para carpetas o archivos.
 */
export function sanitizarNombre(nombre: string): string {
  return nombre
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "");
}

/**
 * Formatea bytes en formato legible (KB, MB).
 */
export function formatoBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = 1;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export const supabaseStorageService = {
  /**
   * Obtiene la URL pública directa de un archivo en el bucket.
   */
  obtenerUrlPublica(rutaArchivo: string): string {
    const limpia = normalizarRuta(rutaArchivo);
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(limpia);
    return data.publicUrl;
  },

  /**
   * Lista carpetas y archivos en la ruta especificada.
   * Filtra archivos de control internos como .keep o .emptyFolderPlaceholder.
   */
  async listarContenido(rutaCarpeta: string = RUTA_BASE_VIAJES): Promise<ContenidoDirectorio> {
    const ruta = normalizarRuta(rutaCarpeta) || RUTA_BASE_VIAJES;

    const { data, error } = await supabase.storage.from(BUCKET_NAME).list(ruta, {
      limit: 100,
      offset: 0,
      sortBy: { column: "name", order: "asc" },
    });

    if (error) {
      throw new Error(`Error al listar archivos en '${ruta}': ${error.message}`);
    }

    const carpetas: ItemCarpeta[] = [];
    const archivos: ItemArchivo[] = [];

    for (const item of data || []) {
      // En Supabase Storage, los elementos sin ID o metadata son carpetas virtuales
      const esCarpeta = item.id === null || !item.metadata;

      if (esCarpeta) {
        carpetas.push({
          nombre: item.name,
          rutaCompleta: `${ruta}/${item.name}`,
        });
      } else {
        // Ignorar archivos internos de preservación de carpetas
        if (item.name === ".keep" || item.name === ".emptyFolderPlaceholder") {
          continue;
        }

        const rutaCompleta = `${ruta}/${item.name}`;
        const urlPublica = this.obtenerUrlPublica(rutaCompleta);
        const metadata = item.metadata as { size?: number; mimetype?: string } | undefined;

        archivos.push({
          nombre: item.name,
          rutaCompleta,
          urlPublica,
          tamano: metadata?.size || 0,
          actualizadoEn: item.updated_at || item.created_at || new Date().toISOString(),
          tipo: metadata?.mimetype || "image/jpeg",
        });
      }
    }

    return {
      carpetas,
      archivos,
      rutaActual: ruta,
    };
  },

  /**
   * Crea una nueva carpeta virtual en Supabase Storage subiendo un archivo marcador .keep.
   */
  async crearCarpeta(rutaPadre: string, nombreCarpeta: string): Promise<string> {
    const padre = normalizarRuta(rutaPadre) || RUTA_BASE_VIAJES;
    const nombre = sanitizarNombre(nombreCarpeta);
    if (!nombre) {
      throw new Error("El nombre de la carpeta no es válido.");
    }

    const rutaNueva = `${padre}/${nombre}`;
    const marcador = `${rutaNueva}/.keep`;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(marcador, new Blob([""], { type: "text/plain" }), {
        upsert: true,
      });

    if (error) {
      throw new Error(`No se pudo crear la carpeta '${nombre}': ${error.message}`);
    }

    return rutaNueva;
  },

  /**
   * Sube una imagen a la carpeta especificada.
   */
  async subirImagen(
    rutaCarpeta: string,
    archivo: File,
    nombrePersonalizado?: string,
  ): Promise<ItemArchivo> {
    const ruta = normalizarRuta(rutaCarpeta) || RUTA_BASE_VIAJES;

    let nombreFinal: string;
    if (nombrePersonalizado && nombrePersonalizado.trim()) {
      const extOriginal = archivo.name.split(".").pop() || "jpg";
      const nombreLimpio = sanitizarNombre(nombrePersonalizado);
      nombreFinal = nombreLimpio.includes(".") ? nombreLimpio : `${nombreLimpio}.${extOriginal}`;
    } else {
      nombreFinal = sanitizarNombre(archivo.name);
    }

    const rutaCompleta = `${ruta}/${nombreFinal}`;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(rutaCompleta, archivo, {
        upsert: true,
        contentType: archivo.type || "image/jpeg",
      });

    if (error) {
      throw new Error(`Error al subir la imagen '${nombreFinal}': ${error.message}`);
    }

    const urlPublica = this.obtenerUrlPublica(rutaCompleta);

    return {
      nombre: nombreFinal,
      rutaCompleta,
      urlPublica,
      tamano: archivo.size,
      actualizadoEn: new Date().toISOString(),
      tipo: archivo.type,
    };
  },

  /**
   * Renombra un archivo dentro de la misma carpeta moviéndolo de clave.
   */
  async renombrarArchivo(
    rutaAntigua: string,
    nombreNuevo: string,
  ): Promise<ItemArchivo> {
    const rutaOrigen = normalizarRuta(rutaAntigua);
    const partes = rutaOrigen.split("/");
    partes.pop(); // quitar nombre actual
    const carpetaPadre = partes.join("/");

    const nombreLimpio = sanitizarNombre(nombreNuevo);
    if (!nombreLimpio) {
      throw new Error("El nuevo nombre no es válido.");
    }

    const rutaDestino = `${carpetaPadre}/${nombreLimpio}`;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .move(rutaOrigen, rutaDestino);

    if (error) {
      throw new Error(`No se pudo renombrar el archivo: ${error.message}`);
    }

    const urlPublica = this.obtenerUrlPublica(rutaDestino);

    return {
      nombre: nombreLimpio,
      rutaCompleta: rutaDestino,
      urlPublica,
      tamano: 0,
      actualizadoEn: new Date().toISOString(),
      tipo: "image/jpeg",
    };
  },

  /**
   * Elimina un archivo individual de Supabase Storage.
   */
  async eliminarArchivo(rutaArchivo: string): Promise<void> {
    const ruta = normalizarRuta(rutaArchivo);
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([ruta]);
    if (error) {
      throw new Error(`Error al eliminar el archivo '${ruta}': ${error.message}`);
    }
  },

  /**
   * Lista todos los archivos recursivamente dentro de una carpeta.
   */
  async listarArchivosRecursivos(rutaCarpeta: string): Promise<string[]> {
    const ruta = normalizarRuta(rutaCarpeta);
    const archivosEncontrados: string[] = [];

    const { data, error } = await supabase.storage.from(BUCKET_NAME).list(ruta, {
      limit: 100,
    });

    if (error || !data) return archivosEncontrados;

    for (const item of data) {
      const esCarpeta = item.id === null || !item.metadata;
      const subRuta = `${ruta}/${item.name}`;
      if (esCarpeta) {
        const subArchivos = await this.listarArchivosRecursivos(subRuta);
        archivosEncontrados.push(...subArchivos);
      } else {
        archivosEncontrados.push(subRuta);
      }
    }

    return archivosEncontrados;
  },

  /**
   * Elimina una carpeta completa y todos los archivos contenidos.
   */
  async eliminarCarpeta(rutaCarpeta: string): Promise<void> {
    const ruta = normalizarRuta(rutaCarpeta);
    const archivos = await this.listarArchivosRecursivos(ruta);

    if (archivos.length > 0) {
      const { error } = await supabase.storage.from(BUCKET_NAME).remove(archivos);
      if (error) {
        throw new Error(`Error al vaciar la carpeta '${ruta}': ${error.message}`);
      }
    }
  },

  /**
   * Renombra una carpeta moviendo todos sus archivos a la nueva ruta.
   */
  async renombrarCarpeta(
    rutaAntigua: string,
    nombreNuevo: string,
  ): Promise<string> {
    const rutaOrigen = normalizarRuta(rutaAntigua);
    const partes = rutaOrigen.split("/");
    partes.pop();
    const carpetaPadre = partes.join("/");

    const nombreLimpio = sanitizarNombre(nombreNuevo);
    if (!nombreLimpio) {
      throw new Error("El nuevo nombre de carpeta no es válido.");
    }

    const rutaDestino = carpetaPadre ? `${carpetaPadre}/${nombreLimpio}` : nombreLimpio;
    const archivos = await this.listarArchivosRecursivos(rutaOrigen);

    if (archivos.length === 0) {
      // Si estaba vacía, creamos el marcador en la nueva ruta
      await this.crearCarpeta(carpetaPadre, nombreLimpio);
      return rutaDestino;
    }

    // Mover cada archivo al nuevo prefijo
    for (const archivo of archivos) {
      const rutaRelativa = archivo.substring(rutaOrigen.length + 1);
      const nuevaRutaArchivo = `${rutaDestino}/${rutaRelativa}`;
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .move(archivo, nuevaRutaArchivo);

      if (error) {
        throw new Error(`Error al mover archivo '${archivo}' a '${nuevaRutaArchivo}': ${error.message}`);
      }
    }

    return rutaDestino;
  },

  /**
   * Sube una captura de comprobante de pago al bucket 'capturas-comprobantes' bajo la ruta 'images/'.
   * Genera un nombre de archivo único para evitar colisiones y retorna la URL pública directa.
   */
  async subirComprobantePago(archivo: Blob | File): Promise<string> {
    const timestamp = Date.now();
    const uuid = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).substring(2, 10);
    const extension = archivo.type === "image/png" ? "png" : "jpg";
    const nombreArchivo = `comprobante-${timestamp}-${uuid}.${extension}`;
    const rutaCompleta = `${RUTA_BASE_COMPROBANTES}/${nombreArchivo}`;

    const { error } = await supabase.storage
      .from(BUCKET_COMPROBANTES)
      .upload(rutaCompleta, archivo, {
        upsert: true,
        contentType: archivo.type || "image/jpeg",
      });

    if (error) {
      throw new Error(`Error al subir comprobante de pago: ${error.message}`);
    }

    const { data } = supabase.storage.from(BUCKET_COMPROBANTES).getPublicUrl(rutaCompleta);
    return data.publicUrl;
  },

  /**
   * Sube un archivo adjunto de los campos dinámicos de formularios de usuario al bucket 'user-entries-files'
   * bajo la ruta 'files/'.
   * Genera un nombre de archivo seguro y único para evitar colisiones y retorna la URL pública directa.
   */
  async subirArchivoEntrada(
    archivo: Blob | File,
    nombreOriginal?: string,
  ): Promise<{ urlPublica: string; nombreArchivo: string }> {
    const timestamp = Date.now();
    const uuid =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID().slice(0, 8)
        : Math.random().toString(36).substring(2, 10);

    const nombreReal =
      nombreOriginal || ("name" in archivo ? (archivo as File).name : "archivo");
    const partes = nombreReal.split(".");
    const extension = partes.length > 1 ? partes.pop()! : "bin";
    const nombreBase = sanitizarNombre(partes.join("."));
    const nombreFinal = `entrada-${timestamp}-${uuid}-${nombreBase}.${extension}`;
    const rutaCompleta = `${RUTA_BASE_USER_ENTRIES}/${nombreFinal}`;

    const { error } = await supabase.storage
      .from(BUCKET_USER_ENTRIES)
      .upload(rutaCompleta, archivo, {
        upsert: true,
        contentType: archivo.type || "application/octet-stream",
      });

    if (error) {
      if (
        error.message?.toLowerCase().includes("security") ||
        error.message?.toLowerCase().includes("policy") ||
        error.message?.toLowerCase().includes("row-level") ||
        (error as { statusCode?: string }).statusCode === "403"
      ) {
        throw new Error(
          `Permisos insuficientes en Supabase Storage (RLS): Asegúrate de que el bucket '${BUCKET_USER_ENTRIES}' tenga configurada la política de subida (INSERT) pública. Detalle: ${error.message}`
        );
      }
      throw new Error(`Error al subir archivo a '${BUCKET_USER_ENTRIES}': ${error.message}`);
    }

    const { data } = supabase.storage.from(BUCKET_USER_ENTRIES).getPublicUrl(rutaCompleta);
    return {
      urlPublica: data.publicUrl,
      nombreArchivo: nombreReal,
    };
  },
};

export const subirComprobantePago = supabaseStorageService.subirComprobantePago.bind(supabaseStorageService);
export const subirArchivoEntrada = supabaseStorageService.subirArchivoEntrada.bind(supabaseStorageService);
