import type { ReactNode } from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";

type Formato = "xlsx" | "pdf";

interface DownloadCardProps {
  titulo: string;
  descripcion: string;
  href: string;
  formato: Formato;
  tamano?: string;
  nivelTitulo?: 2 | 3;
  children?: ReactNode;
}

const ETIQUETA_FORMATO: Record<Formato, string> = {
  xlsx: "Excel (.xlsx)",
  pdf: "PDF",
};

export function DownloadCard({
  titulo,
  descripcion,
  href,
  formato,
  tamano,
  nivelTitulo = 3,
  children,
}: DownloadCardProps) {
  const Titulo = nivelTitulo === 2 ? "h2" : "h3";
  const Icono = formato === "xlsx" ? FileSpreadsheet : FileText;
  const detalle = [ETIQUETA_FORMATO[formato], tamano].filter(Boolean).join(" · ");
  const nombreArchivo = href.split("/").pop() ?? undefined;

  return (
    <article className="tarjeta flex h-full flex-col gap-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-secondary-soft text-secondary">
          <Icono aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0">
          <Titulo className="m-0 text-lg">{titulo}</Titulo>
          <p className="m-0 mt-1 text-sm text-text-subtle">{detalle}</p>
        </div>
      </div>
      <p className="m-0 text-text-muted">{descripcion}</p>
      {children ? <div className="text-sm text-text-muted">{children}</div> : null}
      <div className="mt-auto">
        <a className="boton boton-primario" href={href} download={nombreArchivo}>
          <Download aria-hidden="true" className="size-4" />
          Descargar
          <span className="sr-only">
            {" "}
            {titulo} ({detalle})
          </span>
        </a>
      </div>
    </article>
  );
}
