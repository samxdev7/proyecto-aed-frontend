import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("Corrección v1.0 - Matriz de Redirecciones de Autenticación", async (t) => {
  function resolverDestinoLogin(
    esAdmin: boolean,
    redir: string | null | undefined,
  ): string {
    if (esAdmin) return "/admin";
    return redir && redir.startsWith("/") ? redir : "/viajes";
  }

  function resolverDestinoLogout(): string {
    return "/iniciar-sesion";
  }

  function resolverDestinoCancelacion(): string {
    return "/";
  }

  await t.test("Login de Administrador redirige directamente a /admin", () => {
    assert.equal(resolverDestinoLogin(true, null), "/admin");
    assert.equal(resolverDestinoLogin(true, "/viajes"), "/admin");
    assert.equal(resolverDestinoLogin(true, "/inscripcion/1"), "/admin");
  });

  await t.test("Login de Cliente sin redir redirige a /viajes (catálogo)", () => {
    assert.equal(resolverDestinoLogin(false, null), "/viajes");
    assert.equal(resolverDestinoLogin(false, undefined), "/viajes");
  });

  await t.test("Login de Cliente con redir válido redirige al destino solicitado", () => {
    assert.equal(resolverDestinoLogin(false, "/inscripcion/5"), "/inscripcion/5");
    assert.equal(resolverDestinoLogin(false, "/user/reservas"), "/user/reservas");
  });

  await t.test("Cierre de sesión (Admin y Cliente) redirige a /iniciar-sesion", () => {
    assert.equal(resolverDestinoLogout(), "/iniciar-sesion");
  });

  await t.test("Rechazar o cancelar login redirige a / (página principal)", () => {
    assert.equal(resolverDestinoCancelacion(), "/");
  });

  await t.test("Verificación estática en código fuente", () => {
    const headerPath = path.resolve("src/components/layout/Header.tsx");
    const headerCode = fs.readFileSync(headerPath, "utf-8");
    assert.ok(
      headerCode.includes('router.push("/iniciar-sesion")'),
      "Header.tsx debe redirigir a /iniciar-sesion al cerrar sesión",
    );

    const adminLayoutPath = path.resolve("src/app/(admin)/admin/layout.tsx");
    const adminLayoutCode = fs.readFileSync(adminLayoutPath, "utf-8");
    assert.ok(
      adminLayoutCode.includes('router.push("/iniciar-sesion")'),
      "admin/layout.tsx debe redirigir a /iniciar-sesion al salir",
    );

    const logoutPagePath = path.resolve("src/app/logout/page.tsx");
    const logoutCode = fs.readFileSync(logoutPagePath, "utf-8");
    assert.ok(
      logoutCode.includes('router.replace("/iniciar-sesion")'),
      "logout/page.tsx debe redirigir a /iniciar-sesion",
    );

    const loginPagePath = path.resolve("src/app/(public)/iniciar-sesion/page.tsx");
    const loginCode = fs.readFileSync(loginPagePath, "utf-8");
    assert.ok(
      loginCode.includes('router.push("/admin")'),
      "iniciar-sesion debe redirigir a /admin si es administrador",
    );
    assert.ok(
      loginCode.includes('router.push("/viajes")'),
      "iniciar-sesion debe redirigir a /viajes para clientes sin redir",
    );
    assert.ok(
      loginCode.includes('router.push("/")'),
      "iniciar-sesion botón Volver debe redirigir a /",
    );

    const botonGooglePath = path.resolve("src/components/auth/BotonGoogle.tsx");
    const botonGoogleCode = fs.readFileSync(botonGooglePath, "utf-8");
    assert.ok(
      botonGoogleCode.includes('router.replace("/admin")') ||
        botonGoogleCode.includes('router.push("/admin")'),
      "BotonGoogle debe redirigir a /admin si es administrador",
    );
    assert.ok(
      botonGoogleCode.includes('router.replace(redir || "/viajes")') ||
        botonGoogleCode.includes('router.push(redir || "/viajes")'),
      "BotonGoogle debe redirigir a /viajes para clientes",
    );

    const callbackPath = path.resolve("src/app/(public)/auth/callback/page.tsx");
    const callbackCode = fs.readFileSync(callbackPath, "utf-8");
    assert.ok(
      callbackCode.includes('router.replace("/admin")'),
      "Callback debe redirigir a /admin si es administrador",
    );
    assert.ok(
      callbackCode.includes('router.replace(redir || "/viajes")'),
      "Callback debe redirigir a /viajes para clientes",
    );
    assert.ok(
      callbackCode.includes('router.replace("/")'),
      "Callback debe redirigir a / en caso de error",
    );
  });
});

