import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Config } from "@react-router/dev/config";

const RUTAS_ESTATICAS = ["/", "/guias", "/plantillas", "/app", "/acerca", "/404"];

const INDICE_GUIAS = fileURLToPath(new URL("./src/content/guias/index.ts", import.meta.url));

async function rutasDeGuias(): Promise<string[]> {
  if (!existsSync(INDICE_GUIAS)) {
    console.warn("[prerender] No existe src/content/guias/index.ts: se omiten las rutas de las guías.");
    return [];
  }
  const modulo = (await import("./src/content/guias/index")) as { rutasPrerender?: () => string[] };
  if (typeof modulo.rutasPrerender !== "function") {
    throw new Error("src/content/guias/index.ts debe exportar rutasPrerender()");
  }
  return modulo.rutasPrerender();
}

function sinBarraFinal(ruta: string): string {
  const limpia = ruta.trim();
  let resultado = limpia;
  while (resultado.length > 1 && resultado.endsWith("/")) resultado = resultado.slice(0, -1);
  return resultado;
}

export default {
  appDirectory: "src",
  ssr: false,
  async prerender() {
    const guias = await rutasDeGuias();
    return [...new Set([...RUTAS_ESTATICAS, ...guias].map(sinBarraFinal))];
  },
} satisfies Config;
