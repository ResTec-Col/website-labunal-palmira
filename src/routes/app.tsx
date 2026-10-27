import { BarChart3, Bot, Database, Download, GitCompareArrows, ShieldAlert, Sprout } from "lucide-react";
import { Seo } from "../components/Seo";
import { ExternalLink } from "../components/ExternalLink";
import { Breadcrumbs } from "../components/layout/Breadcrumbs";
import { jsonLdMigas, type Miga } from "../lib/seo";
import { ENLACES } from "../lib/sitio";

const DESCRIPCION =
  "Consulta la base de datos histórica de especies forrajeras y subproductos del laboratorio, compara variables nutricionales y conversa con el asistente NutriBot.";

const MIGAS: Miga[] = [
  { nombre: "Inicio", ruta: "/" },
  { nombre: "App y NutriBot", ruta: "/app/" },
];

const FUNCIONES = [
  {
    Icono: Sprout,
    titulo: "Especies y subproductos",
    texto: "Busca por nombre científico, nombre común o tipo de subproducto y revisa cada muestra registrada.",
  },
  {
    Icono: BarChart3,
    titulo: "Resumen y cuadrantes",
    texto: "Promedio, desviación y coeficiente de variación por variable, y gráficos de dispersión entre dos variables.",
  },
  {
    Icono: GitCompareArrows,
    titulo: "Especies similares",
    texto: "Encuentra las especies con perfil bromatológico más parecido y explóralas en un dendrograma.",
  },
  {
    Icono: Download,
    titulo: "Descarga de datos",
    texto: "Exporta las muestras de cada especie o subproducto en Excel o CSV.",
  },
];

export default function PaginaApp() {
  return (
    <div className="contenedor py-10">
      <Seo title="App de datos y NutriBot" description={DESCRIPCION} path="/app/" jsonLd={jsonLdMigas(MIGAS)} />
      <Breadcrumbs migas={MIGAS} />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="min-w-0">
          <h1 className="m-0 text-3xl md:text-4xl">App de datos y NutriBot</h1>
          <p className="mt-3 mb-0 max-w-[65ch] text-lg text-text-muted">
            Una aplicación web para explorar los resultados históricos del laboratorio: composición química
            de especies forrajeras y de subproductos agroindustriales y de origen animal, tomados en campo
            en distintas regiones de Colombia.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <ExternalLink href={ENLACES.app} className="boton boton-primario" avisoVisible>
              Abrir la app
            </ExternalLink>
          </div>

          <h2 className="mt-12 mb-0 text-2xl">Qué puedes hacer</h2>
          <ul className="m-0 mt-5 grid list-none gap-4 p-0 sm:grid-cols-2">
            {FUNCIONES.map(({ Icono, titulo, texto }) => (
              <li key={titulo} className="tarjeta">
                <Icono aria-hidden="true" className="size-5 text-accent" />
                <h3 className="mt-3 mb-1 text-lg">{titulo}</h3>
                <p className="m-0 text-text-muted">{texto}</p>
              </li>
            ))}
          </ul>
        </div>

        <aside aria-label="Información complementaria" className="flex flex-col gap-4">
          <section aria-labelledby="titulo-nutribot" className="tarjeta">
            <div className="flex items-center gap-2">
              <Bot aria-hidden="true" className="size-5 text-accent" />
              <h2 id="titulo-nutribot" className="m-0 text-xl">
                NutriBot
              </h2>
            </div>
            <p className="mt-3 mb-0 text-text-muted">
              Asistente conversacional que responde preguntas sobre la base de datos y sobre los métodos de
              las guías: muestras disponibles, comparaciones entre especies y procedimientos como Kjeldahl
              o Van Soest.
            </p>
            <ExternalLink href={ENLACES.nutribot} className="mt-4 font-semibold">
              Conversar con NutriBot
            </ExternalLink>
          </section>
          <section aria-labelledby="titulo-aviso" className="tarjeta bg-surface">
            <div className="flex items-center gap-2">
              <ShieldAlert aria-hidden="true" className="size-5 text-warning" />
              <h2 id="titulo-aviso" className="m-0 text-base">
                Antes de usar NutriBot
              </h2>
            </div>
            <p className="mt-2 mb-0 text-sm text-text-muted">
              Las respuestas se generan con inteligencia artificial. Verifica la información con el
              laboratorio y no compartas datos personales en la conversación.
            </p>
          </section>
          <section aria-labelledby="titulo-datos" className="tarjeta bg-surface">
            <div className="flex items-center gap-2">
              <Database aria-hidden="true" className="size-5 text-secondary" />
              <h2 id="titulo-datos" className="m-0 text-base">
                Sobre los datos
              </h2>
            </div>
            <p className="mt-2 mb-0 text-sm text-text-muted">
              Los valores atípicos se marcan, nunca se corrigen, y los nombres se normalizan para agrupar
              variantes. Los métodos de análisis se describen en las guías de este sitio.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
