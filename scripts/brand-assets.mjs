import { copyFileSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const RAIZ = resolve(fileURLToPath(new URL("..", import.meta.url)));
const ESCUDO = join(RAIZ, "src", "assets", "brand", "escudo-unal.svg");
const PUBLICO = join(RAIZ, "public");

const COLOR_ACENTO = "#7a1f2b";
const COLOR_TEXTO = "#1a1a1a";
const COLOR_SUAVE = "#4a4a4a";
const COLOR_SUPERFICIE = "#f7f7f5";
const COLOR_SECUNDARIO = "#4c6b3c";

function plantillaOg(escudoBase64) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${COLOR_SUPERFICIE}"/>
  <rect x="0" y="0" width="1200" height="12" fill="${COLOR_ACENTO}"/>
  <rect x="72" y="96" width="1056" height="438" rx="24" fill="#ffffff" stroke="#e3e3df" stroke-width="2"/>
  <image href="data:image/svg+xml;base64,${escudoBase64}" x="120" y="195" width="240" height="240"/>
  <text x="408" y="250" font-family="'Segoe UI', Helvetica, Arial, sans-serif" font-size="30" font-weight="600" fill="${COLOR_SECUNDARIO}">Facultad de Ciencias Agropecuarias</text>
  <text x="408" y="320" font-family="'Segoe UI', Helvetica, Arial, sans-serif" font-size="58" font-weight="700" fill="${COLOR_TEXTO}">Laboratorio de</text>
  <text x="408" y="388" font-family="'Segoe UI', Helvetica, Arial, sans-serif" font-size="58" font-weight="700" fill="${COLOR_TEXTO}">Nutrición Animal</text>
  <text x="408" y="446" font-family="'Segoe UI', Helvetica, Arial, sans-serif" font-size="28" fill="${COLOR_SUAVE}">Universidad Nacional de Colombia · Sede Palmira</text>
  <text x="120" y="586" font-family="'Segoe UI', Helvetica, Arial, sans-serif" font-size="24" fill="${COLOR_SUAVE}">labnutripalmira.netlify.app</text>
</svg>`;
}

async function generar() {
  const escudo = readFileSync(ESCUDO);

  copyFileSync(ESCUDO, join(PUBLICO, "favicon.svg"));

  await sharp(escudo, { density: 300 })
    .resize(152, 152)
    .extend({ top: 14, bottom: 14, left: 14, right: 14, background: "#ffffff" })
    .flatten({ background: "#ffffff" })
    .png({ compressionLevel: 9 })
    .toFile(join(PUBLICO, "apple-touch-icon.png"));

  await sharp(Buffer.from(plantillaOg(escudo.toString("base64"))), { density: 72 })
    .resize(1200, 630)
    .png({ compressionLevel: 9, palette: true, quality: 90 })
    .toFile(join(PUBLICO, "og-default.png"));
}

generar()
  .then(() => console.log("[marca] favicon.svg, apple-touch-icon.png y og-default.png generados en public/"))
  .catch((error) => {
    console.error(`[marca] Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  });
