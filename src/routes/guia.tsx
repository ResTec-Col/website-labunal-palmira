import { Link } from "react-router";
import { ArrowRight, Clock, FileText, ListOrdered } from "lucide-react";
import type { Route } from "./+types/guia";
import { Seo } from "../components/Seo";
import { Breadcrumbs } from "../components/layout/Breadcrumbs";
import { getGuia } from "../content/guias";
import { jsonLdArticulo, jsonLdMigas, type Miga } from "../lib/seo";
import { ContenidoNoEncontrado } from "../components/ContenidoNoEncontrado";

export default function PaginaGuia({ params }: Route.ComponentProps) {
  const guia = getGuia(params.guia);
  if (!guia) return <ContenidoNoEncontrado />;

  const ruta = `/guias/${guia.slug}/`;
  const capitulos = [...guia.capitulos].sort((a, b) => a.orden - b.orden);
  const primero = capitulos[0];
  const migas: Miga[] = [
    { nombre: "Inicio", ruta: "/" },
    { nombre: "Guías", ruta: "/guias/" },
    { nombre: guia.titulo, ruta },
  ];

  return (
    <div className="contenedor py-10">
      <Seo
        title={guia.titulo}
        description={guia.descripcion}
        path={ruta}
        type="article"
        jsonLd={[
          jsonLdArticulo({
            titulo: guia.titulo,
            descripcion: guia.descripcion,
            ruta,
            autores: guia.autores,
          }),
          jsonLdMigas(migas),
        ]}
      />
      <Breadcrumbs migas={migas} />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <h1 className="m-0 text-3xl md:text-4xl">{guia.titulo}</h1>
          <p className="mt-3 mb-0 text-lg text-text-muted">{guia.subtitulo}</p>
          <p className="mt-5 mb-0 max-w-[65ch] text-text-muted">{guia.descripcion}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            {primero ? (
              <Link to={`${ruta}${primero.slug}/`} className="boton boton-primario">
                Empezar a leer
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            ) : null}
            {guia.pdf ? (
              <a href={guia.pdf} className="boton boton-secundario" download>
                <FileText aria-hidden="true" className="size-4" />
                Descargar PDF original
              </a>
            ) : null}
          </div>

          <h2 className="mt-12 mb-0 text-2xl">Capítulos</h2>
          <ol className="m-0 mt-5 flex list-none flex-col gap-3 p-0">
            {capitulos.map((capitulo, indice) => (
              <li key={capitulo.slug}>
                <Link
                  to={`${ruta}${capitulo.slug}/`}
                  className="tarjeta tarjeta-enlace flex gap-4 p-4"
                  prefetch="intent"
                >
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-sm font-semibold text-text-muted tabular-nums">
                    {indice + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold text-text">{capitulo.titulo}</span>
                    <span className="mt-1 block text-sm text-text-muted">{capitulo.descripcion}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>

        <aside aria-label="Datos de la guía" className="flex flex-col gap-4 self-start lg:sticky lg:top-[calc(var(--header-h)+24px)]">
          <div className="tarjeta">
            <h2 className="m-0 text-base">Autoría</h2>
            <ul className="m-0 mt-3 flex list-none flex-col gap-3 p-0">
              {guia.autores.map((autor) => (
                <li key={autor.nombre}>
                  <span className="block font-semibold">{autor.nombre}</span>
                  <span className="block text-sm text-text-muted">{autor.cargo}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="tarjeta flex flex-wrap gap-2">
            <span className="etiqueta">
              <ListOrdered aria-hidden="true" className="size-3.5" />
              {capitulos.length} capítulos
            </span>
            <span className="etiqueta">
              <Clock aria-hidden="true" className="size-3.5" />
              {guia.tiempoLecturaMin} min de lectura
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}
