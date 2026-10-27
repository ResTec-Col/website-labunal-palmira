import { Link } from "react-router";
import { ChevronRight } from "lucide-react";
import type { Miga } from "../../lib/seo";

export function Breadcrumbs({ migas }: { migas: Miga[] }) {
  if (migas.length === 0) return null;

  return (
    <nav aria-label="Ruta de navegación" className="no-imprimir mb-6 text-sm">
      <ol className="m-0 flex list-none flex-wrap items-center gap-1 p-0 text-text-subtle">
        {migas.map((miga, indice) => {
          const ultima = indice === migas.length - 1;
          return (
            <li key={miga.ruta} className="inline-flex items-center gap-1">
              {ultima ? (
                <span aria-current="page" className="text-text-muted">
                  {miga.nombre}
                </span>
              ) : (
                <>
                  <Link to={miga.ruta} className="text-text-subtle no-underline hover:text-accent hover:underline">
                    {miga.nombre}
                  </Link>
                  <ChevronRight aria-hidden="true" className="size-3.5" />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
