import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

const RUTA_CAPITULO = /^\/guias\/[^/]+\/[^/]+\/?$/;

function hidratar() {
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <HydratedRouter />
      </StrictMode>,
    );
  });
}

async function iniciar() {
  try {
    if (RUTA_CAPITULO.test(window.location.pathname)) {
      const { precargarDesdeRuta } = await import("./lib/capitulos");
      await precargarDesdeRuta(window.location.pathname);
    }
  } catch (error) {
    console.error("No se pudo preparar la hidratación del capítulo", error);
  } finally {
    hidratar();
  }
}

void iniciar();
