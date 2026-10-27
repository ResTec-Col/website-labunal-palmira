import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";

interface FormulaProps {
  children?: ReactNode;
}

type EstadoCopia = "inicial" | "copiado" | "error";

/** Devuelve la fuente LaTeX que KaTeX deja en la anotación MathML, si existe. */
function fuenteTex(contenedor: HTMLElement | null): string | null {
  try {
    const anotacion = contenedor?.querySelector('annotation[encoding="application/x-tex"]');
    const texto = anotacion?.textContent?.trim();
    return texto ? texto : null;
  } catch {
    return null;
  }
}

/**
 * Bloque de ecuación. Ofrece copiar la fórmula en LaTeX cuando KaTeX incluye la anotación
 * MathML y el navegador permite usar el portapapeles.
 */
export function Formula({ children }: FormulaProps) {
  const contenedor = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);
  const [estado, setEstado] = useState<EstadoCopia>("inicial");

  useEffect(() => {
    try {
      const disponible = Boolean(fuenteTex(contenedor.current)) && Boolean(navigator.clipboard);
      if (boton.current) boton.current.hidden = !disponible;
    } catch {
      if (boton.current) boton.current.hidden = true;
    }
  }, []);

  useEffect(() => {
    if (estado === "inicial") return;
    const temporizador = setTimeout(() => setEstado("inicial"), 2000);
    return () => clearTimeout(temporizador);
  }, [estado]);

  async function copiar() {
    try {
      const tex = fuenteTex(contenedor.current);
      if (!tex) throw new Error("Fórmula sin fuente LaTeX");
      await navigator.clipboard.writeText(tex);
      setEstado("copiado");
    } catch {
      setEstado("error");
    }
  }

  return (
    <div className="group relative my-6">
      <div ref={contenedor} className="overflow-x-auto">
        {children}
      </div>
      <button
        ref={boton}
        type="button"
        hidden
        onClick={copiar}
        aria-label="Copiar la fórmula en LaTeX"
        title="Copiar la fórmula en LaTeX"
        className="boton-icono no-imprimir absolute top-0 right-0 size-8 opacity-60 group-hover:opacity-100 focus-visible:opacity-100"
      >
        {estado === "copiado" ? (
          <Check aria-hidden="true" className="size-4" />
        ) : (
          <Copy aria-hidden="true" className="size-4" />
        )}
      </button>
      <span role="status" className="sr-only">
        {estado === "copiado" ? "Fórmula copiada." : estado === "error" ? "No se pudo copiar la fórmula." : ""}
      </span>
    </div>
  );
}
