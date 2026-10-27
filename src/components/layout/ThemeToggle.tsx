import { useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import clsx from "clsx";
import { aplicarTema, CLAVE_TEMA, guardarTema, leerTema, type Tema } from "../../lib/tema";

const EVENTO_TEMA = "labunal:tema";

const OPCIONES: { valor: Tema; etiqueta: string; Icono: typeof Sun }[] = [
  { valor: "claro", etiqueta: "Tema claro", Icono: Sun },
  { valor: "oscuro", etiqueta: "Tema oscuro", Icono: Moon },
  { valor: "sistema", etiqueta: "Tema del sistema", Icono: Monitor },
];

function suscribir(avisar: () => void) {
  function alCambiarAlmacenamiento(evento: StorageEvent) {
    if (evento.key === null || evento.key === CLAVE_TEMA) {
      aplicarTema(leerTema());
      avisar();
    }
  }
  window.addEventListener("storage", alCambiarAlmacenamiento);
  window.addEventListener(EVENTO_TEMA, avisar);
  return () => {
    window.removeEventListener("storage", alCambiarAlmacenamiento);
    window.removeEventListener(EVENTO_TEMA, avisar);
  };
}

function temaDelServidor(): Tema {
  return "sistema";
}

export function ThemeToggle({ className }: { className?: string }) {
  const tema = useSyncExternalStore(suscribir, leerTema, temaDelServidor);

  function elegir(nuevo: Tema) {
    guardarTema(nuevo);
    aplicarTema(nuevo);
    try {
      window.dispatchEvent(new Event(EVENTO_TEMA));
    } catch {
      return;
    }
  }

  return (
    <div
      role="group"
      aria-label="Tema de color"
      className={clsx(
        "inline-flex items-center gap-0.5 rounded-md border border-border bg-surface p-0.5",
        className,
      )}
    >
      {OPCIONES.map(({ valor, etiqueta, Icono }) => {
        const activo = tema === valor;
        return (
          <button
            key={valor}
            type="button"
            aria-pressed={activo}
            aria-label={etiqueta}
            title={etiqueta}
            onClick={() => elegir(valor)}
            className={clsx(
              "inline-flex size-8 cursor-pointer items-center justify-center rounded-sm border-0 transition-colors",
              activo ? "bg-bg text-text shadow-sm" : "bg-transparent text-text-subtle hover:text-text",
            )}
          >
            <Icono aria-hidden="true" className="size-4" />
          </button>
        );
      })}
    </div>
  );
}
