import { Link } from "react-router";
import { Lock, ShieldCheck } from "lucide-react";
import { Seo } from "../components/Seo";
import { DownloadCard } from "../components/DownloadCard";
import { ExternalLink } from "../components/ExternalLink";
import { Breadcrumbs } from "../components/layout/Breadcrumbs";
import { jsonLdMigas, type Miga } from "../lib/seo";
import { ENLACES, PLANTILLAS } from "../lib/sitio";

const DESCRIPCION =
  "Descarga las plantillas de Excel para registrar muestras de especies vegetales y subproductos del Laboratorio de Nutrición Animal, con columnas e instrucciones.";

const MIGAS: Miga[] = [
  { nombre: "Inicio", ruta: "/" },
  { nombre: "Plantillas", ruta: "/plantillas/" },
];

const COLUMNAS_ANALISIS =
  "%MSI, % MSA, % MST, % CENIZAS, % PROTEINA, % EE, Energía Cal/g, FDN, FDA, LDA, HEMIC y CELULOSA";

const PLANTILLAS_INFO = [
  {
    id: "especies",
    titulo: "Plantilla de especies vegetales",
    href: PLANTILLAS.especies,
    tamano: "23 KB",
    hoja: "especies_vegetales",
    descripcion:
      "Registro de forrajes y otras especies vegetales: ubicación, identificación botánica, estado de la planta y resultados de laboratorio.",
    identificacion:
      "LATITUD, LONGITUD, ALTITUD (MSNM), DEPARTAMENTO, MUNICIPIO, PROCEDENCIA, NOMBRE CIENTÍFICO, NOMBRE COMÚN, ESTADO DESARROLLO, EDAD (DIAS) y PARTE PLANTA",
    analisis: `${COLUMNAS_ANALISIS} y OBSERVACIONES`,
    listas: "departamento, municipio, nombre científico, nombre común, parte de la planta y estado de desarrollo",
  },
  {
    id: "subproductos",
    titulo: "Plantilla de subproductos",
    href: PLANTILLAS.subproductos,
    tamano: "14 KB",
    hoja: "Subproductos",
    descripcion:
      "Registro de subproductos agroindustriales y de origen animal: procedencia, tipo de subproducto, tiempo de secado y resultados de laboratorio.",
    identificacion: "PROCEDENCIA, LOCALIZACION, NOMBRE COMUN, TIPO SUBPRODUCTO y ESTADO DESARROLLO",
    analisis: `${COLUMNAS_ANALISIS}, Solubilidad en KOH, % DIVMS, %FC, % FDT y OBSERVACIONES`,
    listas: "localización y tipo de subproducto",
  },
] as const;

