import {
  Children,
  cloneElement,
  createElement,
  isValidElement,
  useId,
  type ReactElement,
  type ReactNode,
} from "react";
import { textoEnriquecido } from "./texto";

interface DataTableProps {
  caption: string;
  children?: ReactNode;
}

type PropsElemento = { children?: ReactNode } & Record<string, unknown>;

/** Indica si el nodo es un elemento HTML del tipo indicado. */
function esElemento(nodo: ReactNode, tipo: string): nodo is ReactElement<PropsElemento> {
  return isValidElement(nodo) && nodo.type === tipo;
}

/** Añade `scope="col"` a las celdas de encabezado de la fila de títulos. */
function encabezadoConAlcance(fila: ReactNode): ReactNode {
  if (!esElemento(fila, "tr")) return fila;
  return cloneElement(
    fila,
    undefined,
    Children.map(fila.props.children, (celda) =>
      esElemento(celda, "th") ? cloneElement(celda, { scope: "col" }) : celda,
    ),
  );
}

/** Convierte la primera celda de cada fila del cuerpo en encabezado de fila (`scope="row"`). */
function cuerpoConAlcance(fila: ReactNode): ReactNode {
  if (!esElemento(fila, "tr")) return fila;
  let primera = true;
  return cloneElement(
    fila,
    undefined,
    Children.map(fila.props.children, (celda) => {
      if (!primera || !esElemento(celda, "td")) return celda;
      primera = false;
      return createElement("th", { ...celda.props, scope: "row" });
    }),
  );
}

/** Recorre la tabla generada por Markdown y añade el `caption` y los alcances de encabezado. */
function tablaAccesible(tabla: ReactElement<PropsElemento>, caption: ReactNode): ReactNode {
  const secciones = Children.map(tabla.props.children, (seccion) => {
    if (esElemento(seccion, "thead")) {
      return cloneElement(seccion, undefined, Children.map(seccion.props.children, encabezadoConAlcance));
    }
    if (esElemento(seccion, "tbody")) {
      return cloneElement(seccion, undefined, Children.map(seccion.props.children, cuerpoConAlcance));
    }
    return seccion;
  });
  return cloneElement(tabla, undefined, caption, secciones);
}

/** Tabla de datos de una guía con título accesible (`<caption>`), desplazamiento horizontal y notas. */
export function DataTable({ caption, children }: DataTableProps) {
  const id = useId();
  const hijos = Children.toArray(children);
  const indiceTabla = hijos.findIndex((hijo) => esElemento(hijo, "table"));
  const titulo = (
    <caption id={id} key="caption">
      {textoEnriquecido(caption)}
    </caption>
  );

  if (indiceTabla < 0) {
    return (
      <div className="my-6">
        <p className="m-0 font-semibold">{textoEnriquecido(caption)}</p>
        {hijos}
      </div>
    );
  }

  const tabla = hijos[indiceTabla] as ReactElement<PropsElemento>;
  const notas = hijos.filter((_, indice) => indice !== indiceTabla);

  return (
    <div className="my-6">
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- región desplazable: debe recibir foco con el teclado */}
      <div className="tabla-contenedor" role="region" aria-labelledby={id} tabIndex={0}>
        {tablaAccesible(tabla, titulo)}
      </div>
      {notas.length > 0 ? (
        <div className="mt-2 text-sm text-text-subtle [&>p]:my-1">{notas}</div>
      ) : null}
    </div>
  );
}
