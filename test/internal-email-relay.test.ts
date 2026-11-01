import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { POST, runtime, dynamic } from "@/app/api/internal/email/route";

test("Route Handler /api/internal/email - Configuración y seguridad", async (t) => {
  const originalEnv = { ...process.env };

  t.afterEach(() => {
    process.env = { ...originalEnv };
  });

  await t.test("Exporta runtime 'nodejs' y dynamic 'force-dynamic' para compatibilidad con Nodemailer", () => {
    assert.equal(runtime, "nodejs");
    assert.equal(dynamic, "force-dynamic");
  });

  await t.test("Rechaza con 401 si falta la cabecera x-internal-secret", async () => {
    process.env.INTERNAL_EMAIL_SECRET = "super_secreto_123";

    const req = new Request("http://localhost:3000/api/internal/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: "test@example.com", subject: "Prueba", html: "<p>Hola</p>" }),
    });

    const res = await POST(req);
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.match(data.error, /secreto interno/i);
  });

  await t.test("Rechaza con 401 si x-internal-secret no coincide con el configurado", async () => {
    process.env.INTERNAL_EMAIL_SECRET = "super_secreto_123";

    const req = new Request("http://localhost:3000/api/internal/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": "secreto_incorrecto",
      },
      body: JSON.stringify({ to: "test@example.com", subject: "Prueba", html: "<p>Hola</p>" }),
    });

    const res = await POST(req);
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
  });

  await t.test("Rechaza con 400 si faltan campos obligatorios en el body", async () => {
    process.env.INTERNAL_EMAIL_SECRET = "secret_ok";

    // Falta html
    const req1 = new Request("http://localhost:3000/api/internal/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": "secret_ok",
      },
      body: JSON.stringify({ to: "test@example.com", subject: "Prueba" }),
    });

    const res1 = await POST(req1);
    assert.equal(res1.status, 400);
    const data1 = await res1.json();
    assert.equal(data1.success, false);
    assert.match(data1.error, /Faltan campos requeridos/i);

    // Falta to
    const req2 = new Request("http://localhost:3000/api/internal/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": "secret_ok",
      },
      body: JSON.stringify({ subject: "Prueba", html: "<p>Hola</p>" }),
    });

    const res2 = await POST(req2);
    assert.equal(res2.status, 400);

    // Falta subject
    const req3 = new Request("http://localhost:3000/api/internal/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": "secret_ok",
      },
      body: JSON.stringify({ to: "test@example.com", html: "<p>Hola</p>" }),
    });

    const res3 = await POST(req3);
    assert.equal(res3.status, 400);
  });

  await t.test("Rechaza con 500 si no están configuradas MAIL_USERNAME o MAIL_PASSWORD", async () => {
    process.env.INTERNAL_EMAIL_SECRET = "secret_ok";
    delete process.env.MAIL_USERNAME;
    delete process.env.MAIL_PASSWORD;

    const req = new Request("http://localhost:3000/api/internal/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": "secret_ok",
      },
      body: JSON.stringify({ to: "test@example.com", subject: "Asunto", html: "<p>Hola</p>" }),
    });

    const res = await POST(req);
    assert.equal(res.status, 500);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.match(data.error, /MAIL_USERNAME o MAIL_PASSWORD no configuradas/i);
  });
});
