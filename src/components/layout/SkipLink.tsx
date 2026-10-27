export function SkipLink({ destino = "contenido" }: { destino?: string }) {
  return (
    <a
      href={`#${destino}`}
      className="skip-link sr-only-focusable fixed top-2 left-2 z-50 rounded-md bg-accent px-4 py-2 font-semibold text-on-accent no-underline shadow-md hover:text-on-accent"
    >
      Saltar al contenido
    </a>
  );
}
