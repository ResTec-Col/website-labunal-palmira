import { use } from "react";
import katexCss from "katex/dist/katex.min.css?url";
import type { Route } from "./+types/guia.capitulo";
import { Seo } from "../components/Seo";
import { DocLayout, getCapitulo, type Capitulo } from "../content/guias";
import { cargarModulo, moduloCargado, precargarCapitulo } from "../lib/capitulos";
import { jsonLdArticulo, jsonLdMigas, type Miga } from "../lib/seo";
import { ContenidoNoEncontrado } from "../components/ContenidoNoEncontrado";

export const links: Route.LinksFunction = () => [{ rel: "stylesheet", href: katexCss }];

export async function loader({ params }: Route.LoaderArgs) {
  await precargarCapitulo(params.guia, params.capitulo);
  return null;
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  await precargarCapitulo(params.guia, params.capitulo);
  return null;
}

function ContenidoCapitulo({ guia, capitulo }: { guia: string; capitulo: Capitulo }) {
  const modulo = moduloCargado(guia, capitulo.slug) ?? use(cargarModulo(guia, capitulo));
  return <modulo.default />;
}

export default function PaginaCapitulo({ params }: Route.ComponentProps) {
  const resultado = getCapitulo(params.guia, params.capitulo);
  if (!resultado) return <ContenidoNoEncontrado />;

  const { guia, capitulo, prev, next } = resultado;
  const rutaGuia = `/guias/${guia.slug}/`;
  const ruta = `${rutaGuia}${capitulo.slug}/`;
  const toc = moduloCargado(guia.slug, capitulo.slug)?.toc;
  const migas: Miga[] = [
    { nombre: "Inicio", ruta: "/" },
    { nombre: "Guías", ruta: "/guias/" },
    { nombre: guia.titulo, ruta: rutaGuia },
    { nombre: capitulo.titulo, ruta },
  ];

  return (
    <>
      <Seo
        title={`${capitulo.titulo} – ${guia.titulo}`}
        description={capitulo.descripcion}
        path={ruta}
        type="article"
        jsonLd={[
          jsonLdArticulo({
            titulo: capitulo.titulo,
            descripcion: capitulo.descripcion,
            ruta,
            autores: guia.autores,
            guia: { titulo: guia.titulo, ruta: rutaGuia },
          }),
          jsonLdMigas(migas),
        ]}
      />
      <DocLayout guia={guia} capitulo={capitulo} prev={prev} next={next} toc={toc}>
        <ContenidoCapitulo guia={guia.slug} capitulo={capitulo} />
      </DocLayout>
    </>
  );
}
