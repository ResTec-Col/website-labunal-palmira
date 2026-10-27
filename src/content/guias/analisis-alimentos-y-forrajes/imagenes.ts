import type { ImagenGuia } from "../../../components/docs/tipos";
import exactitudPrecisionW347 from "./img/exactitud-precision-347.webp";
import errorAbsolutoW389 from "./img/error-absoluto-389.webp";
import principioLiofilizacionW572 from "./img/principio-liofilizacion-572.webp";
import aparatoExtraccionW124 from "./img/aparato-extraccion-124.webp";
import calorimetroW480 from "./img/calorimetro-480.webp";
import calorimetroW837 from "./img/calorimetro-837.webp";

/** Imágenes optimizadas de la guía, generadas por scripts/optimize-images.mjs. */
export const imagenes: Record<string, ImagenGuia> = {
  "exactitud-precision": {
    ancho: 347,
    alto: 334,
    fuentes: [{ ancho: 347, url: exactitudPrecisionW347 }],
    src: exactitudPrecisionW347,
  },
  "error-absoluto": {
    ancho: 389,
    alto: 262,
    fuentes: [{ ancho: 389, url: errorAbsolutoW389 }],
    src: errorAbsolutoW389,
  },
  "principio-liofilizacion": {
    ancho: 572,
    alto: 456,
    fuentes: [{ ancho: 572, url: principioLiofilizacionW572 }],
    src: principioLiofilizacionW572,
  },
  "aparato-extraccion": {
    ancho: 124,
    alto: 257,
    fuentes: [{ ancho: 124, url: aparatoExtraccionW124 }],
    src: aparatoExtraccionW124,
  },
  "calorimetro": {
    ancho: 837,
    alto: 583,
    fuentes: [{ ancho: 480, url: calorimetroW480 }, { ancho: 837, url: calorimetroW837 }],
    src: calorimetroW837,
  },
};
