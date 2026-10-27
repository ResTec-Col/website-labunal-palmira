import { describe, expect, it } from "vitest";
import { buscar, decodificarEntidades, fragmentosExtracto, rutaInterna, type Pagefind } from "./pagefind";

describe("fragmentosExtracto", () => {
  it("separa el texto resaltado sin interpretar HTML", () => {
    const fragmentos = fragmentosExtracto("Método <mark>Kjeldahl</mark> para &lt;proteína&gt; <img src=x>");
    expect(fragmentos).toEqual([
      { texto: "Método ", resaltado: false },
      { texto: "Kjeldahl", resaltado: true },
      { texto: " para <proteína> ", resaltado: false },
    ]);
  });

  it("devuelve una lista vacía para un extracto vacío", () => {
    expect(fragmentosExtracto("")).toEqual([]);
  });
});

describe("decodificarEntidades", () => {
  it("decodifica entidades numéricas y con nombre", () => {
    expect(decodificarEntidades("&amp; &#233; &#xF1;")).toBe("& é ñ");
  });
});

describe("rutaInterna", () => {
  it("conserva ruta y ancla", () => {
    expect(rutaInterna("/guias/composicion-quimica/proteina/#etapa-1")).toBe(
      "/guias/composicion-quimica/proteina/#etapa-1",
    );
  });
});

describe("buscar", () => {
  it("transforma los resultados de Pagefind", async () => {
    const falso: Pagefind = {
      search: async () => ({
        results: [
          {
            id: "1",
            data: async () => ({
              url: "/guias/x/cenizas/",
              excerpt: "Determinación de <mark>cenizas</mark>",
              meta: { title: "Cenizas" },
            }),
          },
        ],
      }),
    };
    const resultados = await buscar(falso, " cenizas ");
    expect(resultados).toHaveLength(1);
    expect(resultados[0]).toMatchObject({ url: "/guias/x/cenizas/", titulo: "Cenizas" });
    expect(await buscar(falso, "   ")).toEqual([]);
  });
});
