export interface FuenteImagen {
  ancho: number;
  url: string;
}

export interface ImagenGuia {
  ancho: number;
  alto: number;
  fuentes: FuenteImagen[];
  src: string;
}

export type TipoCallout = "nota" | "advertencia" | "seguridad" | "importante";
