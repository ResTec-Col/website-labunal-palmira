// @vitest-environment node
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { construirSitemap, generarSitemap, rutasDesdeHtml } from "./sitemap.mjs";

const temporales = [];

afterEach(() => {
  for (const directorio of temporales.splice(0)) rmSync(directorio, { recursive: true, force: true });
});

function crearBuild() {
  const directorio = mkdtempSync(join(tmpdir(), "sitemap-"));
  temporales.push(directorio);
  for (const ruta of ["", "guias", "guias/composicion-quimica", "404", "assets/x"]) {
    mkdirSync(join(directorio, ruta), { recursive: true });
    writeFileSync(join(directorio, ruta, "index.html"), "<html></html>");
  }
  writeFileSync(join(directorio, "__spa-fallback.html"), "<html></html>");
  return directorio;
}

describe("sitemap", () => {
  it("lista las rutas prerenderizadas sin 404 ni assets", () => {
    expect(rutasDesdeHtml(crearBuild())).toEqual(["/", "/guias/", "/guias/composicion-quimica/"]);
  });

  it("genera XML con URL absolutas", () => {
    const xml = construirSitemap([{ ruta: "/guias/", lastmod: "2026-10-27T00:00:00Z" }]);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain("<loc>https://labnutripalmira.netlify.app/guias/</loc>");
    expect(xml).toContain("<lastmod>2026-10-27T00:00:00Z</lastmod>");
  });

  it("prepara 404.html y escribe sitemap.xml", () => {
    const directorio = crearBuild();
    expect(generarSitemap(directorio)).toEqual({ paginas: 3, hay404: true });
    expect(existsSync(join(directorio, "404.html"))).toBe(true);
    expect(existsSync(join(directorio, "404"))).toBe(false);
    expect(existsSync(join(directorio, "__spa-fallback.html"))).toBe(false);
    expect(readFileSync(join(directorio, "sitemap.xml"), "utf8")).not.toContain("404");
  });
});
