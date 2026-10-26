import test from "node:test";
import assert from "node:assert/strict";
import {
  BUCKET_COMPROBANTES,
  RUTA_BASE_COMPROBANTES,
  BUCKET_USER_ENTRIES,
  RUTA_BASE_USER_ENTRIES,
} from "@/services/supabaseStorage.service";

test("Supabase Storage - Configuración de Buckets y Rutas", async (t) => {
  await t.test("Bucket de comprobantes apunta a capturas-comprobantes", () => {
    assert.equal(BUCKET_COMPROBANTES, "capturas-comprobantes");
  });

  await t.test("Ruta base de comprobantes dentro del bucket apunta a images", () => {
    assert.equal(RUTA_BASE_COMPROBANTES, "images");
  });

  await t.test("Bucket de respuestas de usuario apunta a user-entries-files", () => {
    assert.equal(BUCKET_USER_ENTRIES, "user-entries-files");
  });

  await t.test("Ruta base de respuestas de usuario dentro del bucket apunta a files", () => {
    assert.equal(RUTA_BASE_USER_ENTRIES, "files");
  });

  await t.test("Detección de URL de archivo subido a Supabase Storage vs texto plano", () => {
    function esArchivoUrl(valor: string): boolean {
      return (
        valor.startsWith("http://") ||
        valor.startsWith("https://") ||
        valor.startsWith("data:")
      );
    }

    const urlSupabase = "https://gnotslrwwptblfoofgsx.supabase.co/storage/v1/object/public/user-entries-files/files/entrada-12345.pdf";
    const base64Legacy = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...";
    const textoRespuesta = "Respuesta textual de prueba";

    assert.equal(esArchivoUrl(urlSupabase), true);
    assert.equal(esArchivoUrl(base64Legacy), true);
    assert.equal(esArchivoUrl(textoRespuesta), false);
  });
});

test("Markdown - Reglas y Estructura de Formato Enriquecido", async (t) => {
  await t.test("Detección de encabezados Markdown (H1, H2, H3)", () => {
    const textoH1 = "# Gran Expedición";
    const textoH2 = "## Itinerario";
    const textoH3 = "### Qué incluye";

    assert.equal(textoH1.startsWith("# ") && !textoH1.startsWith("## "), true);
    assert.equal(textoH2.startsWith("## ") && !textoH2.startsWith("### "), true);
    assert.equal(textoH3.startsWith("### "), true);
  });

  await t.test("Tokenización de formato inline (negrita, cursiva, enlaces, código)", () => {
    const regex = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;
    const texto = "Visita **Mombacho** con *guía* y mira [detalles](https://ejemplo.com) usando `GPS`.";
    const matches: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(texto)) !== null) {
      matches.push(match[0]);
    }

    assert.equal(matches.length, 4);
    assert.equal(matches[0], "**Mombacho**");
    assert.equal(matches[1], "*guía*");
    assert.equal(matches[2], "[detalles](https://ejemplo.com)");
    assert.equal(matches[3], "`GPS`");
  });

  await t.test("Detección de listas desordenadas y ordenadas", () => {
    const lineaViñeta = "- Botas de montaña";
    const lineaNumerada = "1. Salida desde Managua";

    assert.equal(/^[\*\-]\s+/.test(lineaViñeta), true);
    assert.equal(/^\d+\.\s+/.test(lineaNumerada), true);
  });

  await t.test("Detección de citas y divisores horizontales", () => {
    const cita = "> Importante: Llevar ropa cómoda.";
    const divisor = "---";

    assert.equal(cita.startsWith(">"), true);
    assert.equal(/^(\-{3,}|\*{3,})$/.test(divisor), true);
  });
});