export default function Plantillas() {
  return (
    <div className="contenedor py-10">
      <Seo title="Plantillas de registro" description={DESCRIPCION} path="/plantillas/" jsonLd={jsonLdMigas(MIGAS)} />
      <Breadcrumbs migas={MIGAS} />
      <h1 className="m-0 text-3xl md:text-4xl">Plantillas de registro</h1>
      <p className="mt-3 mb-0 max-w-[65ch] text-lg text-text-muted">
        Libros de Excel para registrar las muestras que llegan al laboratorio. Los datos registrados con
        estas plantillas alimentan la{" "}
        <Link to="/app/">app de datos y NutriBot</Link>.
      </p>

      <section aria-labelledby="titulo-descargas" className="mt-10">
        <h2 id="titulo-descargas" className="sr-only">
          Descargas
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {PLANTILLAS_INFO.map((plantilla) => (
            <DownloadCard
              key={plantilla.id}
              titulo={plantilla.titulo}
              descripcion={plantilla.descripcion}
              href={plantilla.href}
              formato="xlsx"
              tamano={plantilla.tamano}
            >
              <dl className="m-0 flex flex-col gap-2">
                <div>
                  <dt className="font-semibold text-text">Hoja de trabajo</dt>
                  <dd className="m-0">
                    <code className="rounded-sm bg-surface-2 px-1">{plantilla.hoja}</code>
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-text">Identificación de la muestra</dt>
                  <dd className="m-0">{plantilla.identificacion}.</dd>
                </div>
                <div>
                  <dt className="font-semibold text-text">Resultados de laboratorio</dt>
                  <dd className="m-0">{plantilla.analisis}.</dd>
                </div>
                <div>
                  <dt className="font-semibold text-text">Listas desplegables</dt>
                  <dd className="m-0">{plantilla.listas}.</dd>
                </div>
              </dl>
            </DownloadCard>
          ))}
        </div>
      </section>

      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        <section aria-labelledby="titulo-uso">
          <h2 id="titulo-uso" className="m-0 text-2xl">
            Cómo diligenciar las plantillas
          </h2>
          <ol className="mt-4 mb-0 flex flex-col gap-3 pl-5 text-text-muted marker:font-semibold marker:text-text-subtle">
            <li>Descarga la plantilla que corresponde al tipo de muestra.</li>
            <li>
              Trabaja solo en la hoja visible. Registra una fila por muestra y no cambies el orden ni el
              nombre de las columnas.
            </li>
            <li>
              Usa las listas desplegables para los campos con catálogo. Así se evitan nombres duplicados
              o con errores de escritura.
            </li>
            <li>
              Escribe los resultados como números, sin unidades ni el símbolo %. Deja la celda vacía si el
              análisis no se realizó.
            </li>
            <li>
              Usa <strong>OBSERVACIONES</strong> para cualquier aclaración sobre la muestra o el método.
            </li>
            <li>Entrega el archivo al laboratorio para su revisión e incorporación a la base de datos.</li>
          </ol>
          <p className="mt-6 mb-0 flex items-start gap-2 rounded-md border border-border bg-surface p-4 text-sm text-text-muted">
            <Lock aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-text-subtle" />
            Los libros están protegidos para conservar la estructura y los catálogos. Si necesitas un valor
            que no aparece en una lista, escríbelo en OBSERVACIONES y avisa al laboratorio.
          </p>
        </section>

        <section id="material-interno" aria-labelledby="titulo-interno" className="scroll-mt-24">
          <h2 id="titulo-interno" className="m-0 flex items-center gap-2 text-2xl">
            <ShieldCheck aria-hidden="true" className="size-5 text-secondary" />
            Material interno del laboratorio
          </h2>
          <p className="mt-4 mb-0 text-text-muted">
            Guía resumida para el personal que mantiene los catálogos de las plantillas. La contraseña de
            protección la custodia la coordinación del laboratorio y no se publica en este sitio.
          </p>
          <ol className="mt-4 mb-0 flex flex-col gap-3 pl-5 text-text-muted marker:font-semibold marker:text-text-subtle">
            <li>
              En Excel, abre <strong>Revisar</strong> y quita la protección de la hoja y del libro.
            </li>
            <li>
              Haz clic derecho sobre las pestañas, elige <strong>Mostrar…</strong> y selecciona el
              catálogo que vas a actualizar.
            </li>
            <li>Agrega el nuevo valor en la primera celda libre al final de la columna y guarda.</li>
            <li>
              Vuelve a ocultar los catálogos. Nunca ocultes las hojas <code>especies_vegetales</code> ni{" "}
              <code>Subproductos</code>.
            </li>
            <li>
              Protege de nuevo el libro y la hoja, dejando marcadas solo las dos primeras opciones del
              cuadro de diálogo.
            </li>
            <li>
              Sube los archivos actualizados a la carpeta compartida acordada para que la app refleje los
              cambios.
            </li>
          </ol>
          <p className="mt-6 mb-0 text-sm text-text-muted">
            ¿Necesitas los datos ya registrados? Consúltalos y descárgalos en la{" "}
            <ExternalLink href={ENLACES.app}>app de datos</ExternalLink>.
          </p>
        </section>
      </div>
    </div>
  );
}
