import { Suspense, use, type ReactNode } from "react";
import { Link } from "react-router";
import { FileText, ListTree, Printer } from "lucide-react";
import { Breadcrumbs } from "../layout/Breadcrumbs";
import type { Miga } from "../../lib/seo";
import { rutaGuia } from "../../content/guias/rutas";
import type { Capitulo, Guia, TocItem } from "../../content/guias/tipos";
import { Authors } from "./Authors";
import { ProveedorMdx } from "./MDXProvider";
import { PrevNext } from "./PrevNext";
import { Toc } from "./Toc";

export interface DocLayoutProps {
  guia: Guia;
  capitulo: Capitulo;
  prev?: Capitulo;
  next?: Capitulo;
  toc?: TocItem[];
  children?: ReactNode;
}

const promesasToc = new Map<string, Promise<TocItem[]>>();

/** Devuelve (y memoriza) la promesa con la tabla de contenido que exporta el MDX del capítulo. */
function cargarToc(guia: Guia, capitulo: Capitulo): Promise<TocItem[]> {
  const clave = `${guia.slug}/${capitulo.slug}`;
  let promesa = promesasToc.get(clave);
  if (!promesa) {
    promesa = capitulo
      .load()
      .then((modulo) => (Array.isArray(modulo.toc) ? modulo.toc : []))
      .catch(() => []);
    promesasToc.set(clave, promesa);
  }
  return promesa;
}

/** Tabla de contenido que espera (con Suspense) al módulo MDX del capítulo. */
function TocDiferido({ guia, capitulo }: { guia: Guia; capitulo: Capitulo }) {
  const items = use(cargarToc(guia, capitulo));
  return <Toc items={items} />;
}

/** Botón que abre el diálogo de impresión del navegador. */
function BotonImprimir() {
  function imprimir() {
    try {
      window.print();
    } catch {
      return;
    }
  }
  return (
    <button type="button" onClick={imprimir} className="boton boton-secundario">
      <Printer aria-hidden="true" className="size-4" />
      Imprimir
    </button>
  );
}

/** Lista de capítulos de la guía con el capítulo actual marcado. */
function ListaCapitulos({ guia, actual }: { guia: Guia; actual: string }) {
  return (
    <nav aria-label={`Capítulos de ${guia.titulo}`} className="text-sm">
      <p className="m-0 mb-3 font-semibold text-text">Capítulos</p>
      <ol className="m-0 flex list-none flex-col gap-1 p-0">
        {guia.capitulos.map((c) => {
          const esActual = c.slug === actual;
          return (
            <li key={c.slug}>
              <Link
                to={rutaGuia(guia.slug, c.slug)}
                prefetch="intent"
                aria-current={esActual ? "page" : undefined}
                className={`flex gap-2 rounded-md px-2 py-1.5 leading-snug no-underline ${
                  esActual
                    ? "bg-accent-soft font-semibold text-accent"
                    : "text-text-muted hover:bg-surface-2 hover:text-text"
                }`}
              >
                <span className="w-5 shrink-0 text-right tabular-nums text-text-subtle">{c.orden}.</span>
                <span>{c.titulo}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Tabla de contenido: la recibida por props o la exportada por el módulo MDX del capítulo. */
function TablaContenido({ guia, capitulo, toc }: { guia: Guia; capitulo: Capitulo; toc?: TocItem[] }) {
  if (toc) return <Toc items={toc} />;
  return (
    <Suspense fallback={null}>
      <TocDiferido guia={guia} capitulo={capitulo} />
    </Suspense>
  );
}

/**
 * Diseño de un capítulo de guía: migas, encabezado con autoría, índice de capítulos, tabla de
 * contenido con scrollspy, contenido en tipografía de lectura, impresión y navegación entre
 * capítulos. Es el único responsable del `<h1>` de la página.
 */
export function DocLayout({ guia, capitulo, prev, next, toc, children }: DocLayoutProps) {
  const total = guia.capitulos.length;
  const migas: Miga[] = [
    { nombre: "Inicio", ruta: "/" },
    { nombre: "Guías", ruta: "/guias/" },
    { nombre: guia.titulo, ruta: rutaGuia(guia.slug) },
    { nombre: capitulo.titulo, ruta: rutaGuia(guia.slug, capitulo.slug) },
  ];

  return (
    <div className="contenedor py-8 md:py-10">
      <Breadcrumbs migas={migas} />
      <div className="grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[15rem_minmax(0,1fr)_14rem]">
        <aside aria-label="Navegación de la guía" className="no-imprimir hidden lg:block">
          <div className="sticky top-[calc(var(--header-h)+24px)] max-h-[calc(100dvh-var(--header-h)-48px)] overflow-y-auto pr-2">
            <ListaCapitulos guia={guia} actual={capitulo.slug} />
          </div>
        </aside>

        <article className="min-w-0" aria-labelledby="titulo-capitulo">
          <header className="mb-8">
            <p className="m-0 text-sm font-semibold">
              <Link to={rutaGuia(guia.slug)} className="no-underline hover:underline">
                {guia.titulo}
              </Link>
              <span className="font-normal text-text-subtle">
                {" "}
                · Capítulo {capitulo.orden} de {total}
              </span>
            </p>
            <h1 id="titulo-capitulo" className="m-0 mt-2 text-3xl md:text-4xl">
              {capitulo.titulo}
            </h1>
            <p className="mt-3 mb-4 max-w-[65ch] text-text-muted">{capitulo.descripcion}</p>
            <Authors autores={guia.autores} compacto />
            <div className="no-imprimir mt-5 flex flex-wrap gap-2">
              <BotonImprimir />
              {guia.pdf ? (
                <a href={guia.pdf} className="boton boton-secundario" download>
                  <FileText aria-hidden="true" className="size-4" />
                  PDF original
                </a>
              ) : null}
            </div>
          </header>

          <details className="no-imprimir tarjeta mb-8 p-4 xl:hidden">
            <summary className="flex cursor-pointer items-center gap-2 font-semibold">
              <ListTree aria-hidden="true" className="size-4" />
              Contenido del capítulo
            </summary>
            <div className="mt-4 flex flex-col gap-6">
              <TablaContenido guia={guia} capitulo={capitulo} toc={toc} />
              <div className="lg:hidden">
                <ListaCapitulos guia={guia} actual={capitulo.slug} />
              </div>
            </div>
          </details>

          <div className="prose">
            <ProveedorMdx>{children}</ProveedorMdx>
          </div>

          <PrevNext guia={guia} prev={prev} next={next} />
        </article>

        <aside aria-label="Contenido del capítulo" className="no-imprimir hidden xl:block">
          <div className="sticky top-[calc(var(--header-h)+24px)] max-h-[calc(100dvh-var(--header-h)-48px)] overflow-y-auto">
            <TablaContenido guia={guia} capitulo={capitulo} toc={toc} />
          </div>
        </aside>
      </div>
    </div>
  );
}
