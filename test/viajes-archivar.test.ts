import test from "node:test";
import assert from "node:assert/strict";
import { viajesService } from "@/services/viajes.service";
import { ApiClient } from "@/lib/api-client";
import type { Viaje } from "@/types/viaje";

test("Viajes - Operadores REST de Archivado y Desarchivado", async (t) => {
  // Guardar implementaciones originales
  const originalGet = ApiClient.get;
  const originalPatch = ApiClient.patch;

  t.afterEach(() => {
    ApiClient.get = originalGet;
    ApiClient.patch = originalPatch;
  });

  await t.test("listarViajesNoArchivados debe llamar a GET /viajes/no-archivados y ordenar resultados", async () => {
    let rutaLlamada = "";
    const datosMock: Viaje[] = [
      {
        idViaje: 1,
        titulo: "Viaje Antiguo",
        descripcion: null,
        dificultad: "Baja",
        fechaHoraIda: "2026-11-01T08:00:00Z",
        fechaHoraVuelta: "2026-11-02T18:00:00Z",
        puntoEncuentro: "Managua",
        montoTotal: 1000,
        montoReserva: 400,
        cuposMaximos: 15,
        cuposDisponibles: 10,
        estado: "activo",
        imagenUrl: null,
        archivado: false,
      },
      {
        idViaje: 2,
        titulo: "Viaje Nuevo",
        descripcion: null,
        dificultad: "Media",
        fechaHoraIda: "2026-11-05T08:00:00Z",
        fechaHoraVuelta: "2026-11-06T18:00:00Z",
        puntoEncuentro: "Granada",
        montoTotal: 1200,
        montoReserva: 500,
        cuposMaximos: 12,
        cuposDisponibles: 8,
        estado: "cerrado",
        imagenUrl: null,
        archivado: false,
      },
    ];

    ApiClient.get = async <T>(url: string): Promise<T> => {
      rutaLlamada = url;
      return datosMock as unknown as T;
    };

    const resultado = await viajesService.listarViajesNoArchivados();

    assert.equal(rutaLlamada, "/viajes/no-archivados");
    assert.equal(resultado.length, 2);
    // Debe ordenar los viajes más recientes primero (ID 2 antes de ID 1)
    assert.equal(resultado[0].idViaje, 2);
    assert.equal(resultado[1].idViaje, 1);
  });

  await t.test("listarViajesArchivados debe llamar a GET /viajes/archivados y ordenar resultados", async () => {
    let rutaLlamada = "";
    const mockArchivados: Viaje[] = [
      {
        idViaje: 5,
        titulo: "Expedición Somoto",
        descripcion: "Cañón de Somoto",
        dificultad: "Alta",
        fechaHoraIda: "2026-09-01T06:00:00Z",
        fechaHoraVuelta: "2026-09-02T19:00:00Z",
        puntoEncuentro: "Estelí",
        montoTotal: 1500,
        montoReserva: 600,
        cuposMaximos: 20,
        cuposDisponibles: 0,
        estado: "cerrado",
        imagenUrl: null,
        archivado: true,
      },
      {
        idViaje: 9,
        titulo: "Volcán Mombacho",
        descripcion: "Senderismo en Mombacho",
        dificultad: "Media",
        fechaHoraIda: "2026-10-01T07:00:00Z",
        fechaHoraVuelta: "2026-10-01T17:00:00Z",
        puntoEncuentro: "Granada",
        montoTotal: 800,
        montoReserva: 300,
        cuposMaximos: 10,
        cuposDisponibles: 0,
        estado: "cerrado",
        imagenUrl: null,
        archivado: true,
      },
    ];

    ApiClient.get = async <T>(url: string): Promise<T> => {
      rutaLlamada = url;
      return mockArchivados as unknown as T;
    };

    const resultado = await viajesService.listarViajesArchivados();

    assert.equal(rutaLlamada, "/viajes/archivados");
    assert.equal(resultado.length, 2);
    // ID 9 debe preceder a ID 5 por orden descendente
    assert.equal(resultado[0].idViaje, 9);
    assert.equal(resultado[1].idViaje, 5);
  });

  await t.test("archivarViaje debe llamar a PATCH /viajes/{idViaje}/archivar", async () => {
    let rutaLlamada = "";
    let cuerpoLlamada: unknown = null;

    ApiClient.patch = async <T>(url: string, body?: unknown): Promise<T> => {
      rutaLlamada = url;
      cuerpoLlamada = body;
      return {
        idViaje: 42,
        titulo: "Viaje a Archivar",
        estado: "cerrado",
        archivado: true,
      } as unknown as T;
    };

    const resultado = await viajesService.archivarViaje(42);

    assert.equal(rutaLlamada, "/viajes/42/archivar");
    assert.deepEqual(cuerpoLlamada, {});
    assert.equal(resultado.idViaje, 42);
    assert.equal(resultado.archivado, true);
  });

  await t.test("desarchivarViaje debe llamar a PATCH /viajes/{idViaje}/desarchivar", async () => {
    let rutaLlamada = "";
    let cuerpoLlamada: unknown = null;

    ApiClient.patch = async <T>(url: string, body?: unknown): Promise<T> => {
      rutaLlamada = url;
      cuerpoLlamada = body;
      return {
        idViaje: 42,
        titulo: "Viaje Restaurado",
        estado: "cerrado",
        archivado: false,
      } as unknown as T;
    };

    const resultado = await viajesService.desarchivarViaje(42);

    assert.equal(rutaLlamada, "/viajes/42/desarchivar");
    assert.deepEqual(cuerpoLlamada, {});
    assert.equal(resultado.idViaje, 42);
    assert.equal(resultado.archivado, false);
  });
});

