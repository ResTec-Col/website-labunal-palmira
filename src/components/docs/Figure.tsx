import { textoEnriquecido } from "./texto";
import type { ImagenGuia } from "./tipos";

interface FigureProps {
  src: ImagenGuia | undefined;
  alt: string;
  caption?: string;
}

const TAMANOS = "(min-width: 800px) 720px, calc(100vw - 32px)";

/** Figura de una guía con imagen responsive (WebP con `srcset`), dimensiones y pie de figura. */
export function Figure({ src, alt, caption }: FigureProps) {
  if (!src) {
    return (
      <figure className="rounded-md border border-dashed border-border-strong p-4 text-sm text-text-muted">
        <p className="m-0">Imagen no disponible.</p>
        {caption ? <figcaption>{textoEnriquecido(caption)}</figcaption> : null}
      </figure>
    );
  }

  const srcSet = src.fuentes.map((f) => `${f.url} ${f.ancho}w`).join(", ");

  return (
    <figure className="my-8">
      <img
        src={src.src}
        srcSet={srcSet}
        sizes={TAMANOS}
        alt={alt}
        width={src.ancho}
        height={src.alto}
        loading="lazy"
        decoding="async"
        className="h-auto max-w-full border border-border"
      />
      {caption ? <figcaption>{textoEnriquecido(caption)}</figcaption> : null}
    </figure>
  );
}
