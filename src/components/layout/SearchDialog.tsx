import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import clsx from "clsx";

const SearchPanel = lazy(() => import("./SearchPanel"));

function precargarPanel() {
  import("./SearchPanel").catch(() => undefined);
}

export function SearchDialog({ className }: { className?: string }) {
  const [abierto, setAbierto] = useState(false);
  const boton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function alPresionar(evento: KeyboardEvent) {
      try {
        const objetivo = evento.target as HTMLElement | null;
        const escribiendo =
          objetivo?.isContentEditable ||
          objetivo?.tagName === "INPUT" ||
          objetivo?.tagName === "TEXTAREA" ||
          objetivo?.tagName === "SELECT";
        if ((evento.ctrlKey || evento.metaKey) && evento.key.toLowerCase() === "k") {
          evento.preventDefault();
          setAbierto(true);
        } else if (evento.key === "/" && !escribiendo) {
          evento.preventDefault();
          setAbierto(true);
        }
      } catch {
        return;
      }
    }
    window.addEventListener("keydown", alPresionar);
    return () => window.removeEventListener("keydown", alPresionar);
  }, []);

  function cerrar() {
    setAbierto(false);
    window.requestAnimationFrame(() => boton.current?.focus());
  }

  return (
    <>
      <button
        ref={boton}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={abierto}
        onClick={() => setAbierto(true)}
        onPointerEnter={precargarPanel}
        onFocus={precargarPanel}
        className={clsx(
          "inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-border bg-surface px-3 text-sm text-text-subtle transition-colors hover:border-border-strong hover:text-text",
          className,
        )}
      >
        <Search aria-hidden="true" className="size-4" />
        <span className="hidden sm:inline">Buscar</span>
        <span className="sr-only sm:hidden">Buscar en el sitio</span>
        <kbd className="hidden rounded-sm border border-border bg-bg px-1.5 font-sans text-xs text-text-subtle lg:inline">
          Ctrl K
        </kbd>
      </button>
      {abierto ? (
        <Suspense fallback={null}>
          <SearchPanel onCerrar={cerrar} />
        </Suspense>
      ) : null}
    </>
  );
}
