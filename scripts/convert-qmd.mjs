#!/usr/bin/env node
/**
 * Migración de las guías Quarto (QMD) del sitio anterior a capítulos MDX.
 *
 * Lee `website/guias/*.qmd` (o la carpeta indicada con `--fuente <dir>`), aplica las
 * correcciones de contenido documentadas, divide cada guía en capítulos y escribe:
 *   - src/content/guias/<guia>/NN-<slug>.mdx  (frontmatter `titulo` y `descripcion`)
 *   - src/content/guias/<guia>/_meta.ts        (capítulos y tiempo de lectura)
 *
 * Es determinista e idempotente: solo reescribe los archivos cuyo contenido cambia.
 * Con `--comprobar` no escribe nada y termina con código 1 si la salida difiere de lo
 * que hay en disco. Cuando las fuentes QMD ya no existen (fueron retiradas del repo),
 * informa y termina sin error: desde entonces los MDX son la fuente de verdad.
 */
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ARGS = process.argv.slice(2);
const COMPROBAR = ARGS.includes("--comprobar");
const FUENTE = (() => {
  const i = ARGS.indexOf("--fuente");
  return i >= 0 && ARGS[i + 1] ? path.resolve(ARGS[i + 1]) : path.join(RAIZ, "website", "guias");
})();
const DESTINO = path.join(RAIZ, "src", "content", "guias");
const PALABRAS_POR_MINUTO = 200;
const RUTA_COMPONENTES = "../../../components/docs/mdx";
const COMPONENTES = ["Callout", "DataTable", "Figure", "Formula", "Steps"];
const URL_TABLA_10 = "/docs/composicion-quimica-tabla-10.png";

const ALT = {
  "exactitud-precision":
    "Cuatro dianas con impactos que combinan exactitud y precisión buena o mala en cada caso.",
  "error-absoluto":
    "Gráfico de puntos con los errores absolutos de cuatro analistas: dispersión y desplazamiento respecto al cero.",
  "principio-liofilizacion":
    "Diagrama de fases del agua (presión frente a temperatura) con las fases sólida, líquida y vapor y tres flechas numeradas.",
  "aparato-extraccion":
    "Dibujo de un aparato de Soxhlet: balón inferior, extractor con sifón y refrigerante en la parte superior.",
  calorimetro:
    "Esquema de un calorímetro: balde con agua, cámara de combustión de oxígeno y termómetro.",
  forrajes: "Dibujo a lápiz de un árbol y de una vaina con semillas de leguminosa.",
  "procedimiento-ms":
    "Diagrama de flujo con fotografías: pesaje en balanza de precisión, secado en estufa a 60 °C, enfriamiento y nuevo pesaje del forraje.",
  "fig2-molienda-forraje":
    "Molino de martillos que recibe forraje seco y entrega harina en un frasco rotulado.",
  "fig3-preparacion-crisoles":
    "Secuencia de fotografías: crisoles de porcelana, estufa, pinza con crisol y desecador.",
  "fig4-ms-analitica":
    "Diagrama de flujo con fotografías de balanza analítica, estufa a 105 °C, desecador y pesaje final con la fórmula de la MS analítica.",
  "fig5-preparacion-crisoles-cenizas":
    "Secuencia de fotografías: crisoles de porcelana, estufa, pinza con crisol y desecador.",
  "fig6-determinacion-cenizas":
    "Diagrama de flujo con fotografías de pesaje, mufla a 600 °C, desecador y pesaje final con la fórmula de cenizas.",
  "fig7-metodo-soxhlet":
    "Fotografía de una batería de extractores Soxhlet de vidrio montados sobre placas de calefacción.",
  "fig8-partes-extractor-soxhlet":
    "Esquema numerado del extractor Soxhlet: balón con solvente, brazo de ascenso del vapor, cámara de extracción, sifón y refrigerante.",
  "fig9-peso-balones-muestra":
    "Diagrama de flujo con fotografías de la preparación de balones en estufa, desecador y pesaje del balón y de la muestra.",
  "fig10-peso-balon-extracto-etereo":
    "Diagrama de flujo con fotografías del secado del balón con extracto, desecador, pesaje y cálculo del extracto etéreo.",
  "fig11-pesaje-muestra-nitrogeno":
    "Tres balanzas analíticas con la muestra envuelta en papel y un tubo de digestión.",
  "fig12-preparacion-muestra-digestion":
    "Esquema de un tubo Büchi con muestra, ácido sulfúrico y catalizador, junto a una gradilla de tubos.",
  "fig13-digestion-campana-extraccion":
    "Equipos de digestión Kjeldahl dentro de la campana de extracción, con la reacción de hidrólisis ácida.",
  "fig14-preparacion-proceso-destilacion":
    "Esquema del destilador de nitrógeno con el erlenmeyer de ácido bórico, el tubo Büchi y las reacciones de destilación.",
  "fig15-titulacion-acido-sulfurico":
    "Fotografía de la titulación con bureta sobre placa de agitación y las reacciones de la tercera etapa.",
  "fig16-fibra-detergente-neutra":
    "Esquema de una célula vegetal tratada con solución detergente neutra que elimina el citoplasma y deja la pared celular.",
  "fig17-fibra-detergente-acida":
    "Esquema de la pared celular tratada con solución detergente ácida que elimina la hemicelulosa y deja celulosa y lignina.",
  "fig18-lignina-detergente-acida":
    "Esquema del residuo de FDA tratado con ácido sulfúrico al 72 % que elimina la celulosa y deja lignina y minerales.",
  "fig19-cenizas-minerales":
    "Esquema de la combustión del residuo de lignina a 500–600 °C durante 5 horas que deja solo los minerales.",
};

const TABLA_10 = `En el extremo derecho de la tabla se presenta la categorización (de 1 a 16) de la calidad nutricional para humanos de estos lípidos, basada en la suma de los ácidos grasos con uno o más dobles enlaces entre carbonos (insaturación).

Tabla 10. Perfil de algunos ácidos grasos (%) de algunos aceites y grasas de consumo humano.

| Aceite o grasa | C8:0 | C10:0 | C12:0 láurico | C14:0 mirístico | C16:0 palmítico | C16:1 palmitoleico | C18:0 esteárico | C18:1 oleico | C18:2 linoleico | C18:3 linolénico | Insaturados (%) | Categoría |
| --- | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: | --: |
| Canola |  |  |  | -- | 4.8 | 0.5 | 1.6 | 53.8 | 22.1 | 11.1 | 87.5 | 1 |
| Maíz |  |  |  |  | 10.9 | -- | 1.8 | 24.2 | 58.0 | 0.7 | 82.9 | 5 |
| Cártamo |  |  |  | 0.1 | 6.2 | 0.4 | 2.2 | 11.7 | 74.1 | 0.4 | 86.6 | 2 |
| Soya |  |  |  | 0.1 | 10.3 | 0.2 | 3.8 | 22.8 | 51.0 | 6.8 | 80.8 | 7 |
| Girasol |  |  |  | -- | 5.9 | -- | 4.5 | 19.5 | 65.7 | -- | 85.2 | 3 |
| Macadamia |  |  |  | -- | -- | 19.0 | -- | 59.2 | 2.84 | 1.00 | 82.0 | 6 |
| Maní |  |  |  | 0.1 | 9.5 | 0.1 | 2.2 | 44.8 | 32.0 | -- | 76.9 | 8 |
| Algodón |  |  |  | 0.8 | 22.7 | 0.8 | 2.3 | 17.1 | 51.5 | 0.2 | 69.5 | 10 |
| Palma africana |  |  | 0.1 | 1.0 | 43.5 | 0.3 | 4.3 | 36.6 | 9.1 | 0.2 | 46.2 | 13 |
| Coco | 7.5 | 6.0 | 44.6 | 16.8 | 8.2 | -- | 2.8 | 5.8 | 1.8 | -- | 7.6 | 16 |
| Oliva |  |  |  |  | 14.0 | 1.3 | 2.6 | 74.0 | 8.0 | -- | 83.4 | 4 |
| Aceite de pescado |  |  | 0.2 | 1.4 | 21.4 | 6.8 | 5.9 | 39.5 | 23.5 | 1.0 | 70.8 | 9 |
| Mantequilla bovina⊗ |  |  | 2.5 | 11.1 | 29.0 | 4.6 | 9.2 | 26.7 | 3.6 | -- | 34.9 | 15 |
| Cebo de res |  |  | 0.9 | 3.3 | 26.2 | -- | 22.4 | 45.3 | 1.6 | 0.5 | 47.4 | 14 |
| Manteca de cerdo |  |  | 0.1 | 1.5 | 25.7 | -- | 12.1 | 49.2 | 9.6 | 1.1 | 59.9 | 12 |
| Grasa de aves |  |  |  | 0.9 | 21.6 | 5.7 | 6.0 | 37.3 | 19.5 | 1.0 | 62.5 | 11 |

Elaborado por: A. A. Owen, 2000. ⊗ Contiene, además, 3,6 % de ácido butírico (C4). Los valores se transcribieron siguiendo el orden de las celdas del documento original.

<Callout tipo="nota" titulo="Transcripción en revisión">

Esta tabla se transcribió de la imagen del documento original y está pendiente de validación por el laboratorio. Puedes consultar la [tabla original como imagen](TABLA_10_URL).

</Callout>`;

