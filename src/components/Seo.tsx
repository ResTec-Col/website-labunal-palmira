import { SITIO } from "../lib/sitio";
import {
  recortarDescripcion,
  serializarJsonLd,
  tituloPagina,
  urlAbsoluta,
  urlCanonica,
  type JsonLd,
} from "../lib/seo";

interface SeoProps {
  title?: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  jsonLd?: JsonLd | JsonLd[];
  noindex?: boolean;
}

export function Seo({ title, description, path, image, type = "website", jsonLd, noindex }: SeoProps) {
  const titulo = tituloPagina(title);
  const descripcion = recortarDescripcion(description);
  const canonica = urlCanonica(path);
  const imagen = urlAbsoluta(image ?? SITIO.imagen);
  const datos = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <>
      <title>{titulo}</title>
      <meta name="description" content={descripcion} />
      {noindex ? <meta name="robots" content="noindex, follow" /> : null}
      {noindex ? null : <link rel="canonical" href={canonica} />}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITIO.nombre} />
      <meta property="og:locale" content={SITIO.locale} />
      <meta property="og:title" content={titulo} />
      <meta property="og:description" content={descripcion} />
      <meta property="og:url" content={canonica} />
      <meta property="og:image" content={imagen} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={SITIO.nombre} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={titulo} />
      <meta name="twitter:description" content={descripcion} />
      <meta name="twitter:image" content={imagen} />
      {datos.map((dato, indice) => (
        <script
          key={indice}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializarJsonLd(dato) }}
        />
      ))}
    </>
  );
}
