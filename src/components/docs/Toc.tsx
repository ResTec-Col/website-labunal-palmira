import { useEffect, useState } from "react";
import type { TocItem } from "../../content/guias/tipos";

interface TocProps {
  items: TocItem[];
  titulo?: string;
}

const MARGEN_OBSERVADOR = "-96px 0px -65% 0px";
const MAX_REINTENTOS = 20;

/** Tabla de contenido del capítulo con resaltado de la sección visible (scrollspy). */
export function Toc({ items, titulo = "En esta página" }: TocProps) {
  const [activo, setActivo] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0 || typeof window === "undefined" || !("IntersectionObserver" in window)) return;
    const visibles = new Set<string>();
    let observador: IntersectionObserver | null = null;
    let cuadro = 0;
    let reintentos = 0;

    const alCambiar = (entradas: IntersectionObserverEntry[]) => {
      for (const entrada of entradas) {
        if (entrada.isIntersecting) visibles.add(entrada.target.id);
        else visibles.delete(entrada.target.id);
      }
      const primero = items.find((item) => visibles.has(item.id));
      if (primero) setActivo(primero.id);
    };

    const observar = () => {
      try {
        const elementos = items
          .map((item) => document.getElementById(item.id))
          .filter((elemento): elemento is HTMLElement => elemento !== null);
        if (elementos.length === 0 && reintentos < MAX_REINTENTOS) {
          reintentos++;
          cuadro = window.requestAnimationFrame(observar);
          return;
        }
        observador = new IntersectionObserver(alCambiar, { rootMargin: MARGEN_OBSERVADOR });
        for (const elemento of elementos) observador.observe(elemento);
      } catch {
        observador?.disconnect();
      }
    };

    observar();
    return () => {
      window.cancelAnimationFrame(cuadro);
      observador?.disconnect();
    };
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav aria-label={titulo} className="text-sm">
      <p className="m-0 mb-3 text-sm font-semibold text-text">{titulo}</p>
      <ol className="m-0 flex list-none flex-col gap-1 border-l border-border p-0">
        {items.map((item) => {
          const actual = item.id === activo;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={actual ? "location" : undefined}
                className={`-ml-px block border-l-2 py-1 leading-snug no-underline transition-colors ${
                  item.nivel === 3 ? "pl-6" : "pl-3"
                } ${
                  actual
                    ? "border-accent font-semibold text-accent"
                    : "border-transparent text-text-muted hover:border-border-strong hover:text-text"
                }`}
              >
                {item.texto}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
