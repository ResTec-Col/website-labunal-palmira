import { Link } from "react-router";
import { BookOpen, FileSpreadsheet, Home } from "lucide-react";
import { Seo } from "./Seo";

export function ContenidoNoEncontrado() {
  return (
    <div className="contenedor py-16">
      <Seo
        title="Página no encontrada"
        description="La página que buscas no existe o cambió de dirección. Vuelve al inicio o consulta las guías y plantillas del Laboratorio de Nutrición Animal."
        path="/404/"
        noindex
      />
      <p className="etiqueta">Error 404</p>
      <h1 className="mt-4 mb-0 text-3xl md:text-4xl">Página no encontrada</h1>
      <p className="mt-3 max-w-[60ch] text-lg text-text-muted">
        La página que buscas no existe o cambió de dirección. Estos enlaces pueden ayudarte:
      </p>
      <ul className="m-0 mt-6 flex list-none flex-wrap gap-3 p-0">
        <li>
          <Link to="/" className="boton boton-primario">
            <Home aria-hidden="true" className="size-4" />
            Ir al inicio
          </Link>
        </li>
        <li>
          <Link to="/guias/" className="boton boton-secundario">
            <BookOpen aria-hidden="true" className="size-4" />
            Guías de laboratorio
          </Link>
        </li>
        <li>
          <Link to="/plantillas/" className="boton boton-secundario">
            <FileSpreadsheet aria-hidden="true" className="size-4" />
            Plantillas
          </Link>
        </li>
      </ul>
    </div>
  );
}