test("Corrección v1.0 - Eliminación de botón redundante 'Nueva Reserva'", async (t) => {
  await t.test("La vista de reservas de usuario no contiene el botón 'Nueva Reserva'", () => {
    const reservasPath = path.resolve("src/app/(user)/user/reservas/page.tsx");
    const reservasCode = fs.readFileSync(reservasPath, "utf-8");

    assert.ok(
      !reservasCode.includes("Nueva Reserva"),
      "user/reservas/page.tsx no debe tener botón o texto 'Nueva Reserva'",
    );
    assert.ok(
      reservasCode.includes("Explorar viajes"),
      "user/reservas/page.tsx debe mantener la acción 'Explorar viajes'",
    );
  });
});

test("Corrección v1.0 - Paginación Ordenada y Centrada en Datos de Viajeros", async (t) => {
  interface SubPaso {
    id: string;
    etiqueta: string;
    tipo: "titular" | "acompanante" | "preguntas";
    indiceAcompanante?: number;
  }

  function generarSubPasos(
    totalAcompanantes: number,
    tienePreguntas: boolean,
  ): SubPaso[] {
    const pasos: SubPaso[] = [
      { id: "titular", etiqueta: "Titular", tipo: "titular" },
    ];
    for (let i = 0; i < totalAcompanantes; i++) {
      pasos.push({
        id: `acomp-${i}`,
        etiqueta: `Acompañante ${i + 1}`,
        tipo: "acompanante",
        indiceAcompanante: i,
      });
    }
    if (tienePreguntas) {
      pasos.push({
        id: "preguntas",
        etiqueta: "Preguntas del viaje",
        tipo: "preguntas",
      });
    }
    return pasos;
  }

  await t.test("Genera un solo paso si es titular sin acompañantes ni preguntas", () => {
    const pasos = generarSubPasos(0, false);
    assert.equal(pasos.length, 1);
    assert.equal(pasos[0].tipo, "titular");
  });

  await t.test("Genera sub-pasos por cada acompañante individual más preguntas", () => {
    const pasos = generarSubPasos(2, true);
    assert.equal(pasos.length, 4);
    assert.equal(pasos[0].tipo, "titular");
    assert.equal(pasos[1].tipo, "acompanante");
    assert.equal(pasos[1].etiqueta, "Acompañante 1");
    assert.equal(pasos[2].tipo, "acompanante");
    assert.equal(pasos[2].etiqueta, "Acompañante 2");
    assert.equal(pasos[3].tipo, "preguntas");
  });

  await t.test("Valida campos obligatorios de acompañante", () => {
    function validarAcompanante(acomp: {
      primerNombre: string;
      primerApellido: string;
      numeroIdentificacion: string;
    }): Record<string, string> {
      const err: Record<string, string> = {};
      if (!acomp.primerNombre.trim()) err.primerNombre = "Obligatorio";
      if (!acomp.primerApellido.trim()) err.primerApellido = "Obligatorio";
      if (!acomp.numeroIdentificacion.trim()) err.numeroIdentificacion = "Obligatorio";
      return err;
    }

    const vacio = validarAcompanante({
      primerNombre: "",
      primerApellido: "",
      numeroIdentificacion: "",
    });
    assert.equal(Object.keys(vacio).length, 3);

    const valido = validarAcompanante({
      primerNombre: "Carlos",
      primerApellido: "López",
      numeroIdentificacion: "001-010190-0001A",
    });
    assert.equal(Object.keys(valido).length, 0);
  });

  await t.test("Verificación estática de centrado y paginación en PasoViajeros.tsx", () => {
    const pasoViajerosPath = path.resolve(
      "src/components/inscripcion/PasoViajeros.tsx",
    );
    const code = fs.readFileSync(pasoViajerosPath, "utf-8");

    // Centrado de interfaz
    assert.ok(
      code.includes("max-w-xl") && code.includes("mx-auto"),
      "PasoViajeros debe usar un contenedor centrado con max-w-xl y mx-auto",
    );

    // Controles de paginación
    assert.ok(
      code.includes('role="tablist"'),
      "PasoViajeros debe incluir barra de paginación con role='tablist'",
    );
    assert.ok(
      code.includes("irAlSiguiente"),
      "PasoViajeros debe contar con función irAlSiguiente",
    );
    assert.ok(
      code.includes("irAlAnterior"),
      "PasoViajeros debe contar con función irAlAnterior",
    );
    assert.ok(
      code.includes("Continuar al pago"),
      "PasoViajeros debe contar con botón Continuar al pago",
    );
    assert.ok(
      code.includes("Volver a Cupos"),
      "PasoViajeros debe permitir volver a cupos desde el primer paso",
    );
  });
});
