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

test("Regla de Ocultamiento de Footer en Autenticación", async (t) => {
  function debeOcultarFooter(ruta: string): boolean {
    return ruta === "/iniciar-sesion" || ruta === "/registro";
  }

  await t.test("Oculta Footer en /iniciar-sesion", () => {
    assert.equal(debeOcultarFooter("/iniciar-sesion"), true);
  });

  await t.test("Oculta Footer en /registro", () => {
    assert.equal(debeOcultarFooter("/registro"), true);
  });

  await t.test("Muestra Footer en páginas públicas", () => {
    assert.equal(debeOcultarFooter("/"), false);
    assert.equal(debeOcultarFooter("/viajes"), false);
  });
});

test("Sanitización de Errores SQL para Administrador", async (t) => {
  function sanitizarError(mensaje: string, porDefecto = "Ocurrió un error."): string {
    if (
      /could not execute statement|character varying|SQL \[|Hibernate|PSQLException|syntax error|constraint|org\.hibernate|column .* does not exist/i.test(
        mensaje
      )
    ) {
      return "No se pudo guardar la información del viaje con los datos proporcionados. Por favor revisa que los campos sean válidos e intenta nuevamente.";
    }
    return mensaje || porDefecto;
  }

  await t.test("Oculta error raw de SQL 'value too long for type character varying(50)'", () => {
    const rawSqlError =
      "Ha ocurrido un error inesperado en el servidor: could not execute statement [ERROR: value too long for type character varying(50)] [insert into app.viaje ...]; SQL [insert into app.viaje ...]";
    const sanitizado = sanitizarError(rawSqlError);
    assert.equal(
      sanitizado,
      "No se pudo guardar la información del viaje con los datos proporcionados. Por favor revisa que los campos sean válidos e intenta nuevamente."
    );
    assert.ok(!sanitizado.includes("character varying"));
    assert.ok(!sanitizado.includes("SQL"));
  });

  await t.test("Preserva mensajes funcionales de negocio legibles", () => {
    const mensajeNegocio = "El monto de reserva debe ser menor o igual al monto total.";
    assert.equal(sanitizarError(mensajeNegocio), mensajeNegocio);
  });
});
