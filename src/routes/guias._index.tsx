import { Link } from "react-router";
import { ArrowRight, BookOpen, Clock, FileText, ListOrdered } from "lucide-react";
import { Seo } from "../components/Seo";
import { Breadcrumbs } from "../components/layout/Breadcrumbs";
import { guias } from "../content/guias";
import { jsonLdMigas, type Miga } from "../lib/seo";

const DESCRIPCION =
  "Guías del Laboratorio de Nutrición Animal de la UNAL Palmira: protocolos de análisis de alimentos y forrajes y composición química, con fórmulas y anexos.";

const MIGAS: Miga[] = [
  { nombre: "Inicio", ruta: "/" },
  { nombre: "Guías", ruta: "/guias/" },
];

export default function IndiceGuias() {
  return (
    <div className="contenedor py-10">
      <Seo title="Guías de laboratorio" description={DESCRIPCION} path="/guias/" jsonLd={jsonLdMigas(MIGAS)} />
      <Breadcrumbs migas={MIGAS} />
      <h1 className="m-0 text-3xl md:text-4xl">Guías de laboratorio</h1>
      <p className="mt-3 mb-0 max-w-[65ch] text-lg text-text-muted">
        Protocolos y textos docentes del laboratorio, organizados por capítulos. Cada capítulo se puede
        imprimir o guardar como PDF desde el navegador.
      </p>

      {guias.length === 0 ? (
        <p className="tarjeta mt-8 text-text-muted">Las guías se están preparando. Vuelve pronto.</p>
      ) : (
        <ul className="m-0 mt-8 grid list-none gap-6 p-0 md:grid-cols-2">
          {guias.map((guia) => (
            <li key={guia.slug}>
              <article className="tarjeta flex h-full flex-col gap-4">
                <div className="flex items-start gap-3">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent">
                    <BookOpen aria-hidden="true" className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="m-0 text-xl">
                      <Link to={`/guias/${guia.slug}/`} className="text-text no-underline hover:text-accent hover:underline">
                        {guia.titulo}
                      </Link>
                    </h2>
                    <p className="m-0 mt-1 text-text-muted">{guia.subtitulo}</p>
                  </div>
                </div>
                <p className="m-0 text-text-muted">{guia.descripcion}</p>
                {guia.autores.length > 0 ? (
                  <p className="m-0 text-sm text-text-subtle">
                    <span className="font-semibold text-text-muted">
                      {guia.autores.length === 1 ? "Autoría: " : "Autores: "}
                    </span>
                    {guia.autores.map((autor) => autor.nombre).join(", ")}
                  </p>
                ) : null}
                <ul className="m-0 flex list-none flex-wrap gap-2 p-0 text-sm">
                  <li className="etiqueta">
                    <ListOrdered aria-hidden="true" className="size-3.5" />
                    {guia.capitulos.length} capítulos
                  </li>
                  <li className="etiqueta">
                    <Clock aria-hidden="true" className="size-3.5" />
                    {guia.tiempoLecturaMin} min de lectura
                  </li>
                </ul>
                <div className="mt-auto flex flex-wrap gap-3 pt-2">
                  <Link to={`/guias/${guia.slug}/`} className="boton boton-primario">
                    Leer la guía
                    <ArrowRight aria-hidden="true" className="size-4" />
                    <span className="sr-only">: {guia.titulo}</span>
                  </Link>
                  {guia.pdf ? (
                    <a href={guia.pdf} className="boton boton-secundario" download>
                      <FileText aria-hidden="true" className="size-4" />
                      PDF original
                      <span className="sr-only">: {guia.titulo}</span>
                    </a>
                  ) : null}
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
