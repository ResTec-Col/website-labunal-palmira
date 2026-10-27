#!/usr/bin/env node
/**
 * Optimiza las imágenes de las guías con sharp.
 *
 * Lee las imágenes originales de `website/guias/img` (o de `--fuente <dir>`) y genera, en
 * `src/content/guias/<guia>/img/`, versiones WebP de 480 px (si el original supera 640 px) y del
 * ancho original limitado a 1000 px, sin ampliar. No se genera JPG de respaldo: WebP tiene soporte
 * universal en los navegadores vigentes y así el total queda por debajo de 600 KB. Escribe además
 * `src/content/guias/<guia>/imagenes.ts`, que importa los archivos (Vite les añade hash) y expone
 * ancho, alto y fuentes para el `srcset` del componente <Figure>. La imagen de la Tabla 10 se
 * conserva como respaldo enlazado en `public/docs/composicion-quimica-tabla-10.png`.
 *
 * Es idempotente: solo reescribe los archivos cuyo contenido cambia y elimina los sobrantes.
 * Cuando las imágenes originales ya no existen, informa y termina sin error.
 */
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ARGS = process.argv.slice(2);
const FUENTE = (() => {
  const i = ARGS.indexOf("--fuente");
  return i >= 0 && ARGS[i + 1] ? path.resolve(ARGS[i + 1]) : path.join(RAIZ, "website", "guias", "img");
})();
const DESTINO = path.join(RAIZ, "src", "content", "guias");
const ANCHO_MAXIMO = 1000;
const ANCHO_REDUCIDO = 480;
const UMBRAL_REDUCIDO = 640;
const CALIDAD_WEBP = 68;
const PRESUPUESTO_BYTES = 600 * 1024;

const GUIAS = [
  {
    slug: "analisis-alimentos-y-forrajes",
    imagenes: [
      "exactitud-precision.jpg",
      "error-absoluto.jpg",
      "principio-liofilizacion.jpg",
      "aparato-extraccion.jpg",
      "calorimetro.jpg",
    ],
  },
  {
    slug: "composicion-quimica",
    imagenes: [
      "Forrajes.png",
      "procedimiento_ms.jpg",
      "fig2-molienda-forraje.jpg",
      "fig3-preparacion-crisoles.jpg",
      "fig4-ms-analitica.jpg",
      "fig5-preparacion-crisoles-cenizas.jpg",
      "fig6-determinacion-cenizas.jpg",
      "fig7-metodo-soxhlet.jpg",
      "fig8-partes-extractor-soxhlet.jpg",
      "fig9-peso-balones-muestra.jpg",
      "fig10-peso-balon-extracto-etereo.jpg",
      "fig11-pesaje-muestra-nitrogeno.jpg",
      "fig12-preparacion-muestra-digestion.jpg",
      "fig13-digestion-campana-extraccion.jpg",
      "fig14-preparacion-proceso-destilacion.jpg",
      "fig15-titulacion-acido-sulfurico.jpg",
      "fig16-fibra-detergente-neutra.jpg",
      "fig17-fibra-detergente-acida.jpg",
      "fig18-lignina-detergente-acida.jpg",
      "fig19-cenizas-minerales.jpg",
    ],
  },
];

const TABLA_10 = {
  origen: "tabla_10.png",
  destino: path.join(RAIZ, "public", "docs", "composicion-quimica-tabla-10.png"),
};

/** Escribe un mensaje de error en español y termina el proceso. */
function abortar(mensaje, error) {
  console.error(`optimize-images: ${mensaje}`);
  if (error) console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

/** Carga sharp con un mensaje claro si la dependencia no está instalada. */
async function cargarSharp() {
  try {
    const modulo = await import("sharp");
    return modulo.default;
  } catch (error) {
    abortar("no se pudo cargar sharp. Ejecuta `npm ci` antes de optimizar las imágenes.", error);
    return null;
  }
}

/** Normaliza la clave de una imagen a partir de su nombre de archivo. */
function claveImagen(archivo) {
  return path.parse(archivo).name.toLowerCase().replace(/_/g, "-");
}

/** Convierte una clave en un identificador válido de JavaScript. */
function identificador(clave, sufijo) {
  const base = clave.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase()).replace(/[^A-Za-z0-9]/g, "");
  return `${base}${sufijo}`;
}

/** Escribe un archivo solo si su contenido cambió; devuelve true si hubo cambio. */
async function escribirSiCambia(ruta, contenido) {
  const nuevo = Buffer.isBuffer(contenido) ? contenido : Buffer.from(contenido, "utf8");
  if (existsSync(ruta)) {
    const actual = await readFile(ruta);
    if (actual.equals(nuevo)) return false;
  }
  await mkdir(path.dirname(ruta), { recursive: true });
  await writeFile(ruta, nuevo);
  return true;
}

