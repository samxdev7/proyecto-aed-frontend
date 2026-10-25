import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("Aislamiento de Credenciales - Verificación Estática", async (t) => {
  const archivosAVerificar = [
    "src/lib/supabase.ts",
    "src/services/supabaseStorage.service.ts",
    "src/components/layout/Logo.tsx",
    "src/components/auth/BotonGoogle.tsx",
    "src/types/google.d.ts",
    "src/app/layout.tsx",
    "next.config.ts",
  ];

  await t.test(".env.example existe y no contiene credenciales reales", () => {
    assert.ok(fs.existsSync(".env.example"), ".env.example debe existir");
    const contenido = fs.readFileSync(".env.example", "utf-8");
    assert.ok(contenido.includes("NEXT_PUBLIC_API_URL"));
    assert.ok(contenido.includes("NEXT_PUBLIC_SUPABASE_URL"));
    assert.ok(contenido.includes("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"));
    assert.ok(contenido.includes("NEXT_PUBLIC_GOOGLE_CLIENT_ID"));
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

test("Formato Seguro de Identificación y Detección de Perfil Incompleto", async (t) => {
  function formatoIdentificacion(
    tipo?: string | null,
    numero?: string | null
  ): string {
    const tipoLimpio =
      tipo && tipo !== "null" && tipo !== "undefined" ? tipo.trim() : "";
    const numeroLimpio =
      numero && numero !== "null" && numero !== "undefined" ? numero.trim() : "";

    if (!tipoLimpio && !numeroLimpio) return "Sin registrar";

    const etiquetaTipo =
      tipoLimpio.toLowerCase() === "cedula"
        ? "Cédula"
        : tipoLimpio.toLowerCase() === "pasaporte"
          ? "Pasaporte"
          : tipoLimpio || "Identificación";

    if (!numeroLimpio) return `${etiquetaTipo}: (Sin número)`;
    return `${etiquetaTipo}: ${numeroLimpio}`;
  }

  await t.test("Evita 'null: null' o 'Null: Null' ante valores no inicializados", () => {
    assert.equal(formatoIdentificacion(null, null), "Sin registrar");
    assert.equal(formatoIdentificacion("null", "null"), "Sin registrar");
    assert.equal(formatoIdentificacion(undefined, undefined), "Sin registrar");
    assert.equal(formatoIdentificacion("", ""), "Sin registrar");
  });

  await t.test("Formatea cédula y pasaporte correctamente", () => {
    assert.equal(
      formatoIdentificacion("cedula", "001-010190-0001A"),
      "Cédula: 001-010190-0001A"
    );
    assert.equal(
      formatoIdentificacion("pasaporte", "N1234567"),
      "Pasaporte: N1234567"
    );
  });

  await t.test("Maneja tipo existente con número faltante", () => {
    assert.equal(formatoIdentificacion("cedula", null), "Cédula: (Sin número)");
  });
});

test("Regla de Visibilidad de Pestaña Mis Inscripciones y Reservas", async (t) => {
  function debeMostrarPestanaReservas(sesion: { rol?: string } | null): boolean {
    const conSesion = Boolean(sesion);
    const esAdmin = conSesion && sesion?.rol === "administrador";
    return conSesion && !esAdmin;
  }

  await t.test("Oculta 'Mis Inscripciones y Reservas' para usuarios sin sesión", () => {
    assert.equal(debeMostrarPestanaReservas(null), false);
  });

  await t.test("Muestra 'Mis Inscripciones y Reservas' para usuarios cliente", () => {
    assert.equal(debeMostrarPestanaReservas({ rol: "cliente" }), true);
  });

  await t.test("Oculta 'Mis Inscripciones y Reservas' si la cuenta es administrador", () => {
    assert.equal(debeMostrarPestanaReservas({ rol: "administrador" }), false);
  });
});

test("DatoSensible - Manejo Seguro de Valores Nulos y Enmascaramiento", async (t) => {
  function enmascararDato(
    valor?: string | null,
    ultimos = 4,
    fallback = "—"
  ): { enmascarado: string; esValido: boolean; valorLimpio: string } {
    if (valor == null) {
      return { enmascarado: fallback, esValido: false, valorLimpio: "" };
    }
    const valorLimpio = typeof valor === "string" ? valor.trim() : String(valor).trim();
    if (!valorLimpio || valorLimpio === "null" || valorLimpio === "undefined") {
      return { enmascarado: fallback, esValido: false, valorLimpio: "" };
    }

    const digitos = Math.max(0, ultimos);
    const enmascarado = digitos > 0 ? `••••${valorLimpio.slice(-digitos)}` : "••••";
    return { enmascarado, esValido: true, valorLimpio };
  }

  await t.test("Maneja valores nulos e indefinidos sin lanzar TypeError (.slice)", () => {
    assert.deepEqual(enmascararDato(null), {
      enmascarado: "—",
      esValido: false,
      valorLimpio: "",
    });
    assert.deepEqual(enmascararDato(undefined), {
      enmascarado: "—",
      esValido: false,
      valorLimpio: "",
    });
    assert.deepEqual(enmascararDato(""), {
      enmascarado: "—",
      esValido: false,
      valorLimpio: "",
    });
    assert.deepEqual(enmascararDato("   "), {
      enmascarado: "—",
      esValido: false,
      valorLimpio: "",
    });
    assert.deepEqual(enmascararDato("null"), {
      enmascarado: "—",
      esValido: false,
      valorLimpio: "",
    });
    assert.deepEqual(enmascararDato("undefined"), {
      enmascarado: "—",
      esValido: false,
      valorLimpio: "",
    });
  });

  await t.test("Respeta fallback personalizado ante valores nulos", () => {
    assert.equal(enmascararDato(null, 4, "N/A").enmascarado, "N/A");
  });

  await t.test("Enmascara cédula o número de identificación mostrando últimos caracteres", () => {
    const res = enmascararDato("001-010190-0001A", 4);
    assert.equal(res.esValido, true);
    assert.equal(res.enmascarado, "••••001A");
  });

  await t.test("Enmascara monto completamente cuando ultimos = 0", () => {
    const res = enmascararDato("C$ 1,500.00", 0);
    assert.equal(res.esValido, true);
    assert.equal(res.enmascarado, "••••");
  });
});
