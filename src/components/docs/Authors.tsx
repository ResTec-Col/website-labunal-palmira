import type { Autor } from "../../content/guias/tipos";

interface AuthorsProps {
  autores: Autor[];
  compacto?: boolean;
}

/** Autoría de una guía: lista completa o línea compacta para la cabecera de un capítulo. */
export function Authors({ autores, compacto = false }: AuthorsProps) {
  if (autores.length === 0) return null;

  if (compacto) {
    return (
      <p className="m-0 text-sm text-text-muted">
        <span className="sr-only">Autoría: </span>
        {autores.map((autor, indice) => (
          <span key={autor.nombre}>
            {indice > 0 ? (indice === autores.length - 1 ? " y " : ", ") : null}
            <span className="font-semibold text-text">{autor.nombre}</span>
            <span className="text-text-subtle"> ({autor.cargo})</span>
          </span>
        ))}
      </p>
    );
  }

  return (
    <ul className="m-0 flex list-none flex-col gap-3 p-0">
      {autores.map((autor) => (
        <li key={autor.nombre}>
          <span className="block font-semibold">{autor.nombre}</span>
          <span className="block text-sm text-text-muted">{autor.cargo}</span>
        </li>
      ))}
    </ul>
  );
}
