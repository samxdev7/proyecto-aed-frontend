import test from "node:test";
import assert from "node:assert/strict";
import { formatearRespuestaFormulario } from "@/lib/format";

function parsearSeleccionMultiple(v: string): string[] {
  if (!v) return [];
  try {
    const parseado = JSON.parse(v);
    if (Array.isArray(parseado)) return parseado as string[];
  } catch {
    return v.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function parsearOpcionesAdmin(textoOpciones: string): string[] {
  const lineas = textoOpciones.split("\n").map((opcion) => opcion.trim()).filter(Boolean);
  return lineas.length === 1 && lineas[0].includes(",")
    ? lineas[0].split(",").map((opcion) => opcion.trim()).filter(Boolean)
    : lineas;
}

test("Campos de Formulario Dinámico - Manejo de Opciones y Respuestas", async (t) => {
  await t.test("parsearSeleccionMultiple procesa arrays JSON correctamente", () => {
    const resultado = parsearSeleccionMultiple('["Madrugada","Mañana, Tarde"]');
    assert.deepEqual(resultado, ["Madrugada", "Mañana, Tarde"]);
  });

  await t.test("parsearSeleccionMultiple maneja fallback de comas o string vacío", () => {
    assert.deepEqual(parsearSeleccionMultiple(""), []);
    assert.deepEqual(parsearSeleccionMultiple("A, B, C"), ["A", "B", "C"]);
  });

  await t.test("formatearRespuestaFormulario formatea arrays JSON con separador legible", () => {
    assert.equal(formatearRespuestaFormulario('["Opción A","Opción B"]'), "Opción A · Opción B");
    assert.equal(formatearRespuestaFormulario("Texto plano libre"), "Texto plano libre");
    assert.equal(formatearRespuestaFormulario(null), "—");
    assert.equal(formatearRespuestaFormulario(""), "—");
  });

  await t.test("parsearOpcionesAdmin separa opciones por salto de línea preservando comas internas", () => {
    const entrada = "Opción 1, con detalles adicionales\nSegunda opción (mañana y noche)\nTercera opción";
    const opciones = parsearOpcionesAdmin(entrada);
    assert.equal(opciones.length, 3);
    assert.equal(opciones[0], "Opción 1, con detalles adicionales");
    assert.equal(opciones[1], "Segunda opción (mañana y noche)");
    assert.equal(opciones[2], "Tercera opción");
  });

  await t.test("parsearOpcionesAdmin conserva retrocompatibilidad si viene en una sola línea con comas", () => {
    const entrada = "Opción A, Opción B, Opción C";
    const opciones = parsearOpcionesAdmin(entrada);
    assert.deepEqual(opciones, ["Opción A", "Opción B", "Opción C"]);
  });

  await t.test("Validación de obligatoriedad: detecta respuestas vacías o arrays vacíos", () => {
    function esRespuestaValida(valor: string | undefined): boolean {
      if (!valor) return false;
      const limpio = valor.trim();
      return limpio !== "" && limpio !== "[]";
    }

    assert.equal(esRespuestaValida(""), false);
    assert.equal(esRespuestaValida("   "), false);
    assert.equal(esRespuestaValida("[]"), false);
    assert.equal(esRespuestaValida('["Opción 1"]'), true);
    assert.equal(esRespuestaValida("Mi respuesta"), true);
  });

  await t.test("Formato de fecha en español dd/mm/yyyy y dd/mm/yyyy, HH:mm", () => {
    function formatearFechaTest(iso: string, soloFecha = false): string {
      if (!iso) return "";
      const [f, h] = iso.split("T");
      const [y, m, d] = f.split("-").map(Number);
      const diaPad = String(d).padStart(2, "0");
      const mesPad = String(m).padStart(2, "0");
      if (soloFecha || !h) {
        return `${diaPad}/${mesPad}/${y}`;
      }
      return `${diaPad}/${mesPad}/${y}, ${h}`;
    }

    assert.equal(formatearFechaTest("2026-11-06", true), "06/11/2026");
    assert.equal(formatearFechaTest("2026-11-06T08:00", false), "06/11/2026, 08:00");
    assert.equal(formatearFechaTest("2026-05-01", true), "01/05/2026");
  });

  await t.test("Validación de tamaño máximo de archivo (máx 5MB)", () => {
    const MAX_BYTES = 5 * 1024 * 1024;
    function validarTamanoArchivo(bytes: number): boolean {
      return bytes <= MAX_BYTES;
    }

    assert.equal(validarTamanoArchivo(1024 * 100), true); // 100 KB
    assert.equal(validarTamanoArchivo(5 * 1024 * 1024), true); // 5 MB exactos
    assert.equal(validarTamanoArchivo(5 * 1024 * 1024 + 1), false); // 5 MB + 1 byte
    assert.equal(validarTamanoArchivo(10 * 1024 * 1024), false); // 10 MB
  });
});
