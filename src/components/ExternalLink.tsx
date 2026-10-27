import type { AnchorHTMLAttributes, ReactNode } from "react";
import { ExternalLink as IconoExterno } from "lucide-react";
import clsx from "clsx";

interface ExternalLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "target" | "rel"> {
  href: string;
  children: ReactNode;
  icono?: boolean;
  avisoVisible?: boolean;
}

export function ExternalLink({
  href,
  children,
  icono = true,
  avisoVisible = false,
  className,
  ...resto
}: ExternalLinkProps) {
  return (
    <a
      {...resto}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx("inline-flex items-center gap-1", className)}
    >
      {children}
      {icono ? <IconoExterno aria-hidden="true" className="size-4 shrink-0" /> : null}
      {avisoVisible ? (
        <span className="text-sm font-normal opacity-80">(abre en otra pestaña)</span>
      ) : (
        <span className="sr-only">(abre en otra pestaña)</span>
      )}
    </a>
  );
}