/** Genera las variantes WebP de una imagen y devuelve sus metadatos. */
async function procesarImagen(sharp, archivo, carpeta) {
  const origen = path.join(FUENTE, archivo);
  if (!existsSync(origen)) throw new Error(`No existe la imagen original ${archivo}`);
  const clave = claveImagen(archivo);
  const meta = await sharp(origen).metadata();
  if (!meta.width || !meta.height) throw new Error(`No se pudieron leer las dimensiones de ${archivo}`);
  const maximo = Math.min(meta.width, ANCHO_MAXIMO);
  const anchos = maximo > UMBRAL_REDUCIDO ? [ANCHO_REDUCIDO, maximo] : [maximo];
  const alto = Math.round((meta.height * maximo) / meta.width);
  const salidas = [];
  for (const ancho of anchos) {
    const buffer = await sharp(origen)
      .rotate()
      .flatten({ background: "#ffffff" })
      .resize({ width: ancho, withoutEnlargement: true })
      .webp({ quality: CALIDAD_WEBP, effort: 6 })
      .toBuffer();
    salidas.push({ nombre: `${clave}-${ancho}.webp`, buffer, ancho });
  }
  const cambios = [];
  for (const salida of salidas) {
    if (await escribirSiCambia(path.join(carpeta, salida.nombre), salida.buffer)) cambios.push(salida.nombre);
  }
  return { clave, ancho: maximo, alto, salidas, cambios };
}

/** Construye el módulo `imagenes.ts` que importa las variantes generadas. */
function construirModulo(registros) {
  const importaciones = [];
  const entradas = [];
  for (const registro of registros) {
    let principal = "";
    const fuentes = registro.salidas.map((s) => {
      const id = identificador(registro.clave, `W${s.ancho}`);
      importaciones.push(`import ${id} from "./img/${s.nombre}";`);
      if (s.ancho === registro.ancho) principal = id;
      return `{ ancho: ${s.ancho}, url: ${id} }`;
    });
    entradas.push(
      [
        `  ${JSON.stringify(registro.clave)}: {`,
        `    ancho: ${registro.ancho},`,
        `    alto: ${registro.alto},`,
        `    fuentes: [${fuentes.join(", ")}],`,
        `    src: ${principal},`,
        "  },",
      ].join("\n"),
    );
  }
  return [
    'import type { ImagenGuia } from "../../../components/docs/tipos";',
    ...importaciones,
    "",
    "/** Imágenes optimizadas de la guía, generadas por scripts/optimize-images.mjs. */",
    "export const imagenes: Record<string, ImagenGuia> = {",
    ...entradas,
    "};",
    "",
  ].join("\n");
}

/** Elimina de la carpeta de imágenes los archivos que ya no se generan. */
async function limpiarSobrantes(carpeta, vigentes) {
  const eliminados = [];
  for (const nombre of await readdir(carpeta)) {
    if (!vigentes.has(nombre)) {
      await unlink(path.join(carpeta, nombre));
      eliminados.push(nombre);
    }
  }
  return eliminados;
}

/** Punto de entrada. */
async function principal() {
  if (!existsSync(FUENTE)) {
    console.log(
      `optimize-images: no se encontraron las imágenes originales en ${path.relative(RAIZ, FUENTE) || FUENTE}. ` +
        "Las imágenes optimizadas de src/content/guias son la fuente de verdad; no hay nada que hacer.",
    );
    return;
  }
  const sharp = await cargarSharp();
  let totalBytes = 0;
  let cambios = 0;
  for (const guia of GUIAS) {
    const carpeta = path.join(DESTINO, guia.slug, "img");
    await mkdir(carpeta, { recursive: true });
    const registros = [];
    for (const archivo of guia.imagenes) {
      const registro = await procesarImagen(sharp, archivo, carpeta);
      registros.push(registro);
      cambios += registro.cambios.length;
      for (const nombre of registro.cambios) {
        console.log(`escrito: ${path.relative(RAIZ, path.join(carpeta, nombre))}`);
      }
    }
    const vigentes = new Set(registros.flatMap((r) => r.salidas.map((s) => s.nombre)));
    for (const nombre of await limpiarSobrantes(carpeta, vigentes)) {
      cambios++;
      console.log(`eliminado: ${path.relative(RAIZ, path.join(carpeta, nombre))}`);
    }
    const modulo = path.join(DESTINO, guia.slug, "imagenes.ts");
    if (await escribirSiCambia(modulo, construirModulo(registros))) {
      cambios++;
      console.log(`escrito: ${path.relative(RAIZ, modulo)}`);
    }
    const bytes = registros.flatMap((r) => r.salidas).reduce((n, s) => n + s.buffer.length, 0);
    totalBytes += bytes;
    console.log(`${guia.slug}: ${registros.length} imágenes, ${(bytes / 1024).toFixed(1)} KB.`);
  }
  const tabla = await sharp(path.join(FUENTE, TABLA_10.origen))
    .png({ palette: true, quality: 80, compressionLevel: 9, effort: 10 })
    .toBuffer();
  if (await escribirSiCambia(TABLA_10.destino, tabla)) {
    cambios++;
    console.log(`escrito: ${path.relative(RAIZ, TABLA_10.destino)}`);
  }
  console.log(`Total de imágenes de las guías: ${(totalBytes / 1024).toFixed(1)} KB (presupuesto 600 KB).`);
  if (totalBytes > PRESUPUESTO_BYTES) abortar("las imágenes de las guías superan el presupuesto de 600 KB.");
  console.log(cambios === 0 ? "Sin cambios: las imágenes ya estaban optimizadas." : `${cambios} archivo(s) actualizados.`);
}

principal().catch((error) => abortar("la optimización falló.", error));
