import test from "node:test";
import assert from "node:assert/strict";

interface CampoItem {
  idCampo: number;
  etiquetaPregunta: string;
  orden: number;
}

/** Reordena por intercambio entre posiciones contiguas (flechas) */
function moverPosicion(
  lista: CampoItem[],
  indexOrigen: number,
  direccion: "arriba" | "abajo"
): { nuevaLista: CampoItem[]; camposCambiados: CampoItem[] } {
  if (direccion === "arriba" && indexOrigen <= 0) {
    return { nuevaLista: lista, camposCambiados: [] };
  }
  if (direccion === "abajo" && indexOrigen >= lista.length - 1) {
    return { nuevaLista: lista, camposCambiados: [] };
  }

  const indexDestino = direccion === "arriba" ? indexOrigen - 1 : indexOrigen + 1;
  const copia = [...lista];
  const temp = copia[indexOrigen];
  copia[indexOrigen] = copia[indexDestino];
  copia[indexDestino] = temp;

  const listaConNuevoOrden = copia.map((c, idx) => ({ ...c, orden: idx + 1 }));
  const cambiados = listaConNuevoOrden.filter((c) => {
    const original = lista.find((orig) => orig.idCampo === c.idCampo);
    return !original || original.orden !== c.orden;
  });

  return { nuevaLista: listaConNuevoOrden, camposCambiados: cambiados };
}

/** Reordena por arrastrar y soltar (drag and drop) */
function reordenarPorDragDrop(
  lista: CampoItem[],
  fromIndex: number,
  toIndex: number
): { nuevaLista: CampoItem[]; camposCambiados: CampoItem[] } {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= lista.length || toIndex >= lista.length) {
    return { nuevaLista: lista, camposCambiados: [] };
  }

  const copia = [...lista];
  const [removido] = copia.splice(fromIndex, 1);
  copia.splice(toIndex, 0, removido);

  const listaConNuevoOrden = copia.map((c, idx) => ({ ...c, orden: idx + 1 }));
  const cambiados = listaConNuevoOrden.filter((c) => {
    const original = lista.find((orig) => orig.idCampo === c.idCampo);
    return !original || original.orden !== c.orden;
  });

  return { nuevaLista: listaConNuevoOrden, camposCambiados: cambiados };
}

test("Reordenamiento de Preguntas - Flechas y Drag & Drop", async (t) => {
  const preguntasIniciales: CampoItem[] = [
    { idCampo: 101, etiquetaPregunta: "¿Experiencia previa?", orden: 1 },
    { idCampo: 102, etiquetaPregunta: "¿Condición física?", orden: 2 },
    { idCampo: 103, etiquetaPregunta: "¿Restricciones alimenticias?", orden: 3 },
  ];

  await t.test("Mover pregunta arriba intercambia con el anterior y actualiza órdenes", () => {
    const { nuevaLista, camposCambiados } = moverPosicion(preguntasIniciales, 1, "arriba");
    assert.equal(nuevaLista[0].idCampo, 102);
    assert.equal(nuevaLista[0].orden, 1);
    assert.equal(nuevaLista[1].idCampo, 101);
    assert.equal(nuevaLista[1].orden, 2);
    assert.equal(camposCambiados.length, 2);
  });

  await t.test("Mover pregunta en el borde superior no altera la lista", () => {
    const { nuevaLista, camposCambiados } = moverPosicion(preguntasIniciales, 0, "arriba");
    assert.equal(nuevaLista.length, 3);
    assert.equal(camposCambiados.length, 0);
    assert.equal(nuevaLista[0].idCampo, 101);
  });

  await t.test("Mover pregunta abajo intercambia con el posterior y actualiza órdenes", () => {
    const { nuevaLista, camposCambiados } = moverPosicion(preguntasIniciales, 1, "abajo");
    assert.equal(nuevaLista[1].idCampo, 103);
    assert.equal(nuevaLista[1].orden, 2);
    assert.equal(nuevaLista[2].idCampo, 102);
    assert.equal(nuevaLista[2].orden, 3);
    assert.equal(camposCambiados.length, 2);
  });

  await t.test("Mover pregunta en el borde inferior no altera la lista", () => {
    const { nuevaLista, camposCambiados } = moverPosicion(preguntasIniciales, 2, "abajo");
    assert.equal(camposCambiados.length, 0);
    assert.equal(nuevaLista[2].idCampo, 103);
  });

  await t.test("Drag & Drop mueve el elemento a cualquier posición arbitraria (p.ej. de la última a la primera)", () => {
    const { nuevaLista, camposCambiados } = reordenarPorDragDrop(preguntasIniciales, 2, 0);
    assert.equal(nuevaLista[0].idCampo, 103);
    assert.equal(nuevaLista[0].orden, 1);
    assert.equal(nuevaLista[1].idCampo, 101);
    assert.equal(nuevaLista[1].orden, 2);
    assert.equal(nuevaLista[2].idCampo, 102);
    assert.equal(nuevaLista[2].orden, 3);
    assert.equal(camposCambiados.length, 3);
  });

  await t.test("Asignación de orden automático al crear nueva pregunta", () => {
    const nuevoOrden = preguntasIniciales.length + 1;
    assert.equal(nuevoOrden, 4);
  });
});
