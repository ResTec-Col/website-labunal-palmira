export interface SubResultadoPagefind {
  title: string;
  url: string;
  excerpt: string;
}

export interface DatosResultadoPagefind {
  url: string;
  excerpt: string;
  meta: { title?: string; [clave: string]: string | undefined };
  sub_results?: SubResultadoPagefind[];
}

export interface ResultadoPagefind {
  id: string;
  data: () => Promise<DatosResultadoPagefind>;
}

export interface Pagefind {
  init?: () => Promise<void>;
  options?: (opciones: Record<string, unknown>) => Promise<void>;
  search: (consulta: string) => Promise<{ results: ResultadoPagefind[] } | null>;
  debouncedSearch?: (
    consulta: string,
    opciones?: Record<string, unknown>,
    esperaMs?: number,
  ) => Promise<{ results: ResultadoPagefind[] } | null>;
}

export interface Fragmento {
  texto: string;
  resaltado: boolean;
}

export interface ResultadoBusqueda {
  url: string;
  titulo: string;
  fragmentos: Fragmento[];
}

const RUTA_PAGEFIND = "/pagefind/pagefind.js";

let promesaPagefind: Promise<Pagefind> | null = null;

export function cargarPagefind(): Promise<Pagefind> {
  if (!promesaPagefind) {
    promesaPagefind = import(/* @vite-ignore */ RUTA_PAGEFIND)
      .then(async (modulo: Pagefind) => {
        await modulo.options?.({ excerptLength: 24 });
        await modulo.init?.();
        return modulo;
      })
      .catch((error: unknown) => {
        promesaPagefind = null;
        throw error instanceof Error ? error : new Error("No se pudo cargar el índice de búsqueda");
      });
  }
  return promesaPagefind;
}

const ENTIDADES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&#x27;": "'",
  "&nbsp;": " ",
};

export function decodificarEntidades(texto: string): string {
  try {
    return texto
      .replace(/&(?:amp|lt|gt|quot|nbsp|#39|#x27);/g, (entidad) => ENTIDADES[entidad] ?? entidad)
      .replace(/&#(\d+);/g, (_, codigo: string) => String.fromCodePoint(Number(codigo)))
      .replace(/&#x([0-9a-f]+);/gi, (_, codigo: string) => String.fromCodePoint(parseInt(codigo, 16)));
  } catch {
    return texto;
  }
}

export function fragmentosExtracto(extracto: string): Fragmento[] {
  try {
    const fragmentos: Fragmento[] = [];
    const patron = /<mark>([\s\S]*?)<\/mark>/g;
    let ultimo = 0;
    for (const coincidencia of extracto.matchAll(patron)) {
      const inicio = coincidencia.index ?? 0;
      if (inicio > ultimo) {
        fragmentos.push({ texto: limpiarEtiquetas(extracto.slice(ultimo, inicio)), resaltado: false });
      }
      fragmentos.push({ texto: limpiarEtiquetas(coincidencia[1]), resaltado: true });
      ultimo = inicio + coincidencia[0].length;
    }
    if (ultimo < extracto.length) {
      fragmentos.push({ texto: limpiarEtiquetas(extracto.slice(ultimo)), resaltado: false });
    }
    return fragmentos.filter((fragmento) => fragmento.texto.length > 0);
  } catch {
    return [{ texto: limpiarEtiquetas(extracto), resaltado: false }];
  }
}

function limpiarEtiquetas(texto: string): string {
  return decodificarEntidades(texto.replace(/<[^>]*>/g, ""));
}

export function rutaInterna(url: string): string {
  try {
    const destino = new URL(url, "https://labnutripalmira.netlify.app");
    return `${destino.pathname}${destino.hash}`;
  } catch {
    return "/";
  }
}

export async function buscar(pagefind: Pagefind, consulta: string, limite = 8): Promise<ResultadoBusqueda[]> {
  const termino = consulta.trim();
  if (!termino) return [];
  const respuesta = await pagefind.search(termino);
  if (!respuesta) return [];
  const datos = await Promise.all(respuesta.results.slice(0, limite).map((resultado) => resultado.data()));
  return datos.map((dato) => ({
    url: rutaInterna(dato.url),
    titulo: dato.meta.title ?? dato.url,
    fragmentos: fragmentosExtracto(dato.excerpt),
  }));
}
