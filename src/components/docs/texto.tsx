import { Fragment, type ReactNode } from "react";

/** Convierte los fragmentos `*texto*` de una cadena en cursivas (nombres científicos en títulos). */
export function textoEnriquecido(texto: string): ReactNode {
  if (!texto.includes("*")) return texto;
  const partes = texto.split(/(\*[^*]+\*)/g);
  return partes.map((parte, indice) =>
    /^\*[^*]+\*$/.test(parte) ? (
      <em key={indice}>{parte.slice(1, -1)}</em>
    ) : (
      <Fragment key={indice}>{parte}</Fragment>
    ),
  );
}

/** Quita las marcas de cursiva para usos de solo texto (atributos, títulos de página). */
export function textoPlano(texto: string): string {
  return texto.replace(/\*([^*]+)\*/g, "$1");
}
