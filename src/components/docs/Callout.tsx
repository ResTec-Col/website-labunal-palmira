import type { ReactNode } from "react";
import { CircleAlert, Info, ShieldAlert, TriangleAlert, type LucideIcon } from "lucide-react";
import type { TipoCallout } from "./tipos";

interface CalloutProps {
  tipo?: TipoCallout;
  titulo?: string;
  children?: ReactNode;
}

const ESTILOS: Record<TipoCallout, { icono: LucideIcon; etiqueta: string; clases: string; color: string }> = {
  nota: { icono: Info, etiqueta: "Nota", clases: "border-l-info", color: "text-info" },
  advertencia: { icono: TriangleAlert, etiqueta: "Advertencia", clases: "border-l-warning", color: "text-warning" },
  seguridad: { icono: ShieldAlert, etiqueta: "Seguridad", clases: "border-l-danger", color: "text-danger" },
  importante: { icono: CircleAlert, etiqueta: "Importante", clases: "border-l-accent", color: "text-accent" },
};

/** Recuadro destacado para notas, advertencias y precauciones de seguridad. */
export function Callout({ tipo = "nota", titulo, children }: CalloutProps) {
  const estilo = ESTILOS[tipo] ?? ESTILOS.nota;
  const Icono = estilo.icono;
  const encabezado = titulo ?? estilo.etiqueta;

  return (
    <div
      role="note"
      aria-label={encabezado}
      className={`my-6 rounded-md border border-border border-l-4 bg-surface px-4 py-3 font-sans text-[0.95rem] ${estilo.clases}`}
    >
      <p className={`m-0 flex items-center gap-2 font-semibold ${estilo.color}`}>
        <Icono aria-hidden="true" className="size-4 shrink-0" />
        {encabezado}
      </p>
      <div className="mt-2 text-text [&>:first-child]:mt-0 [&>:last-child]:mb-0">{children}</div>
    </div>
  );
}
