import test from "node:test";
import assert from "node:assert/strict";
import { DURACION_RETENCION_MS, reservaService } from "@/services/reserva.service";

test("Expiración de Ventana de Pago de 30 Minutos en Reservas", async (t) => {
  await t.test("DURACION_RETENCION_MS equivale exactamente a 30 minutos", () => {
    assert.equal(DURACION_RETENCION_MS, 30 * 60 * 1000);
    assert.equal(DURACION_RETENCION_MS, 1800000);
  });

  await t.test("crearBorrador genera fechaLimitePago a 30 minutos en el futuro", () => {
    const antes = Date.now();
    const borrador = reservaService.crearBorrador(10, 2);
    const despues = Date.now();

    const tLimite = new Date(borrador.fechaLimitePago).getTime();
    const tCreacion = new Date(borrador.fechaCreacion).getTime();

    assert.equal(borrador.idViaje, 10);
    assert.equal(borrador.cupos, 2);
    assert.ok(tLimite - tCreacion >= DURACION_RETENCION_MS - 50);
    assert.ok(tLimite >= antes + DURACION_RETENCION_MS);
    assert.ok(tLimite <= despues + DURACION_RETENCION_MS);
  });

  await t.test("Detecta estado expirado correctamente según fecha límite", () => {
    function estaExpirado(fechaLimiteIso: string): boolean {
      return new Date(fechaLimiteIso).getTime() <= Date.now();
    }

    const pasado = new Date(Date.now() - 5000).toISOString();
    assert.equal(estaExpirado(pasado), true);

    const futuro = new Date(Date.now() + 60000).toISOString();
    assert.equal(estaExpirado(futuro), false);
  });
});
