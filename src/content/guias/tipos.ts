import type { ComponentType } from "react";

export interface TocItem {
  id: string;
  texto: string;
  nivel: 2 | 3;
}

export interface FrontmatterCapitulo {
  titulo: string;
  descripcion: string;
}

export interface ModuloCapitulo {
  default: ComponentType;
  toc: TocItem[];
  frontmatter: FrontmatterCapitulo;
}

export interface Capitulo {
  slug: string;
  titulo: string;
  descripcion: string;
  orden: number;
  load: () => Promise<ModuloCapitulo>;
}

export interface Autor {
  nombre: string;
  cargo: string;
}

export type SlugGuia = "analisis-alimentos-y-forrajes" | "composicion-quimica";

export interface Guia {
  slug: SlugGuia;
  titulo: string;
  subtitulo: string;
  autores: Autor[];
  descripcion: string;
  pdf?: string;
  tiempoLecturaMin: number;
  capitulos: Capitulo[];
}

export interface MetaCapitulo {
  slug: string;
  archivo: string;
  titulo: string;
  descripcion: string;
  orden: number;
}

export interface MetaGuia {
  tiempoLecturaMin: number;
  capitulos: MetaCapitulo[];
}

export interface CapituloEnGuia {
  guia: Guia;
  capitulo: Capitulo;
  prev?: Capitulo;
  next?: Capitulo;
}
