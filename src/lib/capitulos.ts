import { getCapitulo, type Capitulo } from "../content/guias";

export type ModuloCapitulo = Awaited<ReturnType<Capitulo["load"]>>;

const promesas = new Map<string, Promise<ModuloCapitulo>>();
const cargados = new Map<string, ModuloCapitulo>();

function claveDe(guia: string, capitulo: string): string {
  return `${guia}/${capitulo}`;
}

export function moduloCargado(guia: string, capitulo: string): ModuloCapitulo | undefined {
  return cargados.get(claveDe(guia, capitulo));
}

export function cargarModulo(guia: string, capitulo: Capitulo): Promise<ModuloCapitulo> {
  const clave = claveDe(guia, capitulo.slug);
  let promesa = promesas.get(clave);
  if (!promesa) {
    promesa = capitulo
      .load()
      .then((modulo) => {
        cargados.set(clave, modulo);
        return modulo;
      })
      .catch((error: unknown) => {
        promesas.delete(clave);
        throw error;
      });
    promesas.set(clave, promesa);
  }
  return promesa;
}

export async function precargarCapitulo(guia: string, capitulo: string): Promise<ModuloCapitulo | null> {
  const resultado = getCapitulo(guia, capitulo);
  if (!resultado) return null;
  return cargarModulo(resultado.guia.slug, resultado.capitulo);
}

const PATRON_CAPITULO = /^\/guias\/([^/]+)\/([^/]+)\/?$/;

export async function precargarDesdeRuta(ruta: string): Promise<void> {
  try {
    const coincidencia = PATRON_CAPITULO.exec(ruta);
    if (!coincidencia) return;
    await precargarCapitulo(decodeURIComponent(coincidencia[1]), decodeURIComponent(coincidencia[2]));
  } catch (error) {
    console.error("No se pudo precargar el capítulo", error);
  }
}
