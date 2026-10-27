import { meta as metaAnalisis } from "./analisis-alimentos-y-forrajes/_meta";
import { meta as metaComposicion } from "./composicion-quimica/_meta";
import type { MetaGuia, SlugGuia } from "./tipos";

/** Metadatos de capítulos por guía, en el orden en que se publican las guías. */
export const METAS: Record<SlugGuia, MetaGuia> = {
  "analisis-alimentos-y-forrajes": metaAnalisis,
  "composicion-quimica": metaComposicion,
};

/** Ruta pública de una guía o de uno de sus capítulos, con barra final. */
export function rutaGuia(guia: string, capitulo?: string): string {
  return capitulo ? `/guias/${guia}/${capitulo}/` : `/guias/${guia}/`;
}

/**
 * Rutas de las guías y de sus capítulos para el prerender de React Router.
 * No depende de Vite ni de JSX, así que se puede importar desde `react-router.config.ts`.
 */
export function rutasPrerender(): string[] {
  return (Object.entries(METAS) as [SlugGuia, MetaGuia][]).flatMap(([slug, meta]) => [
    rutaGuia(slug),
    ...[...meta.capitulos].sort((a, b) => a.orden - b.orden).map((c) => rutaGuia(slug, c.slug)),
  ]);
}
