import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router";
import * as Dialog from "@radix-ui/react-dialog";
import { FileText, Loader2, Search, X } from "lucide-react";
import { buscar, cargarPagefind, type ResultadoBusqueda } from "../../lib/pagefind";

type Estado = "inicial" | "cargando" | "listo" | "error";

interface Busqueda {
  termino: string;
  estado: "listo" | "error";
  resultados: ResultadoBusqueda[];
}

const SIN_BUSQUEDA: Busqueda = { termino: "", estado: "listo", resultados: [] };

interface SearchPanelProps {
  onCerrar: () => void;
}

export default function SearchPanel({ onCerrar }: SearchPanelProps) {
  const [consulta, setConsulta] = useState("");
  const [busqueda, setBusqueda] = useState<Busqueda>(SIN_BUSQUEDA);
  const [errorCarga, setErrorCarga] = useState(false);
  const peticion = useRef(0);
  const idEstado = useId();
  const termino = consulta.trim();

  useEffect(() => {
    cargarPagefind()
      .then(() => setErrorCarga(false))
      .catch(() => setErrorCarga(true));
  }, []);

  useEffect(() => {
    if (!termino) return;
    const actual = ++peticion.current;
    const temporizador = window.setTimeout(async () => {
      try {
        const pagefind = await cargarPagefind();
        const encontrados = await buscar(pagefind, termino);
        if (actual === peticion.current) setBusqueda({ termino, estado: "listo", resultados: encontrados });
      } catch {
        if (actual === peticion.current) setBusqueda({ termino, estado: "error", resultados: [] });
      }
    }, 180);
    return () => window.clearTimeout(temporizador);
  }, [termino]);

  const estado: Estado = errorCarga
    ? "error"
    : !termino
      ? "inicial"
      : busqueda.termino !== termino
        ? "cargando"
        : busqueda.estado;
  const resultados = estado === "listo" ? busqueda.resultados : [];

  const mensaje =
    estado === "error"
      ? "La búsqueda no está disponible en este momento. Se activa en el sitio publicado."
      : estado === "cargando"
        ? "Buscando…"
        : estado === "listo" && resultados.length === 0
          ? `No hay resultados para «${termino}».`
          : estado === "listo"
            ? `${resultados.length} ${resultados.length === 1 ? "resultado" : "resultados"}.`
            : "Escribe un término: por ejemplo, Kjeldahl, cenizas o fibra detergente.";

  return (
    <Dialog.Root open onOpenChange={(abierto) => (abierto ? undefined : onCerrar())}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content
          aria-describedby={idEstado}
          className="fixed top-[8vh] left-1/2 z-50 flex max-h-[80vh] w-[calc(100vw-32px)] max-w-xl -translate-x-1/2 flex-col overflow-hidden rounded-lg border border-border bg-bg shadow-md"
        >
          <div className="flex items-center gap-2 border-b border-border px-4 has-[input:focus-visible]:outline-2 has-[input:focus-visible]:-outline-offset-2 has-[input:focus-visible]:outline-focus">
            <Search aria-hidden="true" className="size-5 shrink-0 text-text-subtle" />
            <Dialog.Title className="sr-only">Buscar en el sitio</Dialog.Title>
            <label htmlFor="busqueda-sitio" className="sr-only">
              Término de búsqueda
            </label>
            <input
              id="busqueda-sitio"
              type="search"
              autoComplete="off"
              spellCheck={false}
              value={consulta}
              onChange={(evento) => setConsulta(evento.target.value)}
              placeholder="Buscar en guías y páginas"
              className="h-14 min-w-0 flex-1 border-0 bg-transparent text-base text-text outline-none placeholder:text-text-subtle"
            />
            {estado === "cargando" ? (
              <Loader2 aria-hidden="true" className="size-4 shrink-0 animate-spin text-text-subtle" />
            ) : null}
            <Dialog.Close className="boton-icono size-9" aria-label="Cerrar búsqueda">
              <X aria-hidden="true" className="size-4" />
            </Dialog.Close>
          </div>
          <p id={idEstado} role="status" aria-live="polite" className="m-0 px-4 pt-3 text-sm text-text-subtle">
            {mensaje}
          </p>
          {resultados.length > 0 ? (
            <ul className="m-0 list-none overflow-y-auto p-2">
              {resultados.map((resultado) => (
                <li key={resultado.url}>
                  <Link
                    to={resultado.url}
                    onClick={onCerrar}
                    className="flex gap-3 rounded-md px-3 py-2.5 text-text no-underline hover:bg-surface focus-visible:bg-surface"
                  >
                    <FileText aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-text-subtle" />
                    <span className="min-w-0">
                      <span className="block font-semibold text-text">{resultado.titulo}</span>
                      <span className="mt-0.5 block text-sm text-text-muted">
                        {resultado.fragmentos.map((fragmento, indice) =>
                          fragmento.resaltado ? (
                            <mark key={indice} className="rounded-sm bg-accent-soft px-0.5 text-text">
                              {fragmento.texto}
                            </mark>
                          ) : (
                            <span key={indice}>{fragmento.texto}</span>
                          ),
                        )}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="h-3" />
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
