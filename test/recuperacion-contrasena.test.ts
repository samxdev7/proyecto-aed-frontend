import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("Recuperación de Contraseña - Verificación Estática en Frontend", async (t) => {
  await t.test("Campo.tsx implementa prop accionLabel para encabezados derechos", () => {
    const campoPath = path.resolve("src/components/ui/Campo.tsx");
    const campoCode = fs.readFileSync(campoPath, "utf-8");

    assert.ok(
      campoCode.includes("accionLabel?: React.ReactNode"),
      "CampoProps debe incluir la prop opcional accionLabel",
    );
    assert.ok(
      campoCode.includes("flex items-center justify-between") &&
        campoCode.includes("{accionLabel}"),
      "Campo.tsx debe renderizar accionLabel a la derecha del label",
    );
  });

  await t.test("iniciar-sesion/page.tsx incluye el enlace ¿Olvidaste tu contraseña? al lado de contraseña", () => {
    const loginPath = path.resolve("src/app/(public)/iniciar-sesion/page.tsx");
    const loginCode = fs.readFileSync(loginPath, "utf-8");

    assert.ok(
      loginCode.includes('href="/recuperar-contrasena"'),
      "iniciar-sesion debe contener enlace a /recuperar-contrasena",
    );
    assert.ok(
      loginCode.includes("¿Olvidaste tu contraseña?"),
      "iniciar-sesion debe mostrar el texto '¿Olvidaste tu contraseña?'",
    );
    assert.ok(
      loginCode.includes("accionLabel="),
      "iniciar-sesion debe pasar accionLabel al campo Contraseña",
    );
  });

  await t.test("auth.service.ts expone solicitarRecuperacion y restablecerContrasena", () => {
    const authServicePath = path.resolve("src/services/auth.service.ts");
    const authServiceCode = fs.readFileSync(authServicePath, "utf-8");

    assert.ok(
      authServiceCode.includes("solicitarRecuperacion"),
      "authService debe incluir solicitarRecuperacion",
    );
    assert.ok(
      authServiceCode.includes("/auth/recuperar-contrasena"),
      "solicitarRecuperacion debe llamar a /auth/recuperar-contrasena",
    );
    assert.ok(
      authServiceCode.includes("restablecerContrasena"),
      "authService debe incluir restablecerContrasena",
    );
    assert.ok(
      authServiceCode.includes("/auth/restablecer-contrasena"),
      "restablecerContrasena debe llamar a /auth/restablecer-contrasena",
    );
  });

  await t.test("recuperar-contrasena/page.tsx y restablecer-contrasena/page.tsx existen y manejan tokens", () => {
    const recuperarPath = path.resolve(
      "src/app/(public)/recuperar-contrasena/page.tsx",
    );
    const restablecerPath = path.resolve(
      "src/app/(public)/restablecer-contrasena/page.tsx",
    );

    assert.ok(
      fs.existsSync(recuperarPath),
      "Debe existir la página /recuperar-contrasena",
    );
    assert.ok(
      fs.existsSync(restablecerPath),
      "Debe existir la página /restablecer-contrasena",
    );

    const restablecerCode = fs.readFileSync(restablecerPath, "utf-8");
    assert.ok(
      restablecerCode.includes('searchParams.get("token")'),
      "restablecer-contrasena debe leer el token desde los parámetros URL",
    );
    assert.ok(
      restablecerCode.includes("nuevaContrasena") &&
        restablecerCode.includes("confirmarContrasena"),
      "restablecer-contrasena debe solicitar y confirmar la nueva clave",
    );
  });

  await t.test("Header.tsx y Footer.tsx se ocultan en pantallas de recuperación de contraseña", () => {
    const headerPath = path.resolve("src/components/layout/Header.tsx");
    const footerPath = path.resolve("src/components/layout/Footer.tsx");
    const headerCode = fs.readFileSync(headerPath, "utf-8");
    const footerCode = fs.readFileSync(footerPath, "utf-8");

    assert.ok(
      headerCode.includes('ruta === "/recuperar-contrasena"') &&
        headerCode.includes('ruta === "/restablecer-contrasena"'),
      "Header.tsx debe ocultarse en /recuperar-contrasena y /restablecer-contrasena",
    );
    assert.ok(
      footerCode.includes('ruta === "/recuperar-contrasena"') &&
        footerCode.includes('ruta === "/restablecer-contrasena"'),
      "Footer.tsx debe ocultarse en /recuperar-contrasena y /restablecer-contrasena",
    );
  });
});

test("Reglas de Negocio y Validación en Recuperación de Contraseña", async (t) => {
  function validarFormularioRestablecer(
    nueva: string,
    confirmacion: string,
  ): string | null {
    if (nueva.length < 6) {
      return "La contraseña debe tener al menos 6 caracteres.";
    }
    if (nueva !== confirmacion) {
      return "Las contraseñas no coinciden.";
    }
    return null;
  }

  await t.test("Rechaza contraseñas con menos de 6 caracteres", () => {
    assert.equal(
      validarFormularioRestablecer("12345", "12345"),
      "La contraseña debe tener al menos 6 caracteres.",
    );
  });

  await t.test("Rechaza contraseñas que no coinciden", () => {
    assert.equal(
      validarFormularioRestablecer("claveSegura123", "claveDistinta123"),
      "Las contraseñas no coinciden.",
    );
  });

  await t.test("Acepta contraseñas válidas y coincidentes", () => {
    assert.equal(
      validarFormularioRestablecer("Montanismo2026!", "Montanismo2026!"),
      null,
    );
  });

  await t.test("Extracción y validación del token de URL", () => {
    function validarParametroToken(url: string): string | null {
      const u = new URL(url, "https://example.com");
      const token = u.searchParams.get("token");
      return token && token.trim().length > 0 ? token : null;
    }

    assert.equal(validarParametroToken("https://example.com/restablecer-contrasena"), null);
    assert.equal(validarParametroToken("https://example.com/restablecer-contrasena?token="), null);
    assert.equal(
      validarParametroToken("https://example.com/restablecer-contrasena?token=abc-123-uuid"),
      "abc-123-uuid",
    );
  });
});
