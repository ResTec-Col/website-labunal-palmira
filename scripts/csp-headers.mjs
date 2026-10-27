import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIRECTORIO_BUILD = join(RAIZ, "build", "client");

const DIRECTIVAS_BASE = [
  ["default-src", "'self'"],
  ["script-src", "'self' 'wasm-unsafe-eval'"],
  ["style-src", "'self' 'unsafe-inline'"],
  ["img-src", "'self' data:"],
  ["font-src", "'self'"],
  ["connect-src", "'self'"],
  ["frame-ancestors", "'none'"],
  ["base-uri", "'self'"],
  ["form-action", "'self'"],
  ["object-src", "'none'"],
  ["upgrade-insecure-requests", ""],
];

export function listarHtml(directorio) {
  const encontrados = [];
  for (const entrada of readdirSync(directorio)) {
    const ruta = join(directorio, entrada);
    const info = statSync(ruta);
    if (info.isDirectory()) encontrados.push(...listarHtml(ruta));
    else if (entrada.endsWith(".html")) encontrados.push(ruta);
  }
  return encontrados;
}

const TIPOS_EJECUTABLES = new Set(["", "module", "text/javascript", "application/javascript"]);

function esEjecutable(atributos) {
  const tipo = /\btype\s*=\s*["']?([^"'\s>]+)/i.exec(atributos);
  return TIPOS_EJECUTABLES.has((tipo?.[1] ?? "").toLowerCase());
}

export function extraerScriptsInline(html) {
  const scripts = [];
  const patron = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
  for (const coincidencia of html.matchAll(patron)) {
    const atributos = coincidencia[1] ?? "";
    const contenido = coincidencia[2] ?? "";
    if (/\bsrc\s*=/i.test(atributos) || !esEjecutable(atributos)) continue;
    if (contenido.length === 0) continue;
    scripts.push(contenido);
  }
  return scripts;
}

export function hashScript(contenido) {
  return `'sha256-${createHash("sha256").update(contenido, "utf8").digest("base64")}'`;
}

export function construirCsp(hashes) {
  const ordenados = [...new Set(hashes)].sort();
  return DIRECTIVAS_BASE.map(([directiva, valor]) => {
    if (directiva === "script-src" && ordenados.length > 0) {
      return `${directiva} ${valor} ${ordenados.join(" ")}`;
    }
    return valor ? `${directiva} ${valor}` : directiva;
  }).join("; ");
}

export function construirHeaders(csp, existente = "") {
  const bloque = `/*\n  Content-Security-Policy: ${csp}\n`;
  const limpio = existente.trim();
  return limpio ? `${limpio}\n\n${bloque}` : bloque;
}

export function generarHeaders(directorio = DIRECTORIO_BUILD) {
  if (!existsSync(directorio)) {
    throw new Error(`No existe ${directorio}. Ejecuta primero "react-router build".`);
  }
  const archivos = listarHtml(directorio);
  if (archivos.length === 0) {
    throw new Error(`No se encontraron archivos HTML en ${directorio}.`);
  }
  const hashes = new Set();
  for (const archivo of archivos) {
    for (const script of extraerScriptsInline(readFileSync(archivo, "utf8"))) {
      hashes.add(hashScript(script));
    }
  }
  const csp = construirCsp([...hashes]);
  const rutaHeaders = join(directorio, "_headers");
  const existente = existsSync(rutaHeaders) ? readFileSync(rutaHeaders, "utf8") : "";
  const sinCspPrevia = existente.replace(/\/\*\n {2}Content-Security-Policy: [^\n]*\n?/g, "");
  writeFileSync(rutaHeaders, construirHeaders(csp, sinCspPrevia), "utf8");
  return { archivos: archivos.length, hashes: hashes.size, rutaHeaders };
}

const esPrincipal = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (esPrincipal) {
  try {
    const resultado = generarHeaders();
    console.log(
      `[csp] ${resultado.archivos} HTML analizados, ${resultado.hashes} hashes de scripts inline escritos en ${resultado.rutaHeaders}`,
    );
  } catch (error) {
    console.error(`[csp] Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}
