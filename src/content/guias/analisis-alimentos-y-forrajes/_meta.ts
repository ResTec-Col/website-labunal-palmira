import type { MetaGuia } from "../tipos";

/** Capítulos de la guía, generados inicialmente por scripts/convert-qmd.mjs. */
export const meta: MetaGuia = {
  tiempoLecturaMin: 33,
  capitulos: [
    {
      slug: "introduccion",
      archivo: "01-introduccion.mdx",
      titulo: "Introducción",
      descripcion: "El esquema de Weende y las fracciones que estima en los alimentos para animales: proteína bruta, cenizas, extracto etéreo, fibra bruta y extracto libre de N.",
      orden: 1,
    },
    {
      slug: "generalidades",
      archivo: "02-generalidades.mdx",
      titulo: "Generalidades de los métodos analíticos",
      descripcion: "Criterios para elegir un método analítico, tipos de error en los análisis químicos y buenas prácticas de recolección, secado y molienda de las muestras.",
      orden: 2,
    },
    {
      slug: "materia-seca",
      archivo: "03-materia-seca.mdx",
      titulo: "Materia seca",
      descripcion: "Protocolo para determinar la materia seca inicial a 60 °C, la materia seca analítica a 105 °C y la materia seca total de alimentos húmedos como los forrajes.",
      orden: 3,
    },
    {
      slug: "liofilizacion",
      archivo: "04-liofilizacion.mdx",
      titulo: "Liofilización",
      descripcion: "Secado de muestras frágiles por sublimación del agua: principio del método según el diagrama de fases, material necesario y procedimiento con el liofilizador.",
      orden: 4,
    },
    {
      slug: "cenizas",
      archivo: "05-cenizas.mdx",
      titulo: "Cenizas",
      descripcion: "Determinación gravimétrica de las cenizas totales por incineración en mufla a 550–600 °C: material, procedimiento y cálculo según el método AOAC 942.05.",
      orden: 5,
    },
    {
      slug: "extracto-etereo",
      archivo: "06-extracto-etereo.mdx",
      titulo: "Extracto etéreo",
      descripcion: "Extracción de la grasa libre con el aparato de Soxhlet y de la grasa total con hidrólisis ácida previa: material, procedimiento y cálculo del extracto etéreo.",
      orden: 6,
    },
    {
      slug: "proteina",
      archivo: "07-proteina.mdx",
      titulo: "Proteína bruta",
      descripcion: "Método de Kjeldahl para la proteína bruta: digestión, destilación y titulación del nitrógeno, reactivos, cálculo del %N y factores de conversión a proteína.",
      orden: 7,
    },
    {
      slug: "fibras",
      archivo: "08-fibras.mdx",
      titulo: "Fibras (Van Soest)",
      descripcion: "Determinación de fibra detergente neutra, fibra detergente ácida y lignina por el método de Van Soest, con reactivos, precauciones de seguridad y fórmulas.",
      orden: 8,
    },
    {
      slug: "energia-bruta",
      archivo: "09-energia-bruta.mdx",
      titulo: "Energía bruta",
      descripcion: "Medición de la energía bruta con la bomba calorimétrica: principio del método, material necesario y armado de la cámara de combustión y del calorímetro.",
      orden: 9,
    },
  ],
};
