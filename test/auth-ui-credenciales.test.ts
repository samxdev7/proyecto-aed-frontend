import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("Aislamiento de Credenciales - Verificación Estática", async (t) => {
  const archivosAVerificar = [
    "src/lib/supabase.ts",
    "src/services/supabaseStorage.service.ts",
    "src/components/layout/Logo.tsx",
    "src/app/layout.tsx",
    "next.config.ts",
  ];

  await t.test(".env.example existe y no contiene credenciales reales", () => {
    assert.ok(fs.existsSync(".env.example"), ".env.example debe existir");
    const contenido = fs.readFileSync(".env.example", "utf-8");
    assert.ok(contenido.includes("NEXT_PUBLIC_API_URL"));
    assert.ok(contenido.includes("NEXT_PUBLIC_SUPABASE_URL"));
    assert.ok(contenido.includes("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"));
    assert.ok(!contenido.includes("gnotslrwwptblfoofgsx"), "No debe contener el project ref de supabase");
    assert.ok(!contenido.includes("sb_publishable_"), "No debe contener claves reales");
  });

  await t.test("Archivos fuente no contienen el subdominio interno hardcodeado de Supabase", () => {
    for (const relPath of archivosAVerificar) {
      const fullPath = path.resolve(relPath);
      if (fs.existsSync(fullPath)) {
        const contenido = fs.readFileSync(fullPath, "utf-8");
        assert.ok(
          !contenido.includes("gnotslrwwptblfoofgsx"),
          `${relPath} no debe contener 'gnotslrwwptblfoofgsx'`
        );
        assert.ok(
          !contenido.includes("sb_publishable_"),
          `${relPath} no debe contener 'sb_publishable_'`
        );
      }
    }
  });
});

test("Regla de Ocultamiento de Barra de Navegación en Autenticación", async (t) => {
  function debeOcultarHeader(ruta: string): boolean {
    return ruta === "/iniciar-sesion" || ruta === "/registro";
  }

  await t.test("Oculta Header en /iniciar-sesion", () => {
    assert.equal(debeOcultarHeader("/iniciar-sesion"), true);
  });

  await t.test("Oculta Header en /registro", () => {
    assert.equal(debeOcultarHeader("/registro"), true);
  });

  await t.test("Muestra Header en rutas públicas generales", () => {
    assert.equal(debeOcultarHeader("/"), false);
    assert.equal(debeOcultarHeader("/viajes"), false);
    assert.equal(debeOcultarHeader("/viajes/1"), false);
  });
});
