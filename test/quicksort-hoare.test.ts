import test from "node:test";
import assert from "node:assert/strict";
import { quicksortHoare, particionHoare } from "@/lib/quicksort";

interface ViajePrueba {
  idViaje: number;
  titulo: string;
  cuposDisponibles: number;
  fechaHoraIda: string;
}

test("Algoritmo Quicksort con Partición de Hoare - Pruebas Matemáticas y de Lógica", async (t) => {
  await t.test("Ordena arreglos vacíos o con un solo elemento sin error", () => {
    const vacio: number[] = [];
    assert.deepEqual(quicksortHoare(vacio, (a, b) => a - b), []);

    const unitario = [42];
    assert.deepEqual(quicksortHoare(unitario, (a, b) => a - b), [42]);
  });

  await t.test("No muta el arreglo de entrada (función pura)", () => {
    const original = [5, 2, 8, 1, 9];
    const copiaOriginal = [...original];
    const ordenado = quicksortHoare(original, (a, b) => a - b);

    assert.deepEqual(original, copiaOriginal, "El arreglo original no debe ser modificado");
    assert.deepEqual(ordenado, [1, 2, 5, 8, 9]);
  });

  await t.test("Ordena arreglos de números aleatorios, invertidos y con duplicados", () => {
    const invertido = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
    assert.deepEqual(
      quicksortHoare(invertido, (a, b) => a - b),
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    );

    const conDuplicados = [4, 2, 4, 1, 3, 4, 2, 1];
    assert.deepEqual(
      quicksortHoare(conDuplicados, (a, b) => a - b),
      [1, 1, 2, 2, 3, 4, 4, 4]
    );

    const todosIguales = [7, 7, 7, 7, 7];
    assert.deepEqual(
      quicksortHoare(todosIguales, (a, b) => a - b),
      [7, 7, 7, 7, 7]
    );
  });

  await t.test("Partición de Hoare divide el rango de forma válida", () => {
    const arr = [5, 3, 8, 4, 2, 7, 1];
    const p = particionHoare(arr, 0, arr.length - 1, (a, b) => a - b);
    assert.ok(p >= 0 && p < arr.length - 1, "El índice retornado debe ser válido para partición Hoare");
  });
});

test("Quicksort Hoare aplicado a los Criterios de Ordenamiento del Catálogo", async (t) => {
  const expediciones: ViajePrueba[] = [
    { idViaje: 1, titulo: "Volcán Telica", cuposDisponibles: 8, fechaHoraIda: "2026-11-20T06:00:00" },
    { idViaje: 2, titulo: "Cañón de Somoto", cuposDisponibles: 1, fechaHoraIda: "2026-11-10T05:00:00" },
    { idViaje: 3, titulo: "Cerro El Pital", cuposDisponibles: 12, fechaHoraIda: "2026-12-05T04:00:00" },
    { idViaje: 4, titulo: "Volcán Maderas", cuposDisponibles: 3, fechaHoraIda: "2026-11-15T06:00:00" },
    { idViaje: 5, titulo: "Volcán Momotombo", cuposDisponibles: 0, fechaHoraIda: "2026-11-08T05:30:00" },
  ];

  await t.test("Criterio: Viajes a punto de terminar cupos disponibles (ascendente)", () => {
    const ordenados = quicksortHoare(
      expediciones,
      (a, b) => a.cuposDisponibles - b.cuposDisponibles
    );

    const cupos = ordenados.map((v) => v.cuposDisponibles);
    assert.deepEqual(cupos, [0, 1, 3, 8, 12]);
    assert.equal(ordenados[0].titulo, "Volcán Momotombo");
    assert.equal(ordenados[1].titulo, "Cañón de Somoto");
  });

  await t.test("Criterio: Viajes más cerca de ejecutarse (fecha ascendente)", () => {
    const ordenados = quicksortHoare(
      expediciones,
      (a, b) => new Date(a.fechaHoraIda).getTime() - new Date(b.fechaHoraIda).getTime()
    );

    const ids = ordenados.map((v) => v.idViaje);
    // 2026-11-08 (5) < 2026-11-10 (2) < 2026-11-15 (4) < 2026-11-20 (1) < 2026-12-05 (3)
    assert.deepEqual(ids, [5, 2, 4, 1, 3]);
    assert.equal(ordenados[0].titulo, "Volcán Momotombo");
    assert.equal(ordenados[4].titulo, "Cerro El Pital");
  });

  await t.test("Criterio: Viajes más lejos de ejecutarse (fecha descendente)", () => {
    const ordenados = quicksortHoare(
      expediciones,
      (a, b) => new Date(b.fechaHoraIda).getTime() - new Date(a.fechaHoraIda).getTime()
    );

    const ids = ordenados.map((v) => v.idViaje);
    // 2026-12-05 (3) > 2026-11-20 (1) > 2026-11-15 (4) > 2026-11-10 (2) > 2026-11-08 (5)
    assert.deepEqual(ids, [3, 1, 4, 2, 5]);
    assert.equal(ordenados[0].titulo, "Cerro El Pital");
    assert.equal(ordenados[4].titulo, "Volcán Momotombo");
  });
});

test("Búsqueda en Catálogo de Viajes - Restricción Exclusiva por Título", async (t) => {
  function normalizar(texto: string): string {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  const catalogo = [
    { titulo: "Volcán Concepción", descripcion: "Ascenso exigente en la isla de Ometepe" },
    { titulo: "Ruta del Café Matagalpa", descripcion: "Hermosas montañas cerca del volcán" },
    { titulo: "Laguna de Apoyo", descripcion: "Nadar en cráter volcánico de agua cristalina" },
  ];

  function filtrarPorTitulo(items: typeof catalogo, query: string) {
    const normalizada = normalizar(query.trim());
    if (!normalizada) return items;
    return items.filter((item) => normalizar(item.titulo).includes(normalizada));
  }

  await t.test("Filtra solo por coincidencias en el título e ignora la descripción", () => {
    // La palabra 'volcán' aparece en la descripción de los 3, pero solo en el título del primero
    const resultados = filtrarPorTitulo(catalogo, "volcán");
    assert.equal(resultados.length, 1);
    assert.equal(resultados[0].titulo, "Volcán Concepción");
  });

  await t.test("Es insensible a mayúsculas, minúsculas y tildes", () => {
    const resSinTilde = filtrarPorTitulo(catalogo, "volcan");
    assert.equal(resSinTilde.length, 1);
    assert.equal(resSinTilde[0].titulo, "Volcán Concepción");

    const resMayus = filtrarPorTitulo(catalogo, "CONCEPCION");
    assert.equal(resMayus.length, 1);
    assert.equal(resMayus[0].titulo, "Volcán Concepción");
  });
});
