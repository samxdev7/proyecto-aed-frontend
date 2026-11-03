import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("Correcciones de Diseño Responsivo - Sidebar Admin Fija", async (t) => {
  const layoutPath = path.resolve("src/app/(admin)/admin/layout.tsx");
  const layoutCode = fs.readFileSync(layoutPath, "utf-8");

  await t.test("Sidebar aside tiene clases de fijación por viewport en desktop (md:fixed)", () => {
    assert.ok(
      layoutCode.includes("md:fixed"),
      "aside debe incluir md:fixed para no moverse al scrollear",
    );
    assert.ok(
      layoutCode.includes("md:top-0") && layoutCode.includes("md:bottom-0"),
      "aside debe anclarse verticalmente de top a bottom",
    );
    assert.ok(
      layoutCode.includes("md:left-0"),
      "aside debe anclarse a la izquierda",
    );
    assert.ok(
      layoutCode.includes("md:h-screen") && layoutCode.includes("md:overflow-y-auto"),
      "aside debe tener altura de pantalla completa y scroll independiente",
    );
  });

  await t.test("Contenedor main tiene padding izquierdo de compensación para sidebar fija (md:pl-64)", () => {
    assert.ok(
      layoutCode.includes("md:pl-64"),
      "main debe tener md:pl-64 para compensar el ancho del sidebar fijo (w-64)",
    );
  });
});

test("Correcciones de Diseño Responsivo - Ocultar Título en Disposición 9:16", async (t) => {
  const cssPath = path.resolve("src/app/globals.css");
  const cssCode = fs.readFileSync(cssPath, "utf-8");

  const headerPath = path.resolve("src/components/layout/Header.tsx");
  const headerCode = fs.readFileSync(headerPath, "utf-8");

  await t.test("globals.css contiene media query para aspecto 9:16 con regla ocultar-en-9-16", () => {
    assert.ok(
      cssCode.includes("aspect-ratio: 9/16") || cssCode.includes("max-aspect-ratio: 9/16"),
      "globals.css debe contener media query de aspect-ratio 9/16",
    );
    assert.ok(
      cssCode.includes(".ocultar-en-9-16"),
      "globals.css debe declarar la clase utilitaria .ocultar-en-9-16",
    );
    assert.ok(
      cssCode.includes("display: none !important"),
      "ocultar-en-9-16 debe aplicar display: none !important",
    );
  });

  await t.test("Header.tsx aplica la clase ocultar-en-9-16 al título 'Club Nicaragüense de Montañismo'", () => {
    assert.ok(
      headerCode.includes('className="ocultar-en-9-16') ||
      headerCode.includes("ocultar-en-9-16 truncate text-sm font-semibold text-sand"),
      "El span del título debe incluir la clase ocultar-en-9-16",
    );
    assert.ok(
      headerCode.includes("Club Nicaragüense de Montañismo"),
      "El título debe permanecer presente en el markup para el resto de resoluciones",
    );
  });
});

test("Correcciones de Diseño Responsivo - Botón Google Uniforme en Formulario", async (t) => {
  const botonGooglePath = path.resolve("src/components/auth/BotonGoogle.tsx");
  const botonGoogleCode = fs.readFileSync(botonGooglePath, "utf-8");

  await t.test("Texto predeterminado es 'Iniciar sesión con Google'", () => {
    assert.ok(
      botonGoogleCode.includes('texto = "Iniciar sesión con Google"'),
      "BotonGoogle debe tener 'Iniciar sesión con Google' como texto predeterminado",
    );
  });

  await t.test("GIS renderButton usa signin_with o signup_with según contexto", () => {
    assert.ok(
      botonGoogleCode.includes('text: esRegistro ? "signup_with" : "signin_with"'),
      "renderButton debe solicitar texto signin_with para login y signup_with para registro",
    );
  });

  await t.test("Contenedor de GIS y botón fallback tienen min-h-[46px], rounded-md y ancho completo", () => {
    assert.ok(
      botonGoogleCode.includes("min-h-[46px]"),
      "BotonGoogle debe forzar altura mínima de 46px coincidente con los botones estándar",
    );
    assert.ok(
      botonGoogleCode.includes("rounded-md"),
      "El botón de fallback debe usar rounded-md (6px) como Boton.tsx",
    );
    assert.ok(
      botonGoogleCode.includes("px-6 py-3"),
      "El botón de fallback debe tener padding px-6 py-3 igual a Boton.tsx",
    );
  });
});
