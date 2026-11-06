/**
 * Pruebas estáticas: imágenes 1:1, dificultad en parte inferior,
 * texto de dificultad siempre consistente (sin etiqueta "Dificultad:" variable),
 * mensajes de estado (cerrado/expirado/últimos cupos) en la parte inferior de la imagen.
 */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const paginaViajes = fs.readFileSync(
  path.resolve("src/app/(public)/viajes/page.tsx"),
  "utf-8",
);

const modalFicha = fs.readFileSync(
  path.resolve("src/components/viajes/ModalFicha.tsx"),
  "utf-8",
);

const chipTsx = fs.readFileSync(
  path.resolve("src/components/ui/Chip.tsx"),
  "utf-8",
);

// ─── Tarjetas de viaje ───────────────────────────────────────────────────────

test("Tarjeta de viaje - imagen siempre 1:1 con aspect-square", async (t) => {
  await t.test("El contenedor de imagen usa aspect-square", () => {
    assert.ok(
      paginaViajes.includes("aspect-square"),
      "La tarjeta debe usar aspect-square para garantizar proporción 1:1",
    );
  });

  await t.test("Next/Image usa object-cover dentro del aspect-square", () => {
    assert.ok(
      paginaViajes.includes("object-cover"),
      "La imagen debe usar object-cover para recortar imágenes no cuadradas",
    );
  });
});

test("Tarjeta de viaje - chip de dificultad en la parte inferior (bottom-2)", async (t) => {
  await t.test("Existe un div con bottom-2 que contiene ChipDificultad", () => {
    // El div posicionador del chip usa bottom-2 y left-2
    assert.ok(
      paginaViajes.includes("bottom-2 left-2"),
      "El contenedor del chip de dificultad debe usar bottom-2 left-2",
    );
  });

  await t.test("No existe el label de texto 'Dificultad:' junto al chip en las tarjetas", () => {
    // El label "Dificultad:" fue eliminado para consistencia visual
    // (antes creaba inconsistencia porque el texto blanco + drop-shadow se veía diferente)
    assert.ok(
      !paginaViajes.includes(">Dificultad:<"),
      "No debe existir la etiqueta de texto '>Dificultad:<' (inconsistencia visual eliminada)",
    );
  });
});

test("Tarjeta de viaje - badges de estado en la parte inferior de la imagen (bottom-2)", async (t) => {
  await t.test("Badge 'Inscripciones expiradas' usa bottom-2 right-2", () => {
    // El badge de expiración debe posicionarse en la parte inferior derecha
    assert.ok(
      paginaViajes.includes("bottom-2 right-2"),
      "Los badges de estado deben usar bottom-2 right-2 (parte inferior de la imagen)",
    );
  });

  await t.test("Badge 'Inscripciones expiradas' existe en la página", () => {
    assert.ok(
      paginaViajes.includes("Inscripciones expiradas"),
      "Badge de expiración debe estar presente",
    );
  });

  await t.test("Badge '¡Últimos cupos!' existe en la página", () => {
    assert.ok(
      paginaViajes.includes("Últimos cupos"),
      "Badge de últimos cupos debe estar presente",
    );
  });

  await t.test("No hay badges de estado usando top-sm en las tarjetas", () => {
    // Verificar que se eliminó la posición top-sm que ponía los badges arriba
    // Nota: top-sm puede aparecer en otros contextos, verificamos que el patrón
    // específico 'right-sm top-sm z-20' no existe más
    assert.ok(
      !paginaViajes.includes("right-sm top-sm z-20"),
      "El patrón 'right-sm top-sm' debe haber sido reemplazado por bottom-*",
    );
  });
});

// ─── Chip de dificultad (Chip.tsx) ───────────────────────────────────────────

test("ChipDificultad - texto siempre consistente (text-white en todos los niveles)", async (t) => {
  await t.test("El mapa de estilos de dificultad usa text-white para todos", () => {
    const inicioMapa = chipTsx.indexOf("estilosDificultad");
    assert.ok(inicioMapa > -1, "El mapa estilosDificultad debe existir");
    const bloqueMapa = chipTsx.slice(inicioMapa, inicioMapa + 400);

    const dificultades = ["Baja", "Media", "Alta", "Extrema"];
    for (const nivel of dificultades) {
      assert.ok(bloqueMapa.includes(nivel), `Nivel '${nivel}' debe estar en estilosDificultad`);
    }

    const countWhite = (bloqueMapa.match(/text-white/g) || []).length;
    assert.ok(countWhite >= 4, `Debe haber al menos 4 text-white, encontradas: ${countWhite}`);
  });

  await t.test("Paleta semáforo: verde Baja, ámbar Media, naranja Alta, rojo Extrema", () => {
    // Rampa de color progresiva — comunica peligro de forma universal
    assert.ok(chipTsx.includes("#15803d"), "Baja debe usar green-700 (#15803d)");
    assert.ok(chipTsx.includes("#b45309"), "Media debe usar amber-700 (#b45309)");
    assert.ok(chipTsx.includes("#c2410c"), "Alta debe usar orange-700 (#c2410c)");
    assert.ok(chipTsx.includes("#991b1b"), "Extrema debe usar red-800 (#991b1b)");
  });
});

// ─── ModalFicha ──────────────────────────────────────────────────────────────

test("ModalFicha - imagen 1:1 y badges de estado en la parte inferior", async (t) => {
  await t.test("La imagen usa aspect-square w-full", () => {
    assert.ok(
      modalFicha.includes("aspect-square") && modalFicha.includes("w-full"),
      "ModalFicha debe usar aspect-square w-full para imagen 1:1",
    );
  });

  await t.test("No hay max-w-[min(100%,...)] que recorte la imagen en móvil", () => {
    // El nuevo diseño usa sm:max-w-[50vh] solo para escritorio
    assert.ok(
      !modalFicha.includes("max-w-[min(100%"),
      "ModalFicha no debe usar max-w-[min(100%,...)] que recortaba la imagen en móvil",
    );
  });

  await t.test("El chip de dificultad en el modal está en bottom-3 (parte inferior)", () => {
    // El span que contiene ChipDificultad usa bottom-3 left-3
    assert.ok(
      modalFicha.includes("bottom-3 left-3"),
      "El chip de dificultad en el modal debe usar bottom-3 left-3",
    );
  });

  await t.test("ChipDificultad existe en ModalFicha", () => {
    assert.ok(
      modalFicha.includes("ChipDificultad"),
      "ChipDificultad debe estar presente en ModalFicha",
    );
  });

  await t.test("Los badges de estado en el modal están en bottom-3 right-3 (no top-5 left-5)", () => {
    // El nuevo diseño: bottom-3 right-3
    assert.ok(
      modalFicha.includes("bottom-3 right-3"),
      "El contenedor de badges de estado en el modal debe usar bottom-3 right-3",
    );
    // No deben estar en top-5
    assert.ok(
      !modalFicha.includes("left-5 top-5"),
      "El badge de estado NO debe usar 'left-5 top-5' en el modal",
    );
  });

  await t.test("Badge 'Inscripciones expiradas' existe en ModalFicha", () => {
    assert.ok(
      modalFicha.includes("Inscripciones expiradas"),
      "Badge de expiración debe estar en ModalFicha",
    );
  });

  await t.test("Badge 'Cerrado' existe en ModalFicha", () => {
    assert.ok(
      modalFicha.includes("Cerrado"),
      "Badge 'Cerrado' debe estar en ModalFicha",
    );
  });
});
