import { Link } from "react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { rutaGuia } from "../../content/guias/rutas";
import type { Capitulo, Guia } from "../../content/guias/tipos";

interface PrevNextProps {
  guia: Guia;
  prev?: Capitulo;
  next?: Capitulo;
}

/** Enlaces al capítulo anterior y al siguiente de la guía. */
export function PrevNext({ guia, prev, next }: PrevNextProps) {
  if (!prev && !next) return null;

  return (
    <nav aria-label="Capítulo anterior y siguiente" className="mt-12 grid gap-4 border-t border-border pt-8 sm:grid-cols-2">
      {prev ? (
        <Link to={rutaGuia(guia.slug, prev.slug)} prefetch="intent" rel="prev" className="tarjeta tarjeta-enlace p-4">
          <span className="flex items-center gap-1 text-sm text-text-subtle">
            <ArrowLeft aria-hidden="true" className="size-4" />
            Anterior
          </span>
          <span className="mt-1 block font-semibold text-text">{prev.titulo}</span>
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}
      {next ? (
        <Link
          to={rutaGuia(guia.slug, next.slug)}
          prefetch="intent"
          rel="next"
          className="tarjeta tarjeta-enlace p-4 text-right sm:col-start-2"
        >
          <span className="flex items-center justify-end gap-1 text-sm text-text-subtle">
            Siguiente
            <ArrowRight aria-hidden="true" className="size-4" />
          </span>
          <span className="mt-1 block font-semibold text-text">{next.titulo}</span>
        </Link>
      ) : null}
    </nav>
  );
}
