import test from "node:test";
import assert from "node:assert/strict";
import { calcularEstadoViaje, DIAS_EXPIRACION_PREVIA } from "@/lib/viaje-estado";

test("Regla de Expiración y Cierre de Viajes (1 semana antes de la salida)", async (t) => {
  const MS_POR_DIA = 24 * 60 * 60 * 1000;
  // Fecha de salida base ficticia para pruebas
  const fechaSalidaIso = "2026-11-20T10:00:00.000Z";
  const fechaSalidaMs = new Date(fechaSalidaIso).getTime();

  await t.test("Constante de días previos de expiración es exactamente 7", () => {
    assert.equal(DIAS_EXPIRACION_PREVIA, 7);
  });

  await t.test("Viaje con más de 7 días antes de la salida está 'disponible' para inscripciones", () => {
    // 10 días antes de la salida
    const ahora10DiasAntes = new Date(fechaSalidaMs - 10 * MS_POR_DIA);
    const resultado = calcularEstadoViaje(fechaSalidaIso, "activo", ahora10DiasAntes);

    assert.equal(resultado.estadoInscripcion, "disponible");
    assert.equal(resultado.puedeReservar, true);
    assert.equal(resultado.esExpirado, false);
    assert.equal(resultado.esCerrado, false);
  });

  await t.test("Viaje a exactamente 7 días antes de la salida marca 'expirado' en inscripciones", () => {
    // Exactamente 7 días antes de la salida (al límite)
    const ahoraExactamente7Dias = new Date(fechaSalidaMs - 7 * MS_POR_DIA);
    const resultado = calcularEstadoViaje(fechaSalidaIso, "activo", ahoraExactamente7Dias);

    assert.equal(resultado.estadoInscripcion, "expirado");
    assert.equal(resultado.puedeReservar, false);
    assert.equal(resultado.esExpirado, true);
    assert.equal(resultado.esCerrado, false);
    assert.match(resultado.mensajeBadge, /expiradas/i);
  });

  await t.test("Viaje en la semana previa (3 días antes de la salida) permanece visible indicando que expiró", () => {
    // 3 días antes de la salida
    const ahora3DiasAntes = new Date(fechaSalidaMs - 3 * MS_POR_DIA);
    const resultado = calcularEstadoViaje(fechaSalidaIso, "activo", ahora3DiasAntes);

    assert.equal(resultado.estadoInscripcion, "expirado");
    assert.equal(resultado.puedeReservar, false);
    assert.equal(resultado.esExpirado, true);
    assert.equal(resultado.esCerrado, false);
  });

  await t.test("Viaje en el día y hora de salida se cierra automáticamente", () => {
    // En el momento de la salida
    const enSalida = new Date(fechaSalidaMs);
    const resSalida = calcularEstadoViaje(fechaSalidaIso, "activo", enSalida);

    assert.equal(resSalida.estadoInscripcion, "cerrado");
    assert.equal(resSalida.puedeReservar, false);
    assert.equal(resSalida.esExpirado, false);
    assert.equal(resSalida.esCerrado, true);

    // 2 horas después de la salida
    const despuesSalida = new Date(fechaSalidaMs + 2 * 60 * 60 * 1000);
    const resDespues = calcularEstadoViaje(fechaSalidaIso, "activo", despuesSalida);

    assert.equal(resDespues.estadoInscripcion, "cerrado");
    assert.equal(resDespues.puedeReservar, false);
    assert.equal(resDespues.esCerrado, true);
  });

  await t.test("Viaje con estado base 'cerrado' se reporta siempre como cerrado", () => {
    // Aunque falten 30 días, si el administrador lo cerró, permanece cerrado
    const ahora30DiasAntes = new Date(fechaSalidaMs - 30 * MS_POR_DIA);
    const resultado = calcularEstadoViaje(fechaSalidaIso, "cerrado", ahora30DiasAntes);

    assert.equal(resultado.estadoInscripcion, "cerrado");
    assert.equal(resultado.puedeReservar, false);
    assert.equal(resultado.esCerrado, true);
  });
});
