// @vitest-environment node
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { construirCsp, extraerScriptsInline, generarHeaders, hashScript } from "./csp-headers.mjs";

const temporales = [];

afterEach(() => {
  for (const directorio of temporales.splice(0)) rmSync(directorio, { recursive: true, force: true });
});

describe("csp-headers", () => {
  it("extrae solo scripts inline ejecutables con contenido", () => {
    const html =
      '<script src="/a.js"></script><script>uno()</script><script type="application/ld+json">{"a":1}</script><script></script><script type="module" async="">dos()</script>';
    expect(extraerScriptsInline(html)).toEqual(["uno()", "dos()"]);
  });

  it("calcula el hash sha256 en base64", () => {
    const esperado = createHash("sha256").update("uno()").digest("base64");
    expect(hashScript("uno()")).toBe(`'sha256-${esperado}'`);
  });

  it("construye la política sin unsafe-inline en scripts", () => {
    const csp = construirCsp(["'sha256-b'", "'sha256-a'", "'sha256-a'"]);
    expect(csp).toContain("script-src 'self' 'wasm-unsafe-eval' 'sha256-a' 'sha256-b';");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toMatch(/upgrade-insecure-requests$/);
    expect(csp.split("script-src")[1].split(";")[0]).not.toContain("unsafe-inline");
  });

  it("escribe _headers recorriendo los HTML del build y es idempotente", () => {
    const directorio = mkdtempSync(join(tmpdir(), "csp-"));
    temporales.push(directorio);
    mkdirSync(join(directorio, "guias"));
    writeFileSync(join(directorio, "index.html"), "<script>a()</script>");
    writeFileSync(join(directorio, "guias", "index.html"), "<script>b()</script><script>a()</script>");
    expect(generarHeaders(directorio)).toMatchObject({ archivos: 2, hashes: 2 });
    const headers = readFileSync(join(directorio, "_headers"), "utf8");
    expect(headers.startsWith("/*\n  Content-Security-Policy: ")).toBe(true);
    generarHeaders(directorio);
    const repetido = readFileSync(join(directorio, "_headers"), "utf8");
    expect(repetido.match(/Content-Security-Policy/g)).toHaveLength(1);
  });
});
