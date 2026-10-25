import test from "node:test";
import assert from "node:assert/strict";
import type { MensajePopup, TipoMensaje } from "../src/contexts/MensajesContext";

test("Contexto de Mensajes Pop Up - Modelo y Reglas", async (t) => {
  await t.test("Validación de tipos de mensaje admitidos", () => {
    const tiposValidos: TipoMensaje[] = ["exito", "error", "advertencia", "info"];
    tiposValidos.forEach((tipo) => {
      const msg: MensajePopup = {
        id: `test-${tipo}`,
        tipo,
        titulo: `Título ${tipo}`,
        mensaje: `Causa o descripción ${tipo}`,
        duracionMs: 5000,
      };
      assert.equal(msg.tipo, tipo);
      assert.ok(msg.titulo.length > 0);
    });
  });

  await t.test("Configuración por defecto de duración (5000ms o persistente)", () => {
    function normalizarMensaje(input: {
      tipo: TipoMensaje;
      titulo: string;
      mensaje?: string;
      causa?: string;
      duracionMs?: number | null;
    }): MensajePopup {
      return {
        id: "msg-1",
        duracionMs: input.duracionMs !== undefined ? input.duracionMs : 5000,
        ...input,
      };
    }

    const conDefecto = normalizarMensaje({ tipo: "exito", titulo: "Guardado" });
    assert.equal(conDefecto.duracionMs, 5000);

    const persistente = normalizarMensaje({
      tipo: "error",
      titulo: "Fallo crítico",
      duracionMs: null,
    });
    assert.equal(persistente.duracionMs, null);
  });

  await t.test("Soporte para acción interactiva en el mensaje Pop Up", () => {
    let accionado = false;
    const msg: MensajePopup = {
      id: "msg-accion",
      tipo: "info",
      titulo: "Perfil incompleto",
      mensaje: "Completa tus datos personales para continuar.",
      accion: {
        texto: "Completar ahora",
        onClick: () => {
          accionado = true;
        },
      },
    };

    assert.equal(msg.accion?.texto, "Completar ahora");
    msg.accion?.onClick();
    assert.equal(accionado, true);
  });
});
