import GithubSlugger from "github-slugger";
import { toString } from "mdast-util-to-string";
import { visit } from "unist-util-visit";
import { valueToEstree } from "estree-util-value-to-estree";
import type { Heading, Root, RootContent } from "mdast";
import type { TocItem } from "./tipos";

interface DatosEncabezado {
  hProperties?: Record<string, unknown>;
}

/** Asigna a cada encabezado un id estable (mismo algoritmo que rehype-slug) y devuelve el TOC (h2 y h3). */
export function extraerToc(arbol: Root): TocItem[] {
  const slugger = new GithubSlugger();
  const toc: TocItem[] = [];
  visit(arbol, "heading", (nodo: Heading) => {
    const texto = toString(nodo).replace(/\s+/g, " ").trim();
    if (!texto) return;
    const datos = (nodo.data ??= {}) as DatosEncabezado;
    const propiedades = (datos.hProperties ??= {});
    const existente = typeof propiedades.id === "string" && propiedades.id ? propiedades.id : null;
    const id = existente ?? slugger.slug(texto);
    propiedades.id = id;
    if (nodo.depth === 2 || nodo.depth === 3) toc.push({ id, texto, nivel: nodo.depth });
  });
  return toc;
}

/** Crea el nodo ESM `export const toc = [...]` para el documento MDX. */
function nodoExportacion(toc: TocItem[]): RootContent {
  return {
    type: "mdxjsEsm",
    value: "",
    data: {
      estree: {
        type: "Program",
        sourceType: "module",
        comments: [],
        body: [
          {
            type: "ExportNamedDeclaration",
            specifiers: [],
            source: null,
            attributes: [],
            declaration: {
              type: "VariableDeclaration",
              kind: "const",
              declarations: [
                {
                  type: "VariableDeclarator",
                  id: { type: "Identifier", name: "toc" },
                  init: valueToEstree(toc),
                },
              ],
            },
          },
        ],
      },
    },
  } as unknown as RootContent;
}

/**
 * Plugin remark: fija los ids de los encabezados y exporta `toc` (h2 y h3) desde cada MDX,
 * para la tabla de contenido de `DocLayout`. Si el documento ya exporta `toc`, no lo duplica.
 */
export default function remarkTocExport() {
  return function transformar(arbol: Root): void {
    const toc = extraerToc(arbol);
    const yaExporta = arbol.children.some(
      (nodo) => (nodo as { type: string }).type === "mdxjsEsm" && /export\s+const\s+toc\b/.test((nodo as { value?: string }).value ?? ""),
    );
    if (!yaExporta) arbol.children.unshift(nodoExportacion(toc));
  };
}

export { remarkTocExport };