const GUIAS = [
  {
    slug: "analisis-alimentos-y-forrajes",
    fuente: "analisis-alimentos-y-forrajes.qmd",
    capitulos: [
      {
        slug: "introduccion",
        inicio: "# INTRODUCCIÓN",
        desplazamiento: 0,
        titulo: "Introducción",
        descripcion:
          "El esquema de Weende y las fracciones que estima en los alimentos para animales: proteína bruta, cenizas, extracto etéreo, fibra bruta y extracto libre de N.",
      },
      {
        slug: "generalidades",
        inicio: "# GENERALIDADES DE LOS MÉTODOS ANALÍTICOS",
        desplazamiento: 0,
        titulo: "Generalidades de los métodos analíticos",
        descripcion:
          "Criterios para elegir un método analítico, tipos de error en los análisis químicos y buenas prácticas de recolección, secado y molienda de las muestras.",
      },
      {
        slug: "materia-seca",
        inicio: "## 1.0. DETERMINACIÓN DEL CONTENIDO DE MATERIA SECA",
        desplazamiento: -1,
        titulo: "Materia seca",
        descripcion:
          "Protocolo para determinar la materia seca inicial a 60 °C, la materia seca analítica a 105 °C y la materia seca total de alimentos húmedos como los forrajes.",
      },
      {
        slug: "liofilizacion",
        inicio: "## 2.0. LIOFILIZACION",
        desplazamiento: -1,
        titulo: "Liofilización",
        descripcion:
          "Secado de muestras frágiles por sublimación del agua: principio del método según el diagrama de fases, material necesario y procedimiento con el liofilizador.",
      },
      {
        slug: "cenizas",
        inicio: "## 3.0. DETERMINACIÓN DEL CONTENIDO EN CENIZAS",
        desplazamiento: -1,
        titulo: "Cenizas",
        descripcion:
          "Determinación gravimétrica de las cenizas totales por incineración en mufla a 550–600 °C: material, procedimiento y cálculo según el método AOAC 942.05.",
      },
      {
        slug: "extracto-etereo",
        inicio: "## 4.0. DETERMINACIÓN DEL CONTENIDO DE EXTRACTO ETÉREO",
        desplazamiento: -1,
        titulo: "Extracto etéreo",
        descripcion:
          "Extracción de la grasa libre con el aparato de Soxhlet y de la grasa total con hidrólisis ácida previa: material, procedimiento y cálculo del extracto etéreo.",
      },
      {
        slug: "proteina",
        inicio: "## 5.0. DETERMINACIÓN DEL CONTENIDO EN PROTEÍNAS BRUTAS",
        desplazamiento: -1,
        titulo: "Proteína bruta",
        descripcion:
          "Método de Kjeldahl para la proteína bruta: digestión, destilación y titulación del nitrógeno, reactivos, cálculo del %N y factores de conversión a proteína.",
      },
      {
        slug: "fibras",
        inicio: "## 6.0. DETERMINACIÓN DEL CONTENIDO EN FIBRAS",
        desplazamiento: -1,
        titulo: "Fibras (Van Soest)",
        descripcion:
          "Determinación de fibra detergente neutra, fibra detergente ácida y lignina por el método de Van Soest, con reactivos, precauciones de seguridad y fórmulas.",
      },
      {
        slug: "energia-bruta",
        inicio: "## 7.0. DETERMINACIÓN DEL CONTENIDO EN ENERGÍA BRUTA",
        desplazamiento: -1,
        titulo: "Energía bruta",
        descripcion:
          "Medición de la energía bruta con la bomba calorimétrica: principio del método, material necesario y armado de la cámara de combustión y del calorímetro.",
      },
    ],
    correcciones: [
      {
        buscar:
          "nitrógeno.\n\n| Denominación | Otra denominación | Componentes |",
        reemplazar:
          "nitrógeno.\n\nTabla 1. Fracciones de los alimentos según el esquema de Weende.\n\n| Denominación | Otra denominación | Componentes |",
      },
      {
        buscar: "# ANÁLISIS DE LABORATORIO\n\n",
        reemplazar: "",
      },
      {
        buscar: "se llama <u>Materia Seca Inicial</u> Sin embargo",
        reemplazar: "se llama **materia seca inicial**. Sin embargo",
      },
      {
        buscar: "se llama la <u>materia seca analítica</u>.",
        reemplazar: "se llama **materia seca analítica**.",
      },
      {
        buscar:
          "\\text{% Materia seca analítica} = \\left( \\frac{(\\text{Tara} + \\text{Peso de muestra seco}) - \\text{Tara}}{\\text{Peso de muestra a 60°C]}} \\right) \\times 100",
        reemplazar:
          "\\text{\\% Materia seca analítica} = \\left( \\frac{(\\text{Tara} + \\text{Peso de muestra seco}) - \\text{Tara}}{\\text{Peso de muestra a } 60\\,^\\circ\\text{C}} \\right) \\times 100",
      },
      {
        buscar: "\\text{% Materia seca total}",
        reemplazar: "\\text{\\% Materia seca total}",
      },
      {
        buscar: "(NH_4)_2SO_4 + 2:NaOH \\rightarrow 2:NH_4OH + Na_2SO_4 \\tag{1}",
        reemplazar: "(NH_4)_2SO_4 + 2\\,NaOH \\rightarrow 2\\,NH_4OH + Na_2SO_4 \\tag{1}",
      },
      {
        buscar: "(NH_4)_2SO_4 + 2:NaOH \\rightarrow Na_2SO_4 + 2:H_2O + 2:NH_3 \\tag{3}",
        reemplazar: "(NH_4)_2SO_4 + 2\\,NaOH \\rightarrow Na_2SO_4 + 2\\,H_2O + 2\\,NH_3 \\tag{3}",
      },
      {
        buscar: "NH_4H_2BO_3 + 2:HCl \\longrightarrow NH_4Cl + H_3BO_3",
        reemplazar: "NH_4H_2BO_3 + 2\\,HCl \\longrightarrow NH_4Cl + H_3BO_3",
      },
      {
        buscar: "Ejemplos:\n\n| Alimento | %N    | Coeficiente de conversión |",
        reemplazar:
          "Ejemplos:\n\nTabla 2. Contenido de nitrógeno y coeficiente de conversión N/proteína de algunos alimentos.\n\n| Alimento | %N    | Coeficiente de conversión |",
      },
      {
        buscar: "*   Carbonato de sodio ($NaCO_3$)",
        reemplazar: "*   Carbonato de sodio ($Na_2CO_3$)",
      },
      {
        buscar: "1.  **Digestión:**",
        reemplazar: "#### Digestión",
      },
      {
        buscar:
          "La digestión produce vapores perjudiciales. Estos se pueden eliminar",
        reemplazar:
          "<Callout tipo=\"seguridad\" titulo=\"Vapores de la digestión\">\n\nLa digestión produce vapores perjudiciales. Estos se pueden eliminar",
      },
      {
        buscar: "por cañería (alcantarilla).\n\n2.  **Destilación:**",
        reemplazar: "por cañería (alcantarilla).\n\n</Callout>\n\n#### Destilación",
      },
      {
        buscar: "3.  **Titulación:**",
        reemplazar: "#### Titulación",
      },
      {
        buscar: "**Cálculo:**",
        reemplazar: "#### Cálculo",
      },
      {
        buscar:
          "a.  % N = ml $H_2SO_4$ corregidos gastados en el proceso de titulación X Normalidad del ácido X m-equivalentes de Nitrógeno X 100 / ( peso de la muestra X % de materia seca)",
        reemplazar:
          "a. Porcentaje de nitrógeno:\n\n$$\n\\%\\,N = \\frac{\\text{ml } H_2SO_4 \\text{ corregidos} \\times \\text{normalidad del ácido} \\times \\text{m-equivalentes de N} \\times 100}{\\text{peso de la muestra} \\times \\%\\,\\text{materia seca}}\n$$",
      },
      {
        buscar:
          "**PRECAUCIONES – SEGURIDAD**\n\na)  la acetona es altamente flameable. Use careta o mascarilla, cuando la maneje y evite la inhalación o contacto con la piel.\n\nb)  El Sulfato Lauril Sódico irrita las membranas mucosas. Use mascarilla y cubra las manos con guantes cuando maneje estos químicos.",
        reemplazar:
          "<Callout tipo=\"seguridad\" titulo=\"Precauciones de seguridad\">\n\n- La acetona es altamente inflamable. Use careta o mascarilla cuando la maneje y evite la inhalación o el contacto con la piel.\n- El sulfato lauril sódico irrita las membranas mucosas. Use mascarilla y cubra las manos con guantes cuando maneje estos químicos.\n\n</Callout>",
      },
      {
        buscar: "**Procedimiento.**\n\n**PROCEDIMIENTO**",
        reemplazar: "**Procedimiento**",
      },
      {
        buscar:
          "a.  **DETERMINACIÓN DE FIBRA DETERGENTE NEUTRA ANÁLISIS DE VAN SOEST**\n\n    *   Peso de la muestra (g)\n    *   Peso del crisol + peso del residuo de FDN (g)\n    *   Peso del crisol + cenizas (g)\n\n   **Formula:**",
        reemplazar:
          "**Determinación de fibra detergente neutra (análisis de Van Soest):**\n\n- Peso de la muestra (g)\n- Peso del crisol + peso del residuo de FDN (g)\n- Peso del crisol + cenizas (g)\n\n**Fórmula:**",
      },
      {
        buscar:
          "\\text{\\% FDN Base Seca} = \\frac{[\\text{(peso crisol + residuos FDN)} - \\text{(peso crisol + cenizas)}]}{\\text{Peso de la muestra} \\times \\text{% M.S.A}} \\times 100",
        reemplazar:
          "\\text{\\% FDN base seca} = \\frac{[\\text{(peso crisol + residuos FDN)} - \\text{(peso crisol + cenizas)}]}{\\text{Peso de la muestra} \\times \\text{\\% M.S.A}} \\times 100",
      },
      {
        buscar: "DETERMINACIÓN DE LA FIBRA DETERGENTE ÁCIDA(FDA)",
        reemplazar: "DETERMINACIÓN DE LA FIBRA DETERGENTE ÁCIDA (FDA)",
      },
      {
        buscar:
          "**DETERMINACIÓN DE FIBRA DETERGENTE ACIDA ANÁLISIS DE VAN SOEST**\n\n*   Peso de la muestra (g)",
        reemplazar:
          "**Determinación de fibra detergente ácida (análisis de Van Soest):**\n\n*   Peso de la muestra (g)",
      },
      {
        buscar: "*   Peso del crisol + cenizas (g)\n\n**Formula:**\n\n$$ \\text{\\% FDA Base Seca}",
        reemplazar: "*   Peso del crisol + cenizas (g)\n\n**Fórmula:**\n\n$$ \\text{\\% FDA Base Seca}",
      },
      {
        buscar:
          "\\text{\\% FDA Base Seca} = \\frac{[\\text{(peso crisol + residuos FDA)} - \\text{(peso crisol + cenizas)}]}{\\text{Peso de la muestra} \\times \\text{% M.S.A}} \\times 100",
        reemplazar:
          "\\text{\\% FDA base seca} = \\frac{[\\text{(peso crisol + residuos FDA)} - \\text{(peso crisol + cenizas)}]}{\\text{Peso de la muestra} \\times \\text{\\% M.S.A}} \\times 100",
      },
      {
        buscar: "LIGNINA DETERGENTE ACIDA EN BEAKERS",
        reemplazar: "LIGNINA DETERGENTE ÁCIDA EN BEAKERS",
      },
      {
        buscar:
          "**PRECAUCIONES – SEGURIDAD**\n\na)  El ácido sulfúrico es un reactivo corrosivo, que puede causar quemaduras, altamente peligroso para la salud humana si se llega ingerir o a manipular sin protección.\nb)  Usar guantes de nitrilo y mascarilla cuando se maneje ácido sulfúrico. Agregue siempre ácido sulfúrico al agua. Si el ácido hace contacto con la piel, lavar con abundante cantidad de agua (ducha).",
        reemplazar:
          "<Callout tipo=\"seguridad\" titulo=\"Precauciones de seguridad\">\n\n- El ácido sulfúrico es un reactivo corrosivo, que puede causar quemaduras, altamente peligroso para la salud humana si se llega a ingerir o a manipular sin protección.\n- Usar guantes de nitrilo y mascarilla cuando se maneje ácido sulfúrico. Agregue siempre ácido sulfúrico al agua. Si el ácido hace contacto con la piel, lavar con abundante cantidad de agua (ducha).\n\n</Callout>",
      },
      {
        buscar:
          "**Advertencia:** No colocar las muestras en el horno hasta que la acetona no se haya evaporadocompletamente.",
        reemplazar:
          "<Callout tipo=\"advertencia\" titulo=\"Advertencia\">\n\nNo colocar las muestras en el horno hasta que la acetona se haya evaporado completamente.\n\n</Callout>",
      },
      {
        buscar: "*   Peso del crisol + cenizas (g)\n\n**Formula:**\n\n$$ \\text{\\% Lignina Base Seca}",
        reemplazar: "*   Peso del crisol + cenizas (g)\n\n**Fórmula:**\n\n$$ \\text{\\% Lignina Base Seca}",
      },
      {
        buscar:
          "\\text{\\% Lignina Base Seca} = \\frac{[\\text{(peso crisol + residuos LDA)} - \\text{(peso crisol + cenizas)}]}{\\text{Peso de la muestra} \\times \\text{% M.S.}} \\times 100",
        reemplazar:
          "\\text{\\% Lignina base seca} = \\frac{[\\text{(peso crisol + residuos LDA)} - \\text{(peso crisol + cenizas)}]}{\\text{Peso de la muestra} \\times \\text{\\% M.S.}} \\times 100",
      },
      {
        buscar: "**Armado de la cámara de combustión.**",
        reemplazar: "#### Armado de la cámara de combustión",
      },
      {
        buscar: "**Armado de la bomba calorimétrica.**",
        reemplazar: "#### Armado de la bomba calorimétrica",
      },
      {
        buscar: "**ENERGÍA BRUTA.**\n\nLa energía bruta de una materia",
        reemplazar: "**Energía bruta.** La energía bruta de una materia",
      },
    ],
  },
  {
    slug: "composicion-quimica",
    fuente: "guia-composicion-quimica-alimentos.qmd",
    piePagina: /^1Nutrición Animal Básica\. Profesora/,
    capitulos: [
      {
        reflujo: true,
        slug: "presentacion-y-abreviaturas",
        inicio: null,
        desplazamiento: 0,
        titulo: "Presentación y abreviaturas",
        descripcion:
          "Abreviaturas usadas en la guía y aspectos generales para analizar alimentos: agua y materia seca, cantidad de muestra necesaria y expresión en base seca.",
      },
      {
        reflujo: true,
        slug: "materia-seca",
        inicio: "Materia Seca",
        desplazamiento: 0,
        titulo: "Materia seca",
        descripcion:
          "Importancia de la materia seca en nutrición animal, secado inicial a 60 °C y analítico a 105 °C, y cálculo de la materia seca total de varias materias primas.",
      },
      {
        reflujo: true,
        slug: "cenizas",
        inicio: "Cenizas o Minerales",
        desplazamiento: 0,
        titulo: "Cenizas",
        descripcion:
          "Las cenizas como residuo mineral de la calcinación, estimación de la materia orgánica y efecto de un alto contenido de minerales en la digestibilidad.",
      },
      {
        reflujo: true,
        slug: "extracto-etereo",
        inicio: "Extracto Etéreo",
        desplazamiento: 0,
        titulo: "Extracto etéreo",
        descripcion:
          "Extracto etéreo de forrajes, oleaginosas y productos de origen animal, extracción con y sin hidrólisis ácida y perfil de ácidos grasos de aceites y grasas.",
      },
      {
        reflujo: true,
        slug: "proteina",
        inicio: "**Determinación de Nitrógeno y Proteína Cruda o Bruta**",
        desplazamiento: 0,
        titulo: "Proteína cruda",
        descripcion:
          "Nitrógeno y proteína cruda por Kjeldahl, factores de conversión del nitrógeno, nitrógeno no proteico y aminoácidos de productos de origen animal.",
      },
      {
        reflujo: true,
        slug: "fibra",
        inicio: "**Fibra (Pared Celular) en los alimentos para consumo animal**",
        desplazamiento: 0,
        titulo: "Fibra",
        descripcion:
          "Pared celular de los alimentos: fibra cruda frente a FDN, FDA y lignina de Van Soest, límites de fibra en las dietas y valor relativo de los forrajes (VRF).",
      },
      {
        reflujo: true,
        slug: "almidones-y-azucares",
        inicio: "**Almidones y azucares**",
        desplazamiento: 0,
        titulo: "Almidones y azúcares",
        descripcion:
          "Estimación de almidones y azúcares como extracto libre de nitrógeno (ELN) con la fibra cruda o con la FDN, con un ejemplo resuelto para un heno de gramínea.",
      },
      {
        slug: "energia-bruta",
        inicio: "## Energía Bruta (EB)",
        desplazamiento: 0,
        titulo: "Energía bruta",
        descripcion:
          "Energía bruta medida en la bomba calorimétrica y su diferencia con la energía digestible, con valores de referencia para maíz, avena, soya, heno y paja.",
      },
      {
        slug: "referencias",
        inicio: "## Referencias Bibliográficas",
        desplazamiento: 0,
        titulo: "Referencias bibliográficas",
        descripcion:
          "Referencias bibliográficas de la guía de composición química de los alimentos: textos de nutrición animal, métodos de análisis y tablas de composición.",
      },
      {
        slug: "anexo-1-materia-seca",
        inicio: "## Anexo 1. Determinación del Contenido en Materia Seca mediante Calor",
        desplazamiento: 0,
        titulo: "Anexo 1. Determinación de la materia seca",
        descripcion:
          "Procedimiento paso a paso para la materia seca inicial a 60 °C, la materia seca analítica a 105 °C y la materia seca total, con un ejemplo de cálculo resuelto.",
      },
      {
        slug: "anexo-2-cenizas",
        inicio: "## Anexo 2. Determinación de Cenizas",
        desplazamiento: 0,
        titulo: "Anexo 2. Determinación de cenizas",
        descripcion:
          "Procedimiento para las cenizas totales en mufla a 550–600 °C y para las cenizas insolubles en HCl 1N (sílice), con un ejemplo de cálculo con el pasto bore.",
      },
      {
        slug: "anexo-3-extracto-etereo",
        inicio: "## Anexo 3. Determinación de Extracto Etéreo",
        desplazamiento: 0,
        titulo: "Anexo 3. Determinación del extracto etéreo",
        descripcion:
          "Partes del extractor Soxhlet, procedimiento paso a paso para la grasa libre y la grasa total con hidrólisis ácida, y ejemplo de cálculo del extracto etéreo.",
      },
      {
        slug: "anexo-4-proteina",
        inicio: "## Anexo 4. Determinación de Proteína Cruda",
        desplazamiento: -1,
        titulo: "Anexo 4. Determinación de proteína cruda",
        descripcion:
          "Material, reactivos y etapas de digestión, destilación y titulación del método Kjeldahl, con el cálculo del nitrógeno y de la proteína cruda en un ejemplo.",
      },
      {
        slug: "anexo-5-van-soest",
        inicio: "## Anexo 5. Análisis de Van Soest",
        desplazamiento: -1,
        titulo: "Anexo 5. Análisis de Van Soest",
        descripcion:
          "Fracciones del análisis de Van Soest: fibra detergente neutra, fibra detergente ácida y lignina, con el cálculo de hemicelulosa, celulosa y el ajuste final.",
      },
    ],
    correcciones: [
      {
        buscar:
          "---\n\n1. Texto relacionado con el ejercicio docente de la\nasignatura Nutrición Animal Básica\n\n- Composición Química de los Alimentos e\nInterpretación de resultados\n\nLuz Stella Muñoz Arboleda\nProfesora Asociada\nDepartamento de Ciencia Animal\n\n¹Nutrición Animal Básica. Profesora Luz Stella Muñoz Arboleda. Departamento de Ciencia Animal\n\n---\n\nAbreviaturas\n\nLas siguientes abreviaturas han sido utilizadas en las tablas.\n\nEn las tablas, los contenidos de nutrientes están expresados en materia seca\n\nAbreviatura | Descripción y Unidad",
        reemplazar:
          "Texto relacionado con el ejercicio docente de la asignatura Nutrición Animal Básica: composición química de los alimentos e interpretación de resultados de laboratorio.\n\n## Abreviaturas\n\nLas siguientes abreviaturas han sido utilizadas en las tablas. En las tablas, los contenidos de nutrientes están expresados en materia seca.\n\nTabla: Abreviaturas utilizadas en las tablas de la guía.\n\nAbreviatura | Descripción y unidad",
      },
      { buscar: "PC - | Proteína Cruda = N x 6.25", reemplazar: "PC | Proteína Cruda = N x 6.25 (%)" },
      { buscar: "FDN | Fibra Detergente Neutra. /%)", reemplazar: "FDN | Fibra Detergente Neutra. (%)" },
      {
        buscar:
          "ASPECTOS A TENER EN CUENTA PARA LOS ANALISIS DE\nCOMPOSICION QUIMICA DE LOS ALIMENTOS E INTERPRETACIÓN DE RESULTADOS DE\nLABORATORIO¹",
        reemplazar:
          "## Aspectos a tener en cuenta para los análisis de composición química e interpretación de resultados",
      },
      {
        buscar:
          "![Forrajes](./img/Forrajes.png)\n\nFigura 1. Los forrajes contienen menos materia seca (MS) que los granos. Dibujo de Martínez Lasso (2018)¹.\n¹ Estudiante Ingeniería Agronómica",
        reemplazar:
          "![Figura 1. Los forrajes contienen menos materia seca (MS) que los granos. Dibujo de Martínez Lasso (2018), estudiante de Ingeniería Agronómica.](img/Forrajes.png)",
      },
      { buscar: "Forrajes verdes: Los contenidos de agua", reemplazar: "**Forrajes verdes:** los contenidos de agua" },
      {
        buscar:
          "Pasto estrella como FV 20% MS; 10% Proteína Cruda – P.C\nPasto estrella como heno 85% MS; 10% Proteína Cruda\n\n1 kg de heno equivale a 0.85 kg (850 g) de MS y a su vez, a 0.085 kg (85 g) de P.C.\n1 kg de F.V. equivale a 0.20 kg (200 g) de MS y a su vez, a 0.020 kg (20 g) de P.C.",
        reemplazar:
          "- Pasto estrella como FV: 20 % MS; 10 % proteína cruda (P.C.).\n- Pasto estrella como heno: 85 % MS; 10 % proteína cruda.\n\nEntonces:\n\n- 1 kg de heno equivale a 0.85 kg (850 g) de MS y, a su vez, a 0.085 kg (85 g) de P.C.\n- 1 kg de F.V. equivale a 0.20 kg (200 g) de MS y, a su vez, a 0.020 kg (20 g) de P.C.",
      },
      {
        buscar:
          "Que cantidad de muestra se debe recolectar para los análisis de Weende y de Van Soest:\nPara la realización",
        reemplazar:
          "### ¿Qué cantidad de muestra se debe recolectar para los análisis de Weende y de Van Soest?\n\nPara la realización",
      },
      {
        buscar:
          "100 g de FV hay 35 g de MS o que en 100 kg de FV hay 35 kg de MS\nY se dice que la proteína cruda es 10%, y de cenizas (minerales) es 11%, esto indica que:\nEn 100 g de MS hay 10 g de proteína cruda o En 100 kg de MS hay 10 kg de proteína cruda\nEn 100 g de MS hay 11 g de ceniza o En 100 kg de MS hay 11 g de cenizas",
        reemplazar:
          "- 100 g de FV hay 35 g de MS, o en 100 kg de FV hay 35 kg de MS.\n\nY si se dice que la proteína cruda es 10 % y las cenizas (minerales) son 11 %, esto indica que:\n\n- En 100 g de MS hay 10 g de proteína cruda, o en 100 kg de MS hay 10 kg de proteína cruda.\n- En 100 g de MS hay 11 g de cenizas, o en 100 kg de MS hay 11 g de cenizas.",
      },
      {
        buscar: "Métodos de Análisis:\nExisten diferentes métodos de secado",
        reemplazar: "## Métodos de análisis\n\nExisten diferentes métodos de secado",
      },
      {
        buscar: "se está realizando en estufa analítica. (Anexo 2\nDeterminación de MS inicial, y Analítica).",
        reemplazar:
          "se está realizando en estufa analítica ([Anexo 1](/guias/composicion-quimica/anexo-1-materia-seca/): determinación de MS inicial y analítica).",
      },
      {
        buscar: "es lo que se conoce como Materia Seca Inicial\n(anexo 1).",
        reemplazar:
          "es lo que se conoce como Materia Seca Inicial\n([anexo 1](/guias/composicion-quimica/anexo-1-materia-seca/)).",
      },
      {
        buscar: "MS total = Materia Seca Inicial x Materia Seca Analítica\n                        100",
        reemplazar: "$$\nMS_{total} = \\frac{MS_i \\times MS_a}{100}\n$$",
      },
      { buscar: "estimación de MS total de alginas materias", reemplazar: "estimación de MS total de algunas materias" },
      {
        buscar:
          "'información generada en el laboratorio de Nutrición Animal, por estudiantes de la asignatura de Nutrición\nAnimal Básica. 2Sauvant et al., 2002.\nNo es necesario realizar esta determinación, pues su bajo contenido de humedad, permite molienda",
        reemplazar:
          "¹Información generada en el laboratorio de Nutrición Animal, por estudiantes de la asignatura de Nutrición Animal Básica. ²Sauvant et al., 2002. (---) No es necesario realizar esta determinación, pues su bajo contenido de humedad permite la molienda.",
      },
      {
        buscar: "Método de Análisis: El carbonato potásico",
        reemplazar: "## Método de análisis\n\nEl carbonato potásico",
      },
      {
        buscar: "Sin embargo, los cloruros, pueden volatilizarse a esta temperatura (anexo 2).",
        reemplazar:
          "Sin embargo, los cloruros pueden volatilizarse a esta temperatura ([anexo 2](/guias/composicion-quimica/anexo-2-cenizas/)).",
      },
      {
        buscar:
          "'información generada en el laboratorio de Nutrición Animal, por estudiantes de la asignatura de Nutrición\nAnimal Básica. Sauvant et al., 2002\n\nEn general, el contenido de cenizas",
        reemplazar:
          "¹Información generada en el laboratorio de Nutrición Animal, por estudiantes de la asignatura de Nutrición Animal Básica. ²Sauvant et al., 2002.\n\nEn general, el contenido de cenizas",
      },
      {
        buscar:
          "Materia Orgánica\n\nMateria Seca\n100\n\nMateria inorgánica (cenizas) 12\n\nMateria~Seca~(100) = \\begin{cases} Materia~Orgánica \\\\ Materia~inorgánica~(cenizas) \\textbf{12} \\end{cases}",
        reemplazar:
          "$$\n\\text{Materia seca (100)} = \\begin{cases} \\text{Materia orgánica} \\\\ \\text{Materia inorgánica (cenizas): } \\mathbf{12} \\end{cases}\n$$",
      },
      {
        buscar:
          "% Materia Orgánica = 100 - % cenizas\n\n% MO *Brachieria decumbens* = 100 – 12 = 88% de Materia Orgánica",
        reemplazar:
          "$$\n\\%\\,\\text{Materia orgánica} = 100 - \\%\\,\\text{cenizas}\n$$\n\n$$\n\\%\\,\\text{MO}_{\\textit{Brachiaria decumbens}} = 100 - 12 = 88\\,\\%\n$$",
      },
      {
        buscar:
          "Tabla 5. Contenido de materia seca, cenizas y digestibilidad de la MS de forrajes¹. Helecho de agua\n*Azolla sp*, *Bore Alocasia macrorhyza Morera Morus alba*, *Nacedero Trichatera gigantea Salvinia\nSalvinia molesta*",
        reemplazar:
          "Tabla 5. Contenido de materia seca, cenizas y digestibilidad de la MS de forrajes¹: helecho de agua (*Azolla sp.*), bore (*Alocasia macrorrhiza*), morera (*Morus alba*), nacedero (*Trichanthera gigantea*) y salvinia (*Salvinia molesta*).",
      },
      {
        buscar: "|  | AZOLLA | BORE | MORERA | NACEDERO | SALVINIA |",
        reemplazar: "| Variable | Azolla | Bore | Morera | Nacedero | Salvinia |",
      },
      {
        buscar: "'Ruiz et al., 2005. Digestibilidad enzimática en cerdos",
        reemplazar: "¹Ruiz et al., 2005. ²Digestibilidad enzimática en cerdos.",
      },
      {
        buscar: "y otros pigmentos (anexo 3)",
        reemplazar: "y otros pigmentos ([anexo 3](/guias/composicion-quimica/anexo-3-extracto-etereo/)).",
      },
      {
        buscar:
          "'información generada en el laboratorio de Nutrición Animal, por estudiantes de la asignatura de Nutrición\nAnimal Básica. 2Sauvant et al., 2002\n\nEl contenido de lípidos",
        reemplazar:
          "¹Información generada en el laboratorio de Nutrición Animal, por estudiantes de la asignatura de Nutrición Animal Básica. ²Sauvant et al., 2002.\n\nEl contenido de lípidos",
      },
      { buscar: "1. Gadoud et al., 1992.\n\nA manera de ejemplo", reemplazar: "¹Gadoud et al., 1992.\n\nA manera de ejemplo" },
      { buscar: "2. 'Gadoud et al., 1982.", reemplazar: "¹Gadoud et al., 1982." },
      {
        buscar:
          "| Materia Prima        | % EE                                | % EE                                    |\n| -------------------- | ----------------------------------- | --------------------------------------- |\n|                      | Sin Hidrolisis ácida                | Con Hidrolisis Acida                   |",
        reemplazar:
          "| Materia prima | % EE sin hidrólisis ácida | % EE con hidrólisis ácida |\n| --- | --- | --- |",
      },
      {
        buscar:
          "¹información generada en el laboratorio de Nutrición Animal, por estudiantes de la asignatura de Nutrición\nAnimal Básica. ²Sauvant et al., 2002",
        reemplazar:
          "¹Información generada en el laboratorio de Nutrición Animal, por estudiantes de la asignatura de Nutrición Animal Básica. ²Sauvant et al., 2002.",
      },
      {
        buscar:
          "En la tabla 10 se\npresentan los perfiles de Ácidos grasos de varios aceites y grasas.\n\nTabla 10. Perfil de algunos ácidos grasos de algunos aceites y grasas de consumo humano.\n\n![](img/tabla_10.png)",
        reemplazar: "En la tabla 10 se\npresentan los perfiles de Ácidos grasos de varios aceites y grasas.\n\n" + TABLA_10,
      },
      {
        buscar: "**Método de Análisis:**\n\nEl N, que se obtiene",
        reemplazar: "## Método de análisis\n\nEl N, que se obtiene",
      },
      {
        buscar: "se destila y se valora en una solución ácido normalizada (anexo 4)",
        reemplazar:
          "se destila y se valora en una solución ácido normalizada ([anexo 4](/guias/composicion-quimica/anexo-4-proteina/)).",
      },
      { buscar: "Con el método de Kjendhal,", reemplazar: "Con el método de Kjeldahl," },
      {
        buscar: "entre\ndiferentes ingredientes alimenticios 1.",
        reemplazar: "entre\ndiferentes ingredientes alimenticios¹.",
      },
      {
        buscar:
          "1 Fuente: MAFF (1975)\n\n2 Incluye todas las carnes y pescados.\n\n3 https://riunet.upv.es/bitstream/handle/.../Determinación%20de%20proteinas",
        reemplazar:
          "¹Fuente: MAFF (1975). ²Incluye todas las carnes y pescados. ³García Martínez y Fernández Segovia, Universitat Politècnica de València, repositorio RiuNet (el enlace del documento original está incompleto).",
      },
      {
        buscar: "Información generada en el laboratorio de Nutrición Animal, por estudiantes de la asignatura de Nutrición\nAnimal Básica. ² Sauvant et al., 2002\n\nLos contenidos de proteína",
        reemplazar:
          "Información generada en el laboratorio de Nutrición Animal, por estudiantes de la asignatura de Nutrición Animal Básica. ²Sauvant et al., 2002.\n\nLos contenidos de proteína",
      },
      { buscar: "| **OTROS ALIMENTOS** 2 ", reemplazar: "| **OTROS ALIMENTOS**² " },
      { buscar: "1. Gadoud *et al.*, 1992.", reemplazar: "¹Gadoud *et al.*, 1992." },
      {
        buscar: "***Métodos de Análisis*:**",
        reemplazar: "## Métodos de análisis",
      },
      {
        buscar: "como se observa en la tabla 15. (Anexo 5).",
        reemplazar:
          "como se observa en la tabla 15 ([anexo 5](/guias/composicion-quimica/anexo-5-van-soest/)).",
      },
      {
        buscar: "| FORRAJES          | FDN   | FC   |\n|-------------------|-------|------|\n|                   | %     | %    |",
        reemplazar: "| Forrajes | FDN (%) | FC (%) |\n|---|---|---|",
      },
      {
        buscar: "Información generada en el laboratorio de Nutrición Animal, por estudiantes de la asignatura de\nNutrición Animal Básica. ² Sauvant *et al.*, 2002",
        reemplazar:
          "Información generada en el laboratorio de Nutrición Animal, por estudiantes de la asignatura de Nutrición Animal Básica. ²Sauvant *et al.*, 2002.",
      },
      {
        buscar:
          "El potencial de consumo está afectado con el contenido de FDN, según la siguiente formula:\nConsumo de MS como % PV = 120/%FDN\n\nLa digestibilidad de la MS – DMS se calcula en función del contenido de FDA:\nDMS (%) = 88,9 - (0,779 x %FAD)\n\nEl valor relativo de los forrajes (exceptuando el ensilado de maíz) se calcula como:\n\nVRF = (DMS x Consumo MS)/1,29",
        reemplazar:
          "El potencial de consumo está afectado por el contenido de FDN, según la siguiente fórmula:\n\n$$\n\\text{Consumo de MS (\\% PV)} = \\frac{120}{\\%\\,FDN}\n$$\n\nLa digestibilidad de la MS (DMS) se calcula en función del contenido de FDA:\n\n$$\nDMS\\,(\\%) = 88{,}9 - (0{,}779 \\times \\%\\,FDA)\n$$\n\nEl valor relativo de los forrajes (exceptuando el ensilado de maíz) se calcula como:\n\n$$\nVRF = \\frac{DMS \\times \\text{Consumo de MS}}{1{,}29}\n$$",
      },
      {
        buscar:
          "| Clasificación | FDN   | FDA   | VRF   |\n|---------------|-------|-------|-------|\n|               | % Materia Seca       |",
        reemplazar: "| Clasificación | FDN (% MS) | FDA (% MS) | VRF |\n|---|---|---|---|",
      },
      {
        buscar: "Consumo de MS como % PV = 120/%FDN; DMS (%) = 88,9 - (0,779 x %FAD) VRF = (DMS x Consumo MS)/1,29",
        reemplazar:
          "Consumo de MS como % PV = 120/%FDN; DMS (%) = 88,9 − (0,779 × %FDA); VRF = (DMS × consumo de MS)/1,29.",
      },
      {
        buscar:
          "| MS   | Humedad | Cenizas | PC  | EE  | FB   | FDN  | FDA  | LDA  |\n|------|---------|---------|-----|-----|------|------|------|------|\n| (%) | (%)     | (% MS)  | (%MS) | (%MS) | (%MS) | (%MS) | (%MS) | (%MS) |",
        reemplazar:
          "| Muestra | MS (%) | Humedad (%) | Cenizas (% MS) | PC (% MS) | EE (% MS) | FB (% MS) | FDN (% MS) | FDA (% MS) | LDA (% MS) |\n|---|---|---|---|---|---|---|---|---|---|",
      },
      {
        buscar: "materia prima se utiliza el propuesto por Henneberg y Stohmann (1867) en la estación\nexperimental de Weende (Alemania), en el cual se estima con un a formula,",
        reemplazar:
          "materia prima se utiliza el propuesto por Henneberg y Stohmann (1867) en la estación\nexperimental de Weende (Alemania), en el cual se estima con una fórmula,",
      },
      {
        buscar: "Si tomamos como ejemplo los contenidos de FC y FDN del heno de gramínea de la tabla 15 y tenemos en cuenta los otros valores de los nutrientes de este heno:\n\n",
        reemplazar:
          "Si tomamos como ejemplo los contenidos de FC y FDN del heno de gramínea de la tabla 15 y tenemos en cuenta los otros valores de los nutrientes de este heno:\n\nTabla: Composición del heno de gramínea usada en el ejemplo.\n\n",
      },
      {
        buscar: "FC = 100 - (10 + 11 + 3 + \\mathbf{30}) = 46\\% \\text{ de ELN}",
        reemplazar: "ELN = 100 - (10 + 11 + 3 + \\mathbf{30}) = 46\\%",
      },
      {
        buscar: "FDN = 100 - (10 + 11 + 3 + \\mathbf{60}) = 16\\% \\text{ de ELN}",
        reemplazar: "ELN = 100 - (10 + 11 + 3 + \\mathbf{60}) = 16\\%",
      },
      {
        buscar: "producida por la combustión de la muestra. El resultado corresponde a la cantidad de energía bruta presente en la muestra.\n\nEl contenido de Energía Bruta",
        reemplazar:
          "producida por la combustión de la muestra. El resultado corresponde a la cantidad de energía bruta presente en la muestra.\n\n<Callout tipo=\"nota\" titulo=\"Anexo en revisión por el laboratorio\">\n\nEl documento original remite a un «Anexo 6» sobre la energía bruta que no está incluido en la guía. Mientras se publica, puedes consultar el protocolo de [energía bruta de la guía de análisis de alimentos y forrajes](/guias/analisis-alimentos-y-forrajes/energia-bruta/).\n\n</Callout>\n\nEl contenido de Energía Bruta",
      },
      {
        buscar:
          "Universitat Politècnica de València. https://riunet.upv.es/bitstream/handle/.../Determinación%20de%20proteinas.pdf",
        reemplazar:
          "Universitat Politècnica de València. Repositorio RiuNet (el enlace del documento original está incompleto).",
      },
      {
        buscar: "Escuela MEH. https://analisisinstrumentalmeh.files.wordpress.com/.../analisis-de-aceites-.",
        reemplazar: "Escuela MEH. Documento «Análisis de aceites» (el enlace del documento original está incompleto).",
      },
      {
        buscar: "Manual de capacitación. http://www.fao.org/docrep/field/003/ab492s/AB492S06.htm",
        reemplazar:
          "Manual de capacitación. FAO. [https://www.fao.org/4/ab492s/AB492S06.htm](https://www.fao.org/4/ab492s/AB492S06.htm)",
      },
      {
        buscar: "Analiza Calidad www.analizacalidad.com/docftp/fi1441ene2007.pdf",
        reemplazar: "Analiza Calidad (documento fi1441ene2007, ya no disponible en línea).",
      },
      {
        buscar: "Caso de un alimento húmedo (alto contenido de agua) (Ej. Forraje, frutas)",
        reemplazar: "**Caso de un alimento húmedo** (alto contenido de agua; por ejemplo, forrajes y frutas).",
      },
      {
        buscar: "Se utiliza para expresar los resultados en base seca.\n\n### Material necesario",
        reemplazar: "Se utiliza para expresar los resultados en base seca.\n\n## Materia seca inicial\n\n### Material necesario",
      },
      {
        buscar: "### Procedimiento de **Materia Seca Inicial - MS inicial**",
        reemplazar: "### Procedimiento de materia seca inicial",
      },
      { buscar: "- Carbonato de sodio NaCO₃", reemplazar: "- Carbonato de sodio Na₂CO₃" },
      { buscar: "### Etapa 1: Digestión o hidrólisis", reemplazar: "#### Etapa 1: digestión o hidrólisis" },
      { buscar: "### Etapa 2: Destilación", reemplazar: "#### Etapa 2: destilación" },
      { buscar: "### Etapa 3: Titulación", reemplazar: "#### Etapa 3: titulación" },
      {
        buscar: "Cálculo de Nitrógeno en Materia Seca\n\nNitrógeno expresado en materia seca, titulando con H₂SO₄",
        reemplazar: "### Cálculo de nitrógeno en materia seca\n\nNitrógeno expresado en materia seca, titulando con H₂SO₄:",
      },
    ],
  },
];

