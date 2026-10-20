import test from "node:test";
import assert from "node:assert/strict";

interface FormViajeMock {
  titulo: string;
  fechaIdaLocal: string;
  fechaVueltaLocal: string;
}

function validarCampoFecha(
  nombre: "fechaIdaLocal" | "fechaVueltaLocal",
  valor: string,
  form: FormViajeMock,
  tiempoActual = new Date()
): string {
  const ahora = new Date(tiempoActual);
  ahora.setSeconds(0, 0);

  if (nombre === "fechaIdaLocal") {
    if (!valor) return "La fecha de ida es obligatoria.";
    const fechaIda = new Date(valor);
    if (fechaIda.getTime() < ahora.getTime() - 60000) {
      return "La fecha de ida no puede ser en el pasado.";
    }
    return "";
  }

  if (nombre === "fechaVueltaLocal") {
    if (!valor) return "La fecha de vuelta es obligatoria.";
    const fechaVuelta = new Date(valor);
    if (fechaVuelta.getTime() < ahora.getTime() - 60000) {
      return "La fecha de vuelta no puede ser en el pasado.";
    }
    if (form.fechaIdaLocal && fechaVuelta <= new Date(form.fechaIdaLocal)) {
      return "La vuelta debe ser posterior a la ida.";
    }
    return "";
  }

  return "";
}

test("Validación de Fechas en Formulario de Viajes (Hoy o Futuro)", async (t) => {
  const tiempoReferencia = new Date("2026-10-20T12:00:00");

  await t.test("Rechaza fecha de ida en el pasado", () => {
    const error = validarCampoFecha(
      "fechaIdaLocal",
      "2026-10-19T10:00",
      { titulo: "Test", fechaIdaLocal: "2026-10-19T10:00", fechaVueltaLocal: "" },
      tiempoReferencia
    );
    assert.equal(error, "La fecha de ida no puede ser en el pasado.");
  });

  await t.test("Acepta fecha de ida presente o futura", () => {
    const errorPresente = validarCampoFecha(
      "fechaIdaLocal",
      "2026-10-20T12:00",
      { titulo: "Test", fechaIdaLocal: "2026-10-20T12:00", fechaVueltaLocal: "" },
      tiempoReferencia
    );
    assert.equal(errorPresente, "");

    const errorFuturo = validarCampoFecha(
      "fechaIdaLocal",
      "2026-10-25T08:00",
      { titulo: "Test", fechaIdaLocal: "2026-10-25T08:00", fechaVueltaLocal: "" },
      tiempoReferencia
    );
    assert.equal(errorFuturo, "");
  });

  await t.test("Rechaza fecha de retorno en el pasado", () => {
    const error = validarCampoFecha(
      "fechaVueltaLocal",
      "2026-10-18T15:00",
      { titulo: "Test", fechaIdaLocal: "2026-10-20T12:00", fechaVueltaLocal: "2026-10-18T15:00" },
      tiempoReferencia
    );
    assert.equal(error, "La fecha de vuelta no puede ser en el pasado.");
  });

  await t.test("Rechaza fecha de retorno anterior o igual a la salida", () => {
    const errorIgual = validarCampoFecha(
      "fechaVueltaLocal",
      "2026-10-25T08:00",
      { titulo: "Test", fechaIdaLocal: "2026-10-25T08:00", fechaVueltaLocal: "2026-10-25T08:00" },
      tiempoReferencia
    );
    assert.equal(errorIgual, "La vuelta debe ser posterior a la ida.");

    const errorAnterior = validarCampoFecha(
      "fechaVueltaLocal",
      "2026-10-24T18:00",
      { titulo: "Test", fechaIdaLocal: "2026-10-25T08:00", fechaVueltaLocal: "2026-10-24T18:00" },
      tiempoReferencia
    );
    assert.equal(errorAnterior, "La vuelta debe ser posterior a la ida.");
  });

  await t.test("Acepta fecha de retorno posterior a la salida", () => {
    const error = validarCampoFecha(
      "fechaVueltaLocal",
      "2026-10-26T18:00",
      { titulo: "Test", fechaIdaLocal: "2026-10-25T08:00", fechaVueltaLocal: "2026-10-26T18:00" },
      tiempoReferencia
    );
    assert.equal(error, "");
  });
});

test("Gestión y Persistencia de Borradores de Viaje", async (t) => {
  const storageMock = new Map<string, string>();
  const DRAFT_KEY_CREAR = "cnm_admin_viaje_draft_crear";
  const getDraftKeyEditar = (id: number) => `cnm_admin_viaje_draft_editar_${id}`;

  function guardarBorrador(id: number | null, datos: FormViajeMock) {
    const clave = id === null ? DRAFT_KEY_CREAR : getDraftKeyEditar(id);
    storageMock.set(clave, JSON.stringify(datos));
  }

  function cargarBorrador(id: number | null): FormViajeMock | null {
    const clave = id === null ? DRAFT_KEY_CREAR : getDraftKeyEditar(id);
    const item = storageMock.get(clave);
    return item ? JSON.parse(item) : null;
  }

  function eliminarBorrador(id: number | null) {
    const clave = id === null ? DRAFT_KEY_CREAR : getDraftKeyEditar(id);
    storageMock.delete(clave);
  }

  await t.test("Guarda y recupera borrador para creación de viaje", () => {
    const borradorCrear: FormViajeMock = {
      titulo: "Volcán Telica al Atardecer",
      fechaIdaLocal: "2026-11-15T14:00",
      fechaVueltaLocal: "2026-11-16T10:00",
    };

    guardarBorrador(null, borradorCrear);
    const recuperado = cargarBorrador(null);

    assert.deepEqual(recuperado, borradorCrear);
  });

  await t.test("Guarda y recupera borrador para modificación con ID específico", () => {
    const borradorEditar: FormViajeMock = {
      titulo: "Cañón de Somoto Extremo",
      fechaIdaLocal: "2026-12-01T06:00",
      fechaVueltaLocal: "2026-12-02T18:00",
    };

    guardarBorrador(42, borradorEditar);
    assert.equal(cargarBorrador(null)?.titulo, "Volcán Telica al Atardecer"); // No sobreescribe crear
    assert.deepEqual(cargarBorrador(42), borradorEditar);
  });

  await t.test("Elimina borrador al limpiar campos o guardar viaje", () => {
    eliminarBorrador(null);
    assert.equal(cargarBorrador(null), null);

    eliminarBorrador(42);
    assert.equal(cargarBorrador(42), null);
  });
});

test("Generación Uniforme de Roller de Tiempo (Horas y Minutos)", async (t) => {
  const HORAS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  const MINUTOS = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

  await t.test("Horas contienen 24 elementos desde '00' hasta '23'", () => {
    assert.equal(HORAS.length, 24);
    assert.equal(HORAS[0], "00");
    assert.equal(HORAS[1], "01");
    assert.equal(HORAS[23], "23");
  });

  await t.test("Minutos contienen 60 elementos desde '00' hasta '59'", () => {
    assert.equal(MINUTOS.length, 60);
    assert.equal(MINUTOS[0], "00");
    assert.equal(MINUTOS[1], "01");
    assert.equal(MINUTOS[59], "59");
  });

  await t.test("00 y 01 tienen longitud idéntica y formato padStart sin anomalías", () => {
    assert.equal(HORAS[0].length, HORAS[1].length);
    assert.equal(MINUTOS[0].length, MINUTOS[1].length);
  });
});
