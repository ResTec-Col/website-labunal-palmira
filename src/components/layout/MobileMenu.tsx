import { NavLink } from "react-router";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import clsx from "clsx";
import { NAVEGACION } from "../../lib/sitio";
import { ThemeToggle } from "./ThemeToggle";

interface MobileMenuProps {
  onCerrar: () => void;
}

export default function MobileMenu({ onCerrar }: MobileMenuProps) {
  return (
    <Dialog.Root open onOpenChange={(abierto) => (abierto ? undefined : onCerrar())}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 right-0 z-50 flex w-[min(320px,calc(100vw-48px))] flex-col gap-6 border-l border-border bg-bg p-5 shadow-md"
        >
          <div className="flex items-center justify-between">
            <Dialog.Title className="m-0 text-base font-semibold">Menú</Dialog.Title>
            <Dialog.Close className="boton-icono" aria-label="Cerrar menú">
              <X aria-hidden="true" className="size-5" />
            </Dialog.Close>
          </div>
          <nav aria-label="Principal móvil">
            <ul className="m-0 flex list-none flex-col gap-1 p-0">
              {NAVEGACION.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === "/"}
                    onClick={onCerrar}
                    className={({ isActive }) =>
                      clsx(
                        "block rounded-md px-3 py-2 text-base font-medium no-underline transition-colors",
                        isActive ? "bg-accent-soft text-accent" : "text-text-muted hover:bg-surface hover:text-text",
                      )
                    }
                  >
                    {item.texto}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
            <span className="text-sm text-text-subtle">Tema</span>
            <ThemeToggle />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