const ACRONIMOS = new Map(
  [
    "AOAC", "ASTM", "CTAB", "EB", "EE", "ELN", "FC", "FDA", "FDN", "HCl", "LDA", "MO", "MS", "MSa",
    "MSi", "MSt", "MST", "NDF", "ADF", "ADL", "PC", "VRF", "N", "SDN", "SDA",
  ].map((a) => [a.toLowerCase(), a]),
);
const NOMBRES_PROPIOS = new Map(
  ["Van", "Soest", "Soxhlet", "Kjeldahl", "Weende", "Henneberg", "Stohmann", "Dumas", "Büchi", "Weende"].map(
    (n) => [n.toLowerCase(), n],
  ),
);

/** Escribe un mensaje de error en español y termina el proceso. */
function abortar(mensaje, error) {
  console.error(`convert-qmd: ${mensaje}`);
  if (error) console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

/** Convierte un título a estilo oración conservando siglas y nombres propios. */
function oracion(texto) {
  const limpio = texto.replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
  const letras = limpio.replace(/[^\p{L}]/gu, "");
  const mayusculas = letras.replace(/[^\p{Lu}]/gu, "");
  const todoMayusculas = letras.length > 0 && mayusculas.length / letras.length > 0.8;
  let primera = true;
  return limpio.replace(/[\p{L}\p{N}]+/gu, (palabra, desplazamiento, completo) => {
    const anterior = completo.slice(0, desplazamiento).trimEnd();
    const iniciaFrase = /[.!?]$/.test(anterior) && !/\d\.$/.test(anterior);
    const esPrimera = primera;
    if (/\p{L}/u.test(palabra)) primera = false;
    if (/\d/.test(palabra)) return palabra;
    const clave = palabra.toLowerCase();
    if (ACRONIMOS.has(clave) && (todoMayusculas || palabra === palabra.toUpperCase() || palabra === ACRONIMOS.get(clave))) {
      return ACRONIMOS.get(clave);
    }
    if (NOMBRES_PROPIOS.has(clave)) return NOMBRES_PROPIOS.get(clave);
    if (!todoMayusculas && !esPrimera && /\p{Lu}/u.test(palabra.slice(1))) return palabra;
    if (!todoMayusculas && !esPrimera && palabra === palabra.toLocaleUpperCase("es")) return palabra;
    const minuscula = palabra.toLocaleLowerCase("es");
    if (esPrimera || iniciaFrase) return minuscula.charAt(0).toLocaleUpperCase("es") + minuscula.slice(1);
    return minuscula;
  });
}

/** Cuenta las apariciones de `buscar` en `texto`. */
function contar(texto, buscar) {
  return texto.split(buscar).length - 1;
}

/** Aplica las correcciones; cada una debe coincidir exactamente una vez. */
function aplicarCorrecciones(texto, correcciones, guia) {
  let resultado = texto;
  for (const { buscar, reemplazar } of correcciones) {
    const n = contar(resultado, buscar);
    if (n !== 1) {
      throw new Error(`La corrección de ${guia} coincide ${n} veces: «${buscar.slice(0, 80)}…»`);
    }
    resultado = resultado.replace(buscar, () => reemplazar);
  }
  return resultado;
}

/** Divide las líneas de una guía en capítulos usando la línea de inicio de cada uno. */
function dividirCapitulos(lineas, capitulos, guia) {
  const inicios = [];
  let desde = 0;
  for (const capitulo of capitulos) {
    if (capitulo.inicio === null) {
      inicios.push({ indice: 0, omitir: false });
      continue;
    }
    const indice = lineas.findIndex((l, i) => i >= desde && l.trim() === capitulo.inicio);
    if (indice < 0) throw new Error(`No se encontró el inicio «${capitulo.inicio}» en ${guia}`);
    inicios.push({ indice, omitir: true });
    desde = indice + 1;
  }
  return capitulos.map((capitulo, k) => {
    const { indice, omitir } = inicios[k];
    const fin = k + 1 < inicios.length ? inicios[k + 1].indice : lineas.length;
    return { capitulo, lineas: lineas.slice(omitir ? indice + 1 : indice, fin) };
  });
}

const RE_LISTA = /^\s*(?:[-*+]\s+|\d+\.\s+)/;
const RE_NOTA = /^(['’¹²³⊗]|Información|información|Fuente|García, 2004|Consumo de MS|Elaborado por)/;

/** Indica si la línea inicia un bloque que no debe unirse con la anterior. */
function esBloque(linea) {
  const t = linea.trim();
  return (
    t === "" ||
    t.startsWith("#") ||
    t.startsWith("<") ||
    t.startsWith("$$") ||
    t.startsWith("![") ||
    esLineaTabla(t) ||
    RE_LISTA.test(linea) ||
    /^Tabla( \d+\.|:)/.test(t)
  );
}

/** Indica si una línea es parte de una tabla GFM. */
function esLineaTabla(linea) {
  const t = linea.trim();
  return t.startsWith("|") || /\s\|\s/.test(t) || (/^[-:| ]+$/.test(t) && t.includes("|"));
}

/** Normaliza espacios, viñetas, saltos de página y bloques de ecuaciones de una línea. */
function normalizarLineas(lineas, guia) {
  const salida = [];
  for (const original of lineas) {
    let linea = original.replace(/\s+$/u, "");
    if (linea.trim() === "---" || /^<br\s*\/?>$/.test(linea.trim())) {
      salida.push("");
      continue;
    }
    if (guia.piePagina && guia.piePagina.test(linea)) {
      salida.push("");
      continue;
    }
    linea = linea.replace(/^\s*•\s*/u, "- ");
    if (!RE_LISTA.test(linea)) linea = linea.replace(/^\s+/u, "");
    linea = linea.replace(/\t+/g, " ").replace(/(\S) {2,}/g, "$1 ");
    const enLinea = linea.match(/^\$\$\s*(.+?)\s*\$\$$/);
    if (enLinea) {
      salida.push("$$", enLinea[1], "$$");
      continue;
    }
    salida.push(linea);
  }
  return salida;
}

/** Une los renglones partidos de un mismo párrafo (texto proveniente de PDF). */
function unirParrafos(lineas, capitulo) {
  const salida = [];
  let enMatematica = false;
  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i];
    if (linea.trim() === "$$") {
      enMatematica = !enMatematica;
      salida.push(linea);
      continue;
    }
    if (enMatematica) {
      salida.push(linea);
      continue;
    }
    const previa = salida.length > 0 ? salida[salida.length - 1] : "";
    const previaUnible =
      previa.trim() !== "" &&
      !previa.trim().startsWith("#") &&
      !previa.trim().startsWith("<") &&
      !previa.trim().startsWith("$$") &&
      !previa.trim().startsWith("![") &&
      !esLineaTabla(previa);
    if (linea.trim() !== "" && !esBloque(linea) && previaUnible) {
      if (previa.length > 140 && /[.:;]$/.test(previa)) {
        salida.push("", linea);
        continue;
      }
      const sinEspacio = /\p{L}-$/u.test(previa) && /^\p{L}/u.test(linea);
      salida[salida.length - 1] = sinEspacio ? previa + linea.trim() : `${previa} ${linea.trim()}`;
      continue;
    }
    if (capitulo.reflujo && linea.trim() === "" && previaUnible && !RE_LISTA.test(previa) && !RE_NOTA.test(previa.trim())) {
      if (/[\p{L}\p{N},;-]$/u.test(previa)) {
        let j = i;
        while (j < lineas.length && lineas[j].trim() === "") j++;
        if (j < lineas.length && !esBloque(lineas[j])) {
          salida[salida.length - 1] = `${previa} ${lineas[j].trim()}`;
          i = j;
          continue;
        }
      }
    }
    salida.push(linea);
  }
  return salida;
}

/** Limpia el texto de un encabezado y devuelve su versión en estilo oración. */
function textoEncabezado(texto) {
  return oracion(texto.replace(/<\/?u>/g, "").replace(/\*\*/g, "").replace(/[.:]\s*$/, "").trim());
}

/** Convierte encabezados reales y falsos (negritas o subrayados aislados) con niveles coherentes. */
function convertirEncabezados(lineas, capitulo) {
  const salida = [];
  let ultimoReal = 1;
  let enMatematica = false;
  for (const linea of lineas) {
    if (linea.trim() === "$$") enMatematica = !enMatematica;
    if (enMatematica || linea.trim() === "$$") {
      salida.push(linea);
      continue;
    }
    const real = linea.match(/^(#{1,6})\s+(.*)$/);
    if (real) {
      const nivel = Math.min(6, Math.max(2, real[1].length + capitulo.desplazamiento));
      ultimoReal = nivel;
      salida.push(`${"#".repeat(nivel)} ${textoEncabezado(real[2])}`);
      continue;
    }
    const subrayado = linea.match(/^<u>(.+)<\/u>\s*(.*)$/);
    const negrita = linea.match(/^\*\*([^*]+)\*\*$/);
    const falso =
      (subrayado && (subrayado[2] === "" || /^\(.*\)$/.test(subrayado[2])) && subrayado) ||
      (negrita && negrita[1].length <= 90 && !negrita[1].startsWith("(") && !/:\s*$/.test(negrita[1]) && negrita);
    if (falso) {
      const nivel = Math.min(ultimoReal + 1, 4);
      const extra = subrayado && subrayado[2] ? ` ${subrayado[2]}` : "";
      salida.push(`${"#".repeat(nivel)} ${textoEncabezado(falso[1])}${extra}`);
      continue;
    }
    salida.push(linea.replace(/<u>(.+?)<\/u>/g, "**$1**"));
  }
  return salida;
}

/** Envuelve en <Steps> la lista que sigue a un encabezado de procedimiento. */
function marcarPasos(lineas) {
  const salida = [];
  let i = 0;
  while (i < lineas.length) {
    const linea = lineas[i];
    salida.push(linea);
    i++;
    if (!/^#{2,6}\s+procedimiento/i.test(linea)) continue;
    let j = i;
    while (j < lineas.length && lineas[j].trim() === "") j++;
    if (j >= lineas.length || !RE_LISTA.test(lineas[j]) || /^\s/.test(lineas[j])) continue;
    const lista = [];
    let k = j;
    while (k < lineas.length) {
      const actual = lineas[k];
      if (actual.trim() === "") {
        let m = k;
        while (m < lineas.length && lineas[m].trim() === "") m++;
        if (m < lineas.length && (RE_LISTA.test(lineas[m]) || /^\s+\S/.test(lineas[m]))) {
          k = m;
          continue;
        }
        break;
      }
      if (!RE_LISTA.test(actual) && !/^\s+\S/.test(actual)) break;
      lista.push(actual);
      k++;
    }
    let numero = null;
    const numerada = lista.map((item) => {
      const ordenada = item.match(/^(\d+)\.\s+(.*)$/);
      if (ordenada) {
        numero = Number(ordenada[1]);
        return `${numero}. ${ordenada[2]}`;
      }
      const vineta = item.match(/^[-*+]\s+(.*)$/);
      if (vineta) {
        numero = numero === null ? 1 : numero + 1;
        return `${numero}. ${vineta[1]}`;
      }
      return item;
    });
    salida.push("", "<Steps>", "", ...numerada, "", "</Steps>", "");
    i = k;
  }
  return salida;
}

/** Devuelve el texto como literal de cadena JSX seguro. */
function cadenaJsx(texto) {
  return `{${JSON.stringify(texto)}}`;
}

/** Convierte los títulos «Tabla N.» seguidos de una tabla GFM en <DataTable caption>. */
function convertirTablas(lineas, capitulo) {
  const salida = [];
  let i = 0;
  let tablas = 0;
  while (i < lineas.length) {
    const linea = lineas[i];
    const titulo = linea.trim().match(/^Tabla(?: (\d+)\.|:)\s*(.*)$/);
    if (!titulo) {
      salida.push(linea);
      i++;
      continue;
    }
    let j = i + 1;
    while (j < lineas.length && lineas[j].trim() === "") j++;
    if (j + 1 >= lineas.length || !esLineaTabla(lineas[j]) || !/^\|?\s*:?-{3,}/.test(lineas[j + 1].trim())) {
      salida.push(linea);
      i++;
      continue;
    }
    const filas = [];
    while (j < lineas.length && lineas[j].trim() !== "" && esLineaTabla(lineas[j])) {
      filas.push(lineas[j].trim());
      j++;
    }
    let k = j;
    while (k < lineas.length && lineas[k].trim() === "") k++;
    const notas = [];
    if (k < lineas.length && RE_NOTA.test(lineas[k].trim())) {
      notas.push(lineas[k].trim());
      j = k + 1;
    }
    const texto = titulo[1] ? `Tabla ${titulo[1]}. ${titulo[2]}` : titulo[2];
    salida.push("", `<DataTable caption=${cadenaJsx(texto.trim())}>`, "", ...filas, "");
    if (notas.length > 0) salida.push(...notas, "");
    salida.push("</DataTable>", "");
    tablas++;
    i = j;
  }
  capitulo.tablas = tablas;
  return salida;
}

/** Normaliza la clave de una imagen a partir de su nombre de archivo. */
function claveImagen(archivo) {
  return path.parse(archivo).name.toLowerCase().replace(/_/g, "-");
}

/** Convierte las imágenes Markdown en <Figure> con texto alternativo y pie de figura. */
function convertirFiguras(lineas, capitulo) {
  const usadas = new Set();
  const salida = lineas.flatMap((linea) => {
    const m = linea.trim().match(/^!\[(.*?)\]\((?:\.\/)?img\/([^)\s]+)\)$/);
    if (!m) return [linea];
    const clave = claveImagen(m[2]);
    const alt = ALT[clave];
    if (!alt) throw new Error(`Falta el texto alternativo de la imagen «${clave}»`);
    usadas.add(clave);
    const pie = m[1].replace(/\s+/g, " ").trim();
    return ["", `<Figure src={img[${JSON.stringify(clave)}]} alt=${cadenaJsx(alt)} caption=${cadenaJsx(pie)} />`, ""];
  });
  capitulo.imagenes = [...usadas];
  return salida;
}

/** Envuelve cada bloque de ecuación en <Formula>. */
function convertirFormulas(lineas) {
  const salida = [];
  let enMatematica = false;
  for (const linea of lineas) {
    if (linea.trim() === "$$") {
      if (!enMatematica) salida.push("", "<Formula>", "", "$$");
      else salida.push("$$", "", "</Formula>", "");
      enMatematica = !enMatematica;
      continue;
    }
    salida.push(linea);
  }
  if (enMatematica) throw new Error("Bloque de ecuación sin cerrar");
  return salida;
}

/** Escapa `{`, `}` y `<` fuera de las ecuaciones y de las etiquetas JSX (requisito de MDX). */
function escaparMdx(lineas) {
  let enMatematica = false;
  return lineas.map((linea) => {
    if (linea.trim() === "$$") {
      enMatematica = !enMatematica;
      return linea;
    }
    if (enMatematica || /^\s*<\/?[A-Z][A-Za-z]*[\s>/]/.test(linea) || /^\s*<\/?[A-Z][A-Za-z]*$/.test(linea)) {
      return linea;
    }
    return linea
      .split(/(\$[^$\n]+\$)/)
      .map((parte, k) => (k % 2 === 1 ? parte : parte.replace(/([{}<])/g, "\\$1")))
      .join("");
  });
}

/** Quita líneas en blanco repetidas y asegura una línea en blanco alrededor de cada bloque JSX. */
function compactar(lineas) {
  const salida = [];
  for (const linea of lineas) {
    const vacia = linea.trim() === "";
    if (vacia && (salida.length === 0 || salida[salida.length - 1].trim() === "")) continue;
    salida.push(linea);
  }
  while (salida.length > 0 && salida[salida.length - 1].trim() === "") salida.pop();
  return salida;
}

/** Cuenta las palabras legibles de un capítulo para estimar el tiempo de lectura. */
function contarPalabras(lineas) {
  let enMatematica = false;
  let total = 0;
  for (const linea of lineas) {
    if (linea.trim() === "$$") {
      enMatematica = !enMatematica;
      continue;
    }
    if (enMatematica || /^\s*<\/?[A-Z]/.test(linea) || /^import /.test(linea)) continue;
    total += (linea.match(/[\p{L}\p{N}]+/gu) ?? []).length;
  }
  return total;
}

/** Valida la longitud de las descripciones de metadatos (SEO). */
function validarDescripcion(texto, contexto) {
  const n = [...texto].length;
  if (n < 140 || n > 160) throw new Error(`La descripción de ${contexto} tiene ${n} caracteres (140–160)`);
}

/** Construye el contenido MDX completo de un capítulo. */
function construirMdx(capitulo, cuerpo) {
  const usados = COMPONENTES.filter((c) => cuerpo.some((l) => l.includes(`<${c}`)));
  const cabecera = [
    "---",
    `titulo: ${JSON.stringify(capitulo.titulo)}`,
    `descripcion: ${JSON.stringify(capitulo.descripcion)}`,
    "---",
    "",
  ];
  if (usados.length > 0) cabecera.push(`import { ${usados.join(", ")} } from "${RUTA_COMPONENTES}";`);
  if (capitulo.imagenes.length > 0) cabecera.push('import { imagenes as img } from "./imagenes";');
  if (usados.length > 0 || capitulo.imagenes.length > 0) cabecera.push("");
  return `${[...cabecera, ...cuerpo].join("\n")}\n`;
}

/** Construye el archivo `_meta.ts` de una guía. */
function construirMeta(guia, capitulos, palabras) {
  const minutos = Math.max(1, Math.round(palabras / PALABRAS_POR_MINUTO));
  const items = capitulos
    .map(
      (c, k) =>
        `    {\n      slug: ${JSON.stringify(c.slug)},\n      archivo: ${JSON.stringify(c.archivo)},\n      titulo: ${JSON.stringify(c.titulo)},\n      descripcion: ${JSON.stringify(c.descripcion)},\n      orden: ${k + 1},\n    },`,
    )
    .join("\n");
  return `import type { MetaGuia } from "../tipos";\n\n/** Capítulos de la guía, generados inicialmente por scripts/convert-qmd.mjs. */\nexport const meta: MetaGuia = {\n  tiempoLecturaMin: ${minutos},\n  capitulos: [\n${items}\n  ],\n};\n`;
}

/** Procesa una guía completa y devuelve los archivos a escribir. */
async function procesarGuia(guia) {
  const ruta = path.join(FUENTE, guia.fuente);
  const bruto = (await readFile(ruta, "utf8")).replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  const sinFrontmatter = bruto.replace(/^---\n[\s\S]*?\n---\n/, "");
  const normalizado = sinFrontmatter
    .split("\n")
    .map((l) => l.replace(/\s+$/u, "").replace(/(\S)\t+/g, "$1 "))
    .join("\n");
  const corregido = aplicarCorrecciones(normalizado, guia.correcciones, guia.slug);
  const conTabla = corregido.split("TABLA_10_URL").join(URL_TABLA_10);
  const partes = dividirCapitulos(conTabla.split("\n"), guia.capitulos, guia.slug);
  const archivos = new Map();
  const capitulos = [];
  let palabras = 0;
  for (const [k, { capitulo, lineas }] of partes.entries()) {
    validarDescripcion(capitulo.descripcion, `${guia.slug}/${capitulo.slug}`);
    const datos = { ...capitulo, imagenes: [], tablas: 0 };
    let cuerpo = normalizarLineas(lineas, guia);
    cuerpo = unirParrafos(cuerpo, capitulo);
    cuerpo = convertirEncabezados(cuerpo, capitulo);
    cuerpo = marcarPasos(cuerpo);
    cuerpo = convertirTablas(cuerpo, datos);
    cuerpo = convertirFiguras(cuerpo, datos);
    cuerpo = convertirFormulas(cuerpo);
    cuerpo = escaparMdx(cuerpo);
    cuerpo = compactar(cuerpo);
    palabras += contarPalabras(cuerpo);
    const archivo = `${String(k + 1).padStart(2, "0")}-${capitulo.slug}.mdx`;
    archivos.set(path.join(DESTINO, guia.slug, archivo), construirMdx(datos, cuerpo));
    capitulos.push({ ...capitulo, archivo, tablas: datos.tablas, imagenes: datos.imagenes });
  }
  archivos.set(path.join(DESTINO, guia.slug, "_meta.ts"), construirMeta(guia, capitulos, palabras));
  return { archivos, capitulos, palabras };
}

/** Escribe un archivo solo si su contenido cambió; devuelve true si hubo cambio. */
async function escribirSiCambia(ruta, contenido) {
  const actual = existsSync(ruta) ? await readFile(ruta, "utf8") : null;
  if (actual === contenido) return false;
  if (!COMPROBAR) {
    await mkdir(path.dirname(ruta), { recursive: true });
    await writeFile(ruta, contenido, "utf8");
  }
  return true;
}

/** Elimina los MDX obsoletos de la carpeta de una guía. */
async function limpiarObsoletos(carpeta, vigentes) {
  if (!existsSync(carpeta)) return [];
  const eliminados = [];
  for (const nombre of await readdir(carpeta)) {
    const ruta = path.join(carpeta, nombre);
    if (nombre.endsWith(".mdx") && !vigentes.has(ruta)) {
      if (!COMPROBAR) await unlink(ruta);
      eliminados.push(ruta);
    }
  }
  return eliminados;
}

/** Punto de entrada. */
async function principal() {
  if (!existsSync(FUENTE)) {
    console.log(
      `convert-qmd: no se encontraron las fuentes QMD en ${path.relative(RAIZ, FUENTE) || FUENTE}. ` +
        "Los MDX de src/content/guias son la fuente de verdad; no hay nada que convertir.",
    );
    return;
  }
  let cambios = 0;
  for (const guia of GUIAS) {
    const { archivos, capitulos, palabras } = await procesarGuia(guia);
    for (const [ruta, contenido] of archivos) {
      if (await escribirSiCambia(ruta, contenido)) {
        cambios++;
        console.log(`${COMPROBAR ? "difiere" : "escrito"}: ${path.relative(RAIZ, ruta)}`);
      }
    }
    const eliminados = await limpiarObsoletos(path.join(DESTINO, guia.slug), new Set(archivos.keys()));
    cambios += eliminados.length;
    for (const ruta of eliminados) console.log(`${COMPROBAR ? "sobra" : "eliminado"}: ${path.relative(RAIZ, ruta)}`);
    const tablas = capitulos.reduce((n, c) => n + c.tablas, 0);
    console.log(`${guia.slug}: ${capitulos.length} capítulos, ${tablas} tablas con título, ${palabras} palabras.`);
  }
  if (COMPROBAR && cambios > 0) abortar(`${cambios} archivo(s) no coinciden con la conversión.`);
  console.log(cambios === 0 ? "Sin cambios: la conversión ya estaba al día." : `${cambios} archivo(s) actualizados.`);
}

principal().catch((error) => abortar("la conversión falló.", error));
