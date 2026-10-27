import { describe, expect, it } from "vitest";
import {
  jsonLdMigas,
  normalizarRuta,
  recortarDescripcion,
  serializarJsonLd,
  tituloPagina,
  urlCanonica,
} from "./seo";

describe("normalizarRuta", () => {
  it("agrega la barra final y elimina query y hash", () => {
    expect(normalizarRuta("/guias")).toBe("/guias/");
    expect(normalizarRuta("guias/composicion-quimica?x=1#a")).toBe("/guias/composicion-quimica/");
    expect(normalizarRuta("/")).toBe("/");
    expect(normalizarRuta("")).toBe("/");
  });

  it("respeta las rutas de archivos", () => {
    expect(normalizarRuta("/data/plantilla-especies.xlsx")).toBe("/data/plantilla-especies.xlsx");
  });
});

describe("urlCanonica", () => {
  it("devuelve una URL absoluta con barra final", () => {
    expect(urlCanonica("/acerca")).toBe("https://labnutripalmira.netlify.app/acerca/");
    expect(urlCanonica("/")).toBe("https://labnutripalmira.netlify.app/");
  });
});

describe("tituloPagina", () => {
  it("usa el patrón página · sitio", () => {
    expect(tituloPagina("Plantillas de registro")).toBe(
      "Plantillas de registro · Laboratorio de Nutrición Animal – UNAL Palmira",
    );
    expect(tituloPagina()).toBe("Laboratorio de Nutrición Animal – UNAL Palmira");
  });
});

describe("recortarDescripcion", () => {
  it("no supera 160 caracteres", () => {
    const resultado = recortarDescripcion("palabra ".repeat(60));
    expect(resultado.length).toBeLessThanOrEqual(160);
    expect(resultado.endsWith("…")).toBe(true);
  });

  it("conserva textos cortos", () => {
    expect(recortarDescripcion("  Texto   corto ")).toBe("Texto corto");
  });
});

describe("JSON-LD", () => {
  it("escapa caracteres peligrosos para un script inline", () => {
    const original = { nombre: "</script><script>alert(1)</script>" };
    const salida = serializarJsonLd(original);
    expect(salida).not.toContain("<");
    expect(salida).not.toContain(">");
    expect(JSON.parse(salida)).toEqual(original);
  });

  it("construye BreadcrumbList con posiciones y URL absolutas", () => {
    const datos = jsonLdMigas([
      { nombre: "Inicio", ruta: "/" },
      { nombre: "Guías", ruta: "/guias" },
    ]) as { itemListElement: { position: number; item: string }[] };
    expect(datos.itemListElement.map((item) => item.position)).toEqual([1, 2]);
    expect(datos.itemListElement[1].item).toBe("https://labnutripalmira.netlify.app/guias/");
  });
});
