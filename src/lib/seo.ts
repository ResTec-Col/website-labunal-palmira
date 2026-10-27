import { ENLACES, SITIO } from "./sitio";

export interface Miga {
  nombre: string;
  ruta: string;
}

export type JsonLd = Record<string, unknown>;

export function normalizarRuta(ruta: string): string {
  try {
    const limpia = (ruta || "/").split(/[?#]/)[0].trim();
    const conInicio = limpia.startsWith("/") ? limpia : `/${limpia}`;
    const sinDobles = conInicio.replace(/\/{2,}/g, "/");
    if (sinDobles === "/" || /\.[a-z0-9]+$/i.test(sinDobles)) return sinDobles;
    return sinDobles.endsWith("/") ? sinDobles : `${sinDobles}/`;
  } catch {
    return "/";
  }
}

export function urlAbsoluta(ruta: string): string {
  try {
    if (/^https?:\/\//i.test(ruta)) return ruta;
    return new URL(ruta.startsWith("/") ? ruta : `/${ruta}`, SITIO.url).toString();
  } catch {
    return SITIO.url;
  }
}

export function urlCanonica(ruta: string): string {
  return urlAbsoluta(normalizarRuta(ruta));
}

export function tituloPagina(titulo?: string): string {
  const limpio = titulo?.trim();
  return limpio ? `${limpio} · ${SITIO.nombre}` : SITIO.nombre;
}

const SEPARADORES = new RegExp(`[${String.fromCharCode(0x2028)}${String.fromCharCode(0x2029)}]`, "g");

export function serializarJsonLd(datos: JsonLd | JsonLd[]): string {
  try {
    return JSON.stringify(datos)
      .replace(/</g, "\\u003c")
      .replace(/>/g, "\\u003e")
      .replace(/&/g, "\\u0026")
      .replace(SEPARADORES, (caracter) => `\\u${caracter.charCodeAt(0).toString(16)}`);
  } catch {
    return "{}";
  }
}

export function jsonLdOrganizacion(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: SITIO.nombreCorto,
    alternateName: SITIO.nombre,
    url: `${SITIO.url}/`,
    logo: urlAbsoluta("/apple-touch-icon.png"),
    image: urlAbsoluta(SITIO.imagen),
    description: SITIO.descripcion,
    parentOrganization: {
      "@type": "CollegeOrUniversity",
      name: "Universidad Nacional de Colombia",
      url: ENLACES.unal,
      department: {
        "@type": "Organization",
        name: "Universidad Nacional de Colombia, Sede Palmira",
        url: ENLACES.unalPalmira,
      },
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Palmira",
      addressRegion: "Valle del Cauca",
      addressCountry: "CO",
    },
  };
}

export function jsonLdMigas(migas: Miga[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: migas.map((miga, indice) => ({
      "@type": "ListItem",
      position: indice + 1,
      name: miga.nombre,
      item: urlCanonica(miga.ruta),
    })),
  };
}

export interface DatosArticulo {
  titulo: string;
  descripcion: string;
  ruta: string;
  autores: { nombre: string; cargo?: string }[];
  guia?: { titulo: string; ruta: string };
}

export function jsonLdArticulo(datos: DatosArticulo): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": ["TechArticle", "LearningResource"],
    headline: datos.titulo,
    name: datos.titulo,
    description: datos.descripcion,
    url: urlCanonica(datos.ruta),
    mainEntityOfPage: urlCanonica(datos.ruta),
    inLanguage: "es",
    learningResourceType: "Guía de laboratorio",
    educationalLevel: "Educación superior",
    image: urlAbsoluta(SITIO.imagen),
    author: datos.autores.map((autor) => ({
      "@type": "Person",
      name: autor.nombre,
      ...(autor.cargo ? { jobTitle: autor.cargo } : {}),
    })),
    publisher: {
      "@type": "EducationalOrganization",
      name: SITIO.nombreCorto,
      url: `${SITIO.url}/`,
    },
    ...(datos.guia
      ? { isPartOf: { "@type": "Book", name: datos.guia.titulo, url: urlCanonica(datos.guia.ruta) } }
      : {}),
  };
}

export function recortarDescripcion(texto: string, maximo = 160): string {
  try {
    const limpio = texto.replace(/\s+/g, " ").trim();
    if (limpio.length <= maximo) return limpio;
    const corte = limpio.slice(0, maximo - 1);
    const ultimoEspacio = corte.lastIndexOf(" ");
    return `${(ultimoEspacio > 100 ? corte.slice(0, ultimoEspacio) : corte).replace(/[\s,.;:]+$/, "")}…`;
  } catch {
    return SITIO.descripcion;
  }
}
