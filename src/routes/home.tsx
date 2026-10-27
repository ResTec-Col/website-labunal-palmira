import { Link } from "react-router";
import { ArrowRight, BookOpen, Bot, FileSpreadsheet, FlaskConical } from "lucide-react";
import { Seo } from "../components/Seo";
import { ExternalLink } from "../components/ExternalLink";
import { jsonLdOrganizacion } from "../lib/seo";
import { ENLACES, SITIO } from "../lib/sitio";

const ANALISIS = [
  { sigla: "MS", nombre: "Materia seca", metodo: "Secado en estufa a 60 °C y 105 °C" },
  { sigla: "Cen", nombre: "Cenizas", metodo: "Incineración en mufla a 550–600 °C" },
  { sigla: "EE", nombre: "Extracto etéreo", metodo: "Extracción Soxhlet" },
  { sigla: "PC", nombre: "Proteína cruda", metodo: "Kjeldahl (N × 6,25)" },
  { sigla: "FDN", nombre: "Fibra detergente neutra", metodo: "Van Soest" },
  { sigla: "FDA", nombre: "Fibra detergente ácida", metodo: "Van Soest" },
  { sigla: "LDA", nombre: "Lignina detergente ácida", metodo: "Van Soest" },
  { sigla: "EB", nombre: "Energía bruta", metodo: "Bomba calorimétrica" },
];

const DESCRIPCION =
  "Guías de laboratorio, plantillas de registro y acceso a la app de datos bromatológicos y NutriBot del Laboratorio de Nutrición Animal de la UNAL Palmira.";

export default function Inicio() {
  return (
    <>
      <Seo description={DESCRIPCION} path="/" jsonLd={jsonLdOrganizacion()} />

      <section className="border-b border-border bg-surface">
        <div className="contenedor py-14 md:py-20">
          <p className="m-0 text-sm font-semibold tracking-wide text-secondary">{SITIO.facultad}</p>
          <h1 className="mt-3 mb-0 text-4xl md:text-5xl">Laboratorio de Nutrición Animal</h1>
          <p className="mt-3 mb-0 text-lg text-text-muted md:text-xl">
            Universidad Nacional de Colombia · Sede Palmira · Facultad de Ciencias Agropecuarias
          </p>
          <p className="mt-6 mb-0 max-w-[62ch] text-text-muted">
            Aquí encuentras las guías de laboratorio, las plantillas de registro de muestras y el acceso a
            la aplicación web para consultar los datos tomados en campo, útiles en la formulación y
            suplementación de especies animales.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/guias/" className="boton boton-primario">
              <BookOpen aria-hidden="true" className="size-4" />
              Ver guías de laboratorio
            </Link>
            <ExternalLink href={ENLACES.app} className="boton boton-secundario">
              Abrir la app de datos
            </ExternalLink>
          </div>
        </div>
      </section>

      <section aria-labelledby="titulo-recursos" className="contenedor py-12">
        <h2 id="titulo-recursos" className="m-0 text-2xl">
          Recursos
        </h2>
        <ul className="m-0 mt-6 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          <li>
            <Link to="/guias/" className="tarjeta tarjeta-enlace h-full">
              <BookOpen aria-hidden="true" className="size-5 text-accent" />
              <h3 className="mt-3 mb-1 text-lg">Guías de laboratorio</h3>
              <p className="m-0 text-text-muted">
                Protocolos de análisis de alimentos y forrajes y texto docente de composición química, con
                fórmulas, tablas y anexos.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 font-semibold text-accent">
                Ir a las guías <ArrowRight aria-hidden="true" className="size-4" />
              </span>
            </Link>
          </li>
          <li>
            <Link to="/plantillas/" className="tarjeta tarjeta-enlace h-full">
              <FileSpreadsheet aria-hidden="true" className="size-5 text-accent" />
              <h3 className="mt-3 mb-1 text-lg">Plantillas de registro</h3>
              <p className="m-0 text-text-muted">
                Libros de Excel para registrar muestras de especies vegetales y de subproductos, con
                instrucciones y material interno del laboratorio.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 font-semibold text-accent">
                Descargar plantillas <ArrowRight aria-hidden="true" className="size-4" />
              </span>
            </Link>
          </li>
          <li>
            <Link to="/app/" className="tarjeta tarjeta-enlace h-full">
              <Bot aria-hidden="true" className="size-5 text-accent" />
              <h3 className="mt-3 mb-1 text-lg">App de datos y NutriBot</h3>
              <p className="m-0 text-text-muted">
                Explora la composición de especies forrajeras y subproductos, compara variables y consulta
                al asistente NutriBot.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 font-semibold text-accent">
                Conocer la app <ArrowRight aria-hidden="true" className="size-4" />
              </span>
            </Link>
          </li>
        </ul>
      </section>

      <section aria-labelledby="titulo-analisis" className="contenedor pb-4">
        <div className="flex items-center gap-2">
          <FlaskConical aria-hidden="true" className="size-5 text-secondary" />
          <h2 id="titulo-analisis" className="m-0 text-2xl">
            Análisis disponibles
          </h2>
        </div>
        <p className="mt-2 mb-0 max-w-[62ch] text-text-muted">
          Determinaciones del análisis proximal de Weende y del fraccionamiento de fibra de Van Soest
          descritas en las guías.
        </p>
        <dl className="m-0 mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ANALISIS.map((analisis) => (
            <div key={analisis.sigla} className="tarjeta p-4">
              <dt className="flex items-baseline gap-2">
                <span className="etiqueta bg-secondary-soft text-secondary">{analisis.sigla}</span>
                <span className="font-semibold">{analisis.nombre}</span>
              </dt>
              <dd className="m-0 mt-2 text-sm text-text-muted">{analisis.metodo}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
