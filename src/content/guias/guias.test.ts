import { describe, expect, it } from "vitest";
import type { Root } from "mdast";
import { getCapitulo, getGuia, guias, rutasPrerender } from "./index";
import remarkTocExport, { extraerToc } from "./remark-toc-export";

const modulosMdx = import.meta.glob("./*/*.mdx");
const largo = (texto: string) => [...texto].length;

describe("contenido de las guías", () => {
  it("publica las dos guías con sus capítulos", () => {
    expect(guias.map((g) => g.slug)).toEqual(["analisis-alimentos-y-forrajes", "composicion-quimica"]);
    expect(getGuia("analisis-alimentos-y-forrajes")?.capitulos).toHaveLength(9);
    expect(getGuia("composicion-quimica")?.capitulos).toHaveLength(14);
    expect(getGuia("no-existe")).toBeUndefined();
  });

  it("conserva los slugs de los anexos de la guía de composición", () => {
    const slugs = getGuia("composicion-quimica")?.capitulos.map((c) => c.slug) ?? [];
    expect(slugs).toEqual(
      expect.arrayContaining([
        "anexo-1-materia-seca",
        "anexo-2-cenizas",
        "anexo-3-extracto-etereo",
        "anexo-4-proteina",
        "anexo-5-van-soest",
      ]),
    );
  });

  it("tiene un módulo MDX para cada capítulo", () => {
    const archivos = Object.keys(modulosMdx);
    expect(archivos).toHaveLength(23);
    for (const guia of guias) {
      for (const capitulo of guia.capitulos) {
        expect(archivos.some((a) => a.startsWith(`./${guia.slug}/`) && a.endsWith(`-${capitulo.slug}.mdx`))).toBe(true);
      }
    }
  });

  it("usa descripciones de 140 a 160 caracteres", () => {
    for (const guia of guias) {
      expect(largo(guia.descripcion)).toBeGreaterThanOrEqual(140);
      expect(largo(guia.descripcion)).toBeLessThanOrEqual(160);
      for (const capitulo of guia.capitulos) {
        expect(largo(capitulo.descripcion), capitulo.slug).toBeGreaterThanOrEqual(140);
        expect(largo(capitulo.descripcion), capitulo.slug).toBeLessThanOrEqual(160);
      }
    }
  });

  it("devuelve el capítulo con sus vecinos", () => {
    const primero = getCapitulo("analisis-alimentos-y-forrajes", "introduccion");
    expect(primero?.prev).toBeUndefined();
    expect(primero?.next?.slug).toBe("generalidades");
    const ultimo = getCapitulo("composicion-quimica", "anexo-5-van-soest");
    expect(ultimo?.prev?.slug).toBe("anexo-4-proteina");
    expect(ultimo?.next).toBeUndefined();
    expect(getCapitulo("composicion-quimica", "no-existe")).toBeUndefined();
    expect(getCapitulo("no-existe", "introduccion")).toBeUndefined();
  });

  it("genera rutas de prerender únicas y con barra final", () => {
    const rutas = rutasPrerender();
    expect(rutas).toHaveLength(2 + 9 + 14);
    expect(new Set(rutas).size).toBe(rutas.length);
    expect(rutas).toContain("/guias/composicion-quimica/");
    expect(rutas).toContain("/guias/analisis-alimentos-y-forrajes/proteina/");
    for (const ruta of rutas) expect(ruta).toMatch(/^\/guias\/[a-z0-9-]+\/([a-z0-9-]+\/)?$/);
  });
});

describe("remark-toc-export", () => {
  const encabezado = (depth: 1 | 2 | 3 | 4, value: string) => ({
    type: "heading" as const,
    depth,
    children: [{ type: "text" as const, value }],
  });

  it("asigna ids únicos y extrae solo h2 y h3", () => {
    const arbol: Root = {
      type: "root",
      children: [
        encabezado(2, "Material necesario"),
        encabezado(3, "Procedimiento"),
        encabezado(4, "Cálculos"),
        encabezado(2, "Material necesario"),
      ],
    };
    const toc = extraerToc(arbol);
    expect(toc).toEqual([
      { id: "material-necesario", texto: "Material necesario", nivel: 2 },
      { id: "procedimiento", texto: "Procedimiento", nivel: 3 },
      { id: "material-necesario-1", texto: "Material necesario", nivel: 2 },
    ]);
    const ids = arbol.children.map((n) => (n.data as { hProperties?: { id?: string } } | undefined)?.hProperties?.id);
    expect(ids).toEqual(["material-necesario", "procedimiento", "cálculos", "material-necesario-1"]);
  });

  it("añade la exportación ESM de toc al inicio del documento", () => {
    const arbol: Root = { type: "root", children: [encabezado(2, "Cenizas totales")] };
    remarkTocExport()(arbol);
    const primero = arbol.children[0] as unknown as { type: string; data: { estree: { body: unknown[] } } };
    expect(primero.type).toBe("mdxjsEsm");
    expect(JSON.stringify(primero.data.estree.body)).toContain('"name":"toc"');
    expect(JSON.stringify(primero.data.estree.body)).toContain("cenizas-totales");
  });
});
