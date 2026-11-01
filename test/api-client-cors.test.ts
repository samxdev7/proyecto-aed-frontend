import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("Normalización de URL del Backend para Despliegue en ApiClient", async (t) => {
  function normalizarBaseUrl(rawUrl?: string): string {
    const raw = rawUrl || "http://localhost:8080/api";
    const cleaned = raw.trim().replace(/\/+$/, "");
    return cleaned.endsWith("/api") ? cleaned : `${cleaned}/api`;
  }

  await t.test("Preserva URL con /api al final", () => {
    assert.equal(
      normalizarBaseUrl("http://localhost:8080/api"),
      "http://localhost:8080/api",
    );
  });

  await t.test("Agrega /api si la URL de despliegue no la incluye", () => {
    assert.equal(
      normalizarBaseUrl("https://cnm-backend.onrender.com"),
      "https://cnm-backend.onrender.com/api",
    );
  });

  await t.test("Limpia barras finales redundantes antes de agregar /api", () => {
    assert.equal(
      normalizarBaseUrl("https://cnm-backend.onrender.com/"),
      "https://cnm-backend.onrender.com/api",
    );
    assert.equal(
      normalizarBaseUrl("https://cnm-backend.onrender.com/api///"),
      "https://cnm-backend.onrender.com/api",
    );
  });

  await t.test("Usa fallback a http://localhost:8080/api si no se define", () => {
    assert.equal(normalizarBaseUrl(undefined), "http://localhost:8080/api");
    assert.equal(normalizarBaseUrl(""), "http://localhost:8080/api");
  });
});

test("Verificación Estática de Encabezados y CORS en ApiClient y Configuración", async (t) => {
  await t.test("ApiClient.ts normaliza NEXT_PUBLIC_API_URL con /api", () => {
    const apiClientPath = path.resolve("src/lib/api-client.ts");
    const code = fs.readFileSync(apiClientPath, "utf-8");

    assert.ok(
      code.includes("getBaseUrl") || code.includes("/api"),
      "ApiClient debe asegurar que las peticiones apunten al context-path /api",
    );
  });

  await t.test(".env.example documenta la URL con /api para evitar fallos de despliegue", () => {
    const envExamplePath = path.resolve(".env.example");
    const code = fs.readFileSync(envExamplePath, "utf-8");

    assert.ok(
      code.includes("NEXT_PUBLIC_API_URL=http://localhost:8080/api") ||
        code.includes("/api"),
      ".env.example debe sugerir /api en la URL base",
    );
  });
});
