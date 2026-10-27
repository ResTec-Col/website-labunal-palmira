import { Link } from "react-router";
import { ENLACES, NAVEGACION, PLANTILLAS, VERSION_SITIO } from "../../lib/sitio";
import { ExternalLink } from "../ExternalLink";

export function SiteFooter() {
  return (
    <footer role="contentinfo" className="mt-16 border-t border-border bg-surface">
      <div className="contenedor grid gap-8 py-10 text-sm text-text-muted md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <p className="m-0 font-semibold text-text">Laboratorio de Nutrición Animal</p>
          <p className="m-0">
            Universidad Nacional de Colombia, Sede Palmira. Facultad de Ciencias Agropecuarias.
          </p>
          <ExternalLink href={ENLACES.unalPalmira} className="w-fit">
            palmira.unal.edu.co
          </ExternalLink>
        </div>
        <nav aria-label="Pie de página" className="flex flex-col gap-2">
          <p className="m-0 font-semibold text-text">Secciones</p>
          <ul className="m-0 grid list-none grid-cols-2 gap-x-4 gap-y-1.5 p-0">
            {NAVEGACION.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="text-text-muted no-underline hover:text-accent hover:underline">
                  {item.texto}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={PLANTILLAS.especies}
                download
                className="text-text-muted no-underline hover:text-accent hover:underline"
              >
                Plantilla de especies
              </a>
            </li>
            <li>
              <a
                href={PLANTILLAS.subproductos}
                download
                className="text-text-muted no-underline hover:text-accent hover:underline"
              >
                Plantilla de subproductos
              </a>
            </li>
          </ul>
        </nav>
        <div className="flex flex-col gap-2">
          <p className="m-0 font-semibold text-text">Créditos</p>
          <p className="m-0">
            Creado por Laboratorio de Nutrición Animal UNAL Palmira y{" "}
            <ExternalLink href={ENLACES.restec} icono={false}>
              Resilient Technologies S.A.S
            </ExternalLink>
            .
          </p>
          <ExternalLink href={ENLACES.repositorio} className="w-fit">
            Código fuente en GitHub
          </ExternalLink>
          <p className="m-0 text-text-subtle">Licencia MIT · Versión {VERSION_SITIO}</p>
        </div>
      </div>
    </footer>
  );
}
