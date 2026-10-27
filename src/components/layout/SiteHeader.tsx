import { lazy, Suspense, useRef, useState } from "react";
import { Link, NavLink } from "react-router";
import { Menu } from "lucide-react";
import clsx from "clsx";
import escudo from "../../assets/brand/escudo-unal.svg";
import escudoBlanco from "../../assets/brand/escudo-unal-blanco.svg";
import { NAVEGACION } from "../../lib/sitio";
import { SearchDialog } from "./SearchDialog";
import { ThemeToggle } from "./ThemeToggle";

const MobileMenu = lazy(() => import("./MobileMenu"));

function precargarMenu() {
  import("./MobileMenu").catch(() => undefined);
}

function claseEnlace({ isActive }: { isActive: boolean }) {
  return clsx(
    "rounded-md px-3 py-2 text-[0.95rem] font-medium no-underline transition-colors",
    isActive ? "bg-accent-soft text-accent" : "text-text-muted hover:bg-surface hover:text-text",
  );
}

function Logotipo() {
  return (
    <Link to="/" className="flex min-w-0 items-center gap-3 text-text no-underline hover:text-text">
      <img src={escudo} alt="" width={40} height={40} className="size-10 shrink-0 dark:hidden" />
      <img src={escudoBlanco} alt="" width={40} height={40} className="hidden size-10 shrink-0 dark:block" />
      <span className="min-w-0 leading-tight">
        <span className="block truncate text-[0.95rem] font-semibold sm:text-base">
          Laboratorio de Nutrición Animal
        </span>
        <span className="block truncate text-xs text-text-subtle sm:text-sm">
          Universidad Nacional de Colombia · Sede Palmira
        </span>
        <span className="sr-only"> – Ir al inicio</span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const botonMenu = useRef<HTMLButtonElement>(null);

  function cerrarMenu() {
    setMenuAbierto(false);
    window.requestAnimationFrame(() => botonMenu.current?.focus());
  }

  return (
    <header
      role="banner"
      className="sticky top-0 z-30 border-b-2 border-accent bg-bg/95 backdrop-blur supports-[backdrop-filter]:bg-bg/85"
    >
      <div className="contenedor flex h-[var(--header-h)] items-center justify-between gap-3">
        <Logotipo />
        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="m-0 flex list-none items-center gap-1 p-0">
            {NAVEGACION.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.to === "/"} className={claseEnlace} prefetch="intent">
                  {item.texto}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <SearchDialog />
          <ThemeToggle className="hidden md:inline-flex" />
          <button
            ref={botonMenu}
            type="button"
            className="boton-icono lg:hidden"
            aria-label="Abrir menú de navegación"
            aria-haspopup="dialog"
            aria-expanded={menuAbierto}
            onClick={() => setMenuAbierto(true)}
            onPointerEnter={precargarMenu}
            onFocus={precargarMenu}
          >
            <Menu aria-hidden="true" className="size-5" />
          </button>
        </div>
      </div>
      {menuAbierto ? (
        <Suspense fallback={null}>
          <MobileMenu onCerrar={cerrarMenu} />
        </Suspense>
      ) : null}
    </header>
  );
}
