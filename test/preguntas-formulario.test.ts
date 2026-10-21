import test from "node:test";
import assert from "node:assert/strict";
import { sanitizarMensajeError } from "@/lib/api-client";
import { opcionesDeCampo } from "@/services/viajes.service";
import type { CampoFormulario } from "@/types/viaje";

test("Sanitización de Errores en Preguntas y Formularios Dinámicos", async (t) => {
  const errorJsonMismatch =
    'Ha ocurrido un error inesperado en el servidor: could not execute statement [ERROR: column "opciones_respuesta" is of type json but expression is of type character varying Hint: You will need to rewrite or cast the expression. Position: 128] [insert into app.campo_formulario (etiqueta_pregunta,id_viaje,obligatorio,opciones_respuesta,orden,tipo_campo) values (?,?,?,?,?,?)]; SQL [insert into app.campo_formulario (etiqueta_pregunta,id_viaje,obligatorio,opciones_respuesta,orden,tipo_campo) values (?,?,?,?,?,?)]';

  const errorTruncation =
    "could not execute statement [ERROR: value too long for type character varying(50)] [insert into app.viaje ...]";

  const errorConstraint =
    "ERROR: insert or update on table \"campo_formulario\" violates foreign key constraint \"campo_formulario_id_viaje_fkey\"";

  await t.test("Reemplaza error de SQL/Hibernate de tipo json/character varying por mensaje amigable", () => {
    const sanitizado = sanitizarMensajeError(
      errorJsonMismatch,
      "No se pudo guardar la pregunta con los datos proporcionados. Por favor revisa los campos e intenta nuevamente."
    );
    assert.equal(
      sanitizado,
      "No se pudo guardar la pregunta con los datos proporcionados. Por favor revisa los campos e intenta nuevamente."
    );
    assert.ok(!sanitizado.includes("could not execute statement"));
    assert.ok(!sanitizado.includes("opciones_respuesta"));
    assert.ok(!sanitizado.includes("character varying"));
  });

  await t.test("Reemplaza otros errores técnicos de base de datos por fallback", () => {
    const sanitizadoTrunc = sanitizarMensajeError(errorTruncation);
    assert.equal(sanitizadoTrunc, "Ocurrió un error inesperado al procesar la solicitud. Por favor intenta de nuevo.");

    const sanitizadoFk = sanitizarMensajeError(errorConstraint);
    assert.equal(sanitizadoFk, "Ocurrió un error inesperado al procesar la solicitud. Por favor intenta de nuevo.");
  });

  await t.test("Conserva mensajes limpios y amigables de reglas de negocio", () => {
    const mensajeNegocio = "No se puede eliminar el campo porque ya existen reservas con respuestas registradas.";
    const resultado = sanitizarMensajeError(mensajeNegocio);
    assert.equal(resultado, mensajeNegocio);
  });

  await t.test("Usa mensaje por defecto ante cadenas vacías o valores nulos", () => {
    // @ts-expect-error probando valor nulo
    assert.equal(sanitizarMensajeError(null, "Mensaje por defecto"), "Mensaje por defecto");
    assert.equal(sanitizarMensajeError("", "Mensaje por defecto"), "Mensaje por defecto");
  });
});

test("Manejo y Deserialización de Opciones de Campo (opcionesDeCampo)", async (t) => {
  const campoBase: CampoFormulario = {
    idCampo: 1,
    idViaje: 10,
    etiquetaPregunta: "¿Tienes alguna restricción alimenticia?",
    tipoCampo: "seleccion_unica",
    opcionesRespuesta: '["Vegetariano", "Vegano", "Sin gluten", "Ninguna"]',
    orden: 1,
    obligatorio: false,
  };

  await t.test("Parsea correctamente un arreglo JSON válido", () => {
    const opciones = opcionesDeCampo(campoBase);
    assert.deepEqual(opciones, ["Vegetariano", "Vegano", "Sin gluten", "Ninguna"]);
  });

  await t.test("Parsea fallback separado por comas si no es JSON", () => {
    const campoTextoComas: CampoFormulario = {
      ...campoBase,
      opcionesRespuesta: "Opción A, Opción B, Opción C",
    };
    const opciones = opcionesDeCampo(campoTextoComas);
    assert.deepEqual(opciones, ["Opción A", "Opción B", "Opción C"]);
  });

  await t.test("Retorna arreglo vacío si opcionesRespuesta es null o no definido", () => {
    const campoVacio: CampoFormulario = {
      ...campoBase,
      opcionesRespuesta: null,
    };
    assert.deepEqual(opcionesDeCampo(campoVacio), []);
  });
});
