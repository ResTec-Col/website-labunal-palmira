import type { AnchorHTMLAttributes, ReactNode } from "react";
import { MDXProvider } from "@mdx-js/react";
import type { MDXComponents } from "mdx/types";
import { Callout } from "./Callout";
import { DataTable } from "./DataTable";
import { Figure } from "./Figure";
import { Formula } from "./Formula";
import { Steps } from "./Steps";

/** Enlace del contenido: los externos abren en otra pestaña con aviso accesible. */
function EnlaceContenido({ href, children, ...resto }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (href && /^https?:\/\//i.test(href)) {
    return (
      <a {...resto} href={href} target="_blank" rel="noopener noreferrer">
        {children}
        <span className="sr-only"> (abre en otra pestaña)</span>
      </a>
    );
  }
  return (
    <a {...resto} href={href}>
      {children}
    </a>
  );
}

export const componentesMdx: MDXComponents = {
  a: EnlaceContenido,
  Callout,
  DataTable,
  Figure,
  Formula,
  Steps,
};

/** Proveedor de los componentes que usan los capítulos MDX de las guías. */
export function ProveedorMdx({ children }: { children?: ReactNode }) {
  return <MDXProvider components={componentesMdx}>{children}</MDXProvider>;
}
