import { Link } from "react-router";
import { Code2, FlaskConical, Mail, Scale, Users } from "lucide-react";
import { Seo } from "../components/Seo";
import { ExternalLink } from "../components/ExternalLink";
import { Breadcrumbs } from "../components/layout/Breadcrumbs";
import { jsonLdMigas, type Miga } from "../lib/seo";
import { ENLACES, VERSION_SITIO } from "../lib/sitio";

const DESCRIPCION =
  "Conoce el Laboratorio de Nutrición Animal de la Universidad Nacional de Colombia, Sede Palmira: equipo docente, contacto, créditos y licencia de este sitio.";

const MIGAS: Miga[] = [
  { nombre: "Inicio", ruta: "/" },
  { nombre: "Acerca", ruta: "/acerca/" },
];

const EQUIPO = [
  {
    nombre: "Pascal Leterme",
    cargo: "I.A., Ph.D., profesor asociado",
    aporte: "Autor de la guía Análisis de alimentos y forrajes",
  },
  {
    nombre: "Fernando Estrada",
    cargo: "I.A. Esp., analista",
    aporte: "Autor de la guía Análisis de alimentos y forrajes",
  },
  {
    nombre: "Luz Stella Muñoz Arboleda",
    cargo: "Profesora asociada, Departamento de Ciencia Animal",
    aporte: "Autora de la guía Composición química de los alimentos",
  },
];

export default function Acerca() {
  return (
    <div className="contenedor py-10">
      <Seo title="Acerca del laboratorio" description={DESCRIPCION} path="/acerca/" jsonLd={jsonLdMigas(MIGAS)} />
      <Breadcrumbs migas={MIGAS} />
      <h1 className="m-0 text-3xl md:text-4xl">Acerca del laboratorio</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-10">
          <section aria-labelledby="titulo-laboratorio">
            <h2 id="titulo-laboratorio" className="m-0 flex items-center gap-2 text-2xl">
              <FlaskConical aria-hidden="true" className="size-5 text-secondary" />
              El laboratorio
            </h2>
            <p className="mt-4 mb-0 max-w-[65ch] text-text-muted">
              El Laboratorio de Nutrición Animal pertenece a la Facultad de Ciencias Agropecuarias de la
              Universidad Nacional de Colombia, Sede Palmira. Apoya la docencia, la investigación y la
              extensión con el análisis químico de alimentos y forrajes: materia seca, cenizas, extracto
              etéreo, proteína cruda, fracciones de fibra de Van Soest y energía bruta.
            </p>
            <p className="mt-3 mb-0 max-w-[65ch] text-text-muted">
              En este sitio se publican las <Link to="/guias/">guías de laboratorio</Link>, las{" "}
              <Link to="/plantillas/">plantillas de registro</Link> y el acceso a la{" "}
              <Link to="/app/">app de datos y NutriBot</Link>.
            </p>
          </section>

          <section aria-labelledby="titulo-equipo">
            <h2 id="titulo-equipo" className="m-0 flex items-center gap-2 text-2xl">
              <Users aria-hidden="true" className="size-5 text-secondary" />
              Equipo docente
            </h2>
            <ul className="m-0 mt-4 grid list-none gap-4 p-0 sm:grid-cols-2">
              {EQUIPO.map((persona) => (
                <li key={persona.nombre} className="tarjeta">
                  <p className="m-0 font-semibold">{persona.nombre}</p>
                  <p className="m-0 mt-1 text-sm text-text-muted">{persona.cargo}</p>
                  <p className="m-0 mt-2 text-sm text-text-subtle">{persona.aporte}</p>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="titulo-creditos">
            <h2 id="titulo-creditos" className="m-0 flex items-center gap-2 text-2xl">
              <Code2 aria-hidden="true" className="size-5 text-secondary" />
              Créditos del sitio
            </h2>
            <p className="mt-4 mb-0 max-w-[65ch] text-text-muted">
              Sitio creado por el Laboratorio de Nutrición Animal UNAL Palmira y{" "}
              <ExternalLink href={ENLACES.restec} icono={false}>
                Resilient Technologies S.A.S
              </ExternalLink>
              . Está construido con React y se publica como páginas estáticas, sin rastreadores ni
              servicios de terceros.
            </p>
            <p className="mt-3 mb-0">
              <ExternalLink href={ENLACES.repositorio}>Código fuente en GitHub</ExternalLink>
            </p>
          </section>
        </div>

        <aside aria-label="Contacto y licencia" className="flex flex-col gap-4 self-start">
          <section aria-labelledby="titulo-contacto" className="tarjeta">
            <h2 id="titulo-contacto" className="m-0 flex items-center gap-2 text-lg">
              <Mail aria-hidden="true" className="size-4 text-accent" />
              Contacto
            </h2>
            <p className="mt-3 mb-0 text-text-muted">
              Universidad Nacional de Colombia, Sede Palmira. Carrera 32 n.º 12-00, Palmira, Valle del
              Cauca.
            </p>
            <ExternalLink href={ENLACES.unalPalmira} className="mt-3 font-semibold">
              palmira.unal.edu.co
            </ExternalLink>
          </section>
          <section aria-labelledby="titulo-licencia" className="tarjeta">
            <h2 id="titulo-licencia" className="m-0 flex items-center gap-2 text-lg">
              <Scale aria-hidden="true" className="size-4 text-accent" />
              Licencia
            </h2>
            <p className="mt-3 mb-0 text-text-muted">
              El código del sitio se distribuye con licencia MIT. Los contenidos de las guías pertenecen a
              sus autores y a la Universidad Nacional de Colombia.
            </p>
            <p className="mt-3 mb-0 text-sm text-text-subtle">Versión {VERSION_SITIO}</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
