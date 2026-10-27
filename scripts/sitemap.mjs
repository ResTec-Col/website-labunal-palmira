import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const URL_SITIO = "https://labnutripalmira.netlify.app";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIRECTORIO_BUILD = join(RAIZ, "build", "client");
const EXCLUIDAS = new Set(["/404/"]);

const FUENTES_FIJAS = {
  "/": "src/routes/home.tsx",
  "/guias/": "src/routes/guias._index.tsx",
  "/plantillas/": "src/routes/plantillas.tsx",
  "/app/": "src/routes/app.tsx",
  "/acerca/": "src/routes/acerca.tsx",
};

export function rutasDesdeHtml(directorio) {
  const rutas = [];
  const recorrer = (actual) => {
    for (const entrada of readdirSync(actual)) {
      const ruta = join(actual, entrada);
      if (statSync(ruta).isDirectory()) {
        if (entrada === "assets" || entrada === "pagefind") continue;
        recorrer(ruta);
      } else if (entrada === "index.html") {
        const relativa = relative(directorio, actual).split(sep).filter(Boolean).join("/");
        rutas.push(relativa ? `/${relativa}/` : "/");
      }
    }
  };
  recorrer(directorio);
  return rutas.filter((ruta) => !EXCLUIDAS.has(ruta)).sort(compararRutas);
}

function compararRutas(a, b) {
  const profundidad = (ruta) => ruta.split("/").filter(Boolean).length;
  return profundidad(a) - profundidad(b) || a.localeCompare(b, "es");
}

export function fuenteDeRuta(ruta, raiz = RAIZ) {
  if (FUENTES_FIJAS[ruta]) return FUENTES_FIJAS[ruta];
  const partes = ruta.split("/").filter(Boolean);
  if (partes[0] !== "guias" || partes.length < 2) return null;
  const carpeta = join(raiz, "src", "content", "guias", partes[1]);
  if (!existsSync(carpeta)) return null;
  if (partes.length === 2) {
    const meta = join(carpeta, "_meta.ts");
    return existsSync(meta) ? relative(raiz, meta).split(sep).join("/") : null;
  }
  const mdx = readdirSync(carpeta).find(
    (archivo) => archivo.endsWith(".mdx") && archivo.replace(/^\d+-/, "").replace(/\.mdx$/, "") === partes[2],
  );
  return mdx ? relative(raiz, join(carpeta, mdx)).split(sep).join("/") : null;
}

export function fechaGit(archivo, raiz = RAIZ) {
  if (!archivo) return null;
  try {
    const salida = execFileSync("git", ["log", "-1", "--format=%cI", "--", archivo], {
      cwd: raiz,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return salida || null;
  } catch {
    return null;
  }
}

function escaparXml(texto) {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function construirSitemap(entradas, urlSitio = URL_SITIO) {
  const urls = entradas
    .map(({ ruta, lastmod }) => {
      const loc = escaparXml(new URL(ruta, urlSitio).toString());
      const fecha = lastmod ? `\n    <lastmod>${escaparXml(lastmod)}</lastmod>` : "";
      return `  <url>\n    <loc>${loc}</loc>${fecha}\n  </url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function prepararPagina404(directorio = DIRECTORIO_BUILD) {
  const origen = join(directorio, "404", "index.html");
  const destino = join(directorio, "404.html");
  if (existsSync(origen)) {
    renameSync(origen, destino);
    rmSync(join(directorio, "404"), { recursive: true, force: true });
  }
  const respaldoSpa = join(directorio, "__spa-fallback.html");
  if (existsSync(respaldoSpa)) rmSync(respaldoSpa);
  return existsSync(destino);
}

export function generarSitemap(directorio = DIRECTORIO_BUILD) {
  if (!existsSync(directorio)) {
    throw new Error(`No existe ${directorio}. Ejecuta primero "react-router build".`);
  }
  const hay404 = prepararPagina404(directorio);
  const fechaBuild = new Date().toISOString();
  const entradas = rutasDesdeHtml(directorio).map((ruta) => ({
    ruta,
    lastmod: fechaGit(fuenteDeRuta(ruta)) ?? fechaBuild,
  }));
  if (entradas.length === 0) throw new Error("No se encontraron páginas prerenderizadas.");
  writeFileSync(join(directorio, "sitemap.xml"), construirSitemap(entradas), "utf8");
  return { paginas: entradas.length, hay404 };
}

const esPrincipal = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (esPrincipal) {
  try {
    const { paginas, hay404 } = generarSitemap();
    console.log(`[sitemap] ${paginas} URL escritas en build/client/sitemap.xml${hay404 ? " · 404.html listo" : ""}`);
    if (!hay404) console.warn("[sitemap] Advertencia: no se generó build/client/404.html");
  } catch (error) {
    console.error(`[sitemap] Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}
