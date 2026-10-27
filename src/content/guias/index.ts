import { METAS, rutaGuia, rutasPrerender } from "./rutas";
import type {
  Autor,
  Capitulo,
  CapituloEnGuia,
  Guia,
  MetaGuia,
  ModuloCapitulo,
  SlugGuia,
} from "./tipos";

export type {
  Autor,
  Capitulo,
  CapituloEnGuia,
  FrontmatterCapitulo,
  Guia,
  ModuloCapitulo,
  SlugGuia,
  TocItem,
} from "./tipos";
export { DocLayout } from "../../components/docs/DocLayout";
export { rutaGuia, rutasPrerender };

const modulos = import.meta.glob<ModuloCapitulo>("./*/*.mdx");

interface DefinicionGuia {
  slug: SlugGuia;
  titulo: string;
  subtitulo: string;
  autores: Autor[];
  descripcion: string;
  pdf?: string;
  meta: MetaGuia;
}

const DEFINICIONES: DefinicionGuia[] = [
  {
    slug: "analisis-alimentos-y-forrajes",
    titulo: "Análisis de alimentos y forrajes",
    subtitulo: "Protocolos de laboratorio",
    autores: [
      { nombre: "Pascal Leterme", cargo: "I.A., Ph. D., profesor asociado" },
      { nombre: "Fernando Estrada", cargo: "I.A., Esp., analista" },
    ],
    descripcion:
      "Protocolos del laboratorio para determinar materia seca, cenizas, extracto etéreo, proteína bruta, fibras de Van Soest y energía bruta en alimentos y forrajes.",
    meta: METAS["analisis-alimentos-y-forrajes"],
  },
  {
    slug: "composicion-quimica",
    titulo: "Composición química de los alimentos",
    subtitulo: "Interpretación de resultados de laboratorio",
    autores: [
      {
        nombre: "Luz Stella Muñoz Arboleda",
        cargo: "Profesora asociada, Departamento de Ciencia Animal",
      },
    ],
    descripcion:
      "Texto docente sobre la composición química de los alimentos para animales y la interpretación de los resultados de laboratorio, con tablas, ejemplos y anexos.",
    meta: METAS["composicion-quimica"],
  },
];

/** Devuelve la función que carga de forma diferida el módulo MDX de un capítulo. */
function cargador(guia: SlugGuia, archivo: string): () => Promise<ModuloCapitulo> {
  const ruta = `./${guia}/${archivo}`;
  const cargar = modulos[ruta];
  return async () => {
    if (!cargar) {
      throw new Error(`No se encontró el contenido del capítulo ${ruta}.`);
    }
    try {
      return await cargar();
    } catch (error) {
      throw new Error(`No se pudo cargar el capítulo ${ruta}.`, { cause: error });
    }
  };
}

/** Construye una guía del contrato a partir de su definición y de su `_meta.ts`. */
function construirGuia(definicion: DefinicionGuia): Guia {
  const capitulos: Capitulo[] = [...definicion.meta.capitulos]
    .sort((a, b) => a.orden - b.orden)
    .map((c) => ({
      slug: c.slug,
      titulo: c.titulo,
      descripcion: c.descripcion,
      orden: c.orden,
      load: cargador(definicion.slug, c.archivo),
    }));
  return {
    slug: definicion.slug,
    titulo: definicion.titulo,
    subtitulo: definicion.subtitulo,
    autores: definicion.autores,
    descripcion: definicion.descripcion,
    pdf: definicion.pdf,
    tiempoLecturaMin: definicion.meta.tiempoLecturaMin,
    capitulos,
  };
}

export const guias: Guia[] = DEFINICIONES.map(construirGuia);

/** Busca una guía por su slug. */
export function getGuia(slug: string): Guia | undefined {
  return guias.find((g) => g.slug === slug);
}

/** Busca un capítulo y devuelve también su guía y los capítulos anterior y siguiente. */
export function getCapitulo(guia: string, cap: string): CapituloEnGuia | undefined {
  const encontrada = getGuia(guia);
  if (!encontrada) return undefined;
  const indice = encontrada.capitulos.findIndex((c) => c.slug === cap);
  if (indice < 0) return undefined;
  return {
    guia: encontrada,
    capitulo: encontrada.capitulos[indice],
    prev: indice > 0 ? encontrada.capitulos[indice - 1] : undefined,
    next: indice < encontrada.capitulos.length - 1 ? encontrada.capitulos[indice + 1] : undefined,
  };
}