test("Regla de Negocio - Validación de Estado para Archivado", () => {
  function validarPuedeArchivarse(viaje: { estado: string }): { puede: boolean; razon?: string } {
    if (viaje.estado !== "cerrado") {
      return {
        puede: false,
        razon: "Para archivar un viaje, su estado debe ser 'cerrado'.",
      };
    }
    return { puede: true };
  }

  const viajeActivo = { estado: "activo" };
  const resultadoActivo = validarPuedeArchivarse(viajeActivo);
  assert.equal(resultadoActivo.puede, false);
  assert.match(resultadoActivo.razon ?? "", /cerrado/);

  const viajeCerrado = { estado: "cerrado" };
  const resultadoCerrado = validarPuedeArchivarse(viajeCerrado);
  assert.equal(resultadoCerrado.puede, true);
  assert.equal(resultadoCerrado.razon, undefined);
});

test("Regla de Negocio - Activación de Viaje Requiere Preguntas", () => {
  function validarPuedeActivarse(cantidadPreguntas: number): { puede: boolean; razon?: string } {
    if (cantidadPreguntas === 0) {
      return {
        puede: false,
        razon: "Para activar este viaje debes agregar al menos una pregunta al formulario de inscripción.",
      };
    }
    return { puede: true };
  }

  const sinPreguntas = validarPuedeActivarse(0);
  assert.equal(sinPreguntas.puede, false);
  assert.match(sinPreguntas.razon ?? "", /al menos una pregunta/);

  const conUnaPregunta = validarPuedeActivarse(1);
  assert.equal(conUnaPregunta.puede, true);
  assert.equal(conUnaPregunta.razon, undefined);

  const conMuchasPreguntas = validarPuedeActivarse(5);
  assert.equal(conMuchasPreguntas.puede, true);
});

test("Paginación de Viajes Archivados", () => {
  const ITEMS_POR_PAGINA = 5;

  function paginar<T>(items: T[], pagina: number) {
    const totalPaginas = Math.ceil(items.length / ITEMS_POR_PAGINA) || 1;
    const paginaAjustada = Math.max(1, Math.min(pagina, totalPaginas));
    const inicio = (paginaAjustada - 1) * ITEMS_POR_PAGINA;
    const itemsPaginados = items.slice(inicio, inicio + ITEMS_POR_PAGINA);
    return {
      totalPaginas,
      paginaActual: paginaAjustada,
      items: itemsPaginados,
      totalItems: items.length,
      inicio: inicio + 1,
      fin: Math.min(inicio + ITEMS_POR_PAGINA, items.length),
    };
  }

  // Caso 1: Lista vacía
  const vacio = paginar([], 1);
  assert.equal(vacio.totalPaginas, 1);
  assert.equal(vacio.paginaActual, 1);
  assert.equal(vacio.items.length, 0);

  // Caso 2: 12 elementos (3 páginas de 5, 5, 2)
  const items12 = Array.from({ length: 12 }, (_, i) => ({ id: i + 1 }));

  const pag1 = paginar(items12, 1);
  assert.equal(pag1.totalPaginas, 3);
  assert.equal(pag1.items.length, 5);
  assert.equal(pag1.items[0].id, 1);
  assert.equal(pag1.items[4].id, 5);

  const pag2 = paginar(items12, 2);
  assert.equal(pag2.items.length, 5);
  assert.equal(pag2.items[0].id, 6);
  assert.equal(pag2.items[4].id, 10);

  const pag3 = paginar(items12, 3);
  assert.equal(pag3.items.length, 2);
  assert.equal(pag3.items[0].id, 11);
  assert.equal(pag3.items[1].id, 12);
  assert.equal(pag3.fin, 12);

  // Caso 3: Página fuera de rango (mayor al total)
  const pagSobredimensionada = paginar(items12, 99);
  assert.equal(pagSobredimensionada.paginaActual, 3);
  assert.equal(pagSobredimensionada.items.length, 2);
});
