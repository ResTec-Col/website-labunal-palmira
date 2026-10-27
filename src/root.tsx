import type { ReactNode } from "react";
import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useMatches,
} from "react-router";
import "@fontsource-variable/source-sans-3";
import "@fontsource-variable/source-serif-4";
import estilos from "./styles/globals.css?url";
import type { Route } from "./+types/root";
import { SiteFooter } from "./components/layout/SiteFooter";
import { SiteHeader } from "./components/layout/SiteHeader";
import { SkipLink } from "./components/layout/SkipLink";
import { Seo } from "./components/Seo";
import { SCRIPT_TEMA } from "./lib/tema";

export interface ManejadorRuta {
  buscable?: boolean;
}

export const links: Route.LinksFunction = () => [
  { rel: "stylesheet", href: estilos },
  { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
  { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
];

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="es-CO" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#121212" media="(prefers-color-scheme: dark)" />
        <meta name="color-scheme" content="light dark" />
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
        <Meta />
        <Links />
      </head>
      <body className="flex min-h-dvh flex-col">
        <SkipLink />
        <SiteHeader />
        {children}
        <SiteFooter />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const matches = useMatches();
  const buscable = matches.every((match) => (match.handle as ManejadorRuta | undefined)?.buscable !== false);

  return (
    <main id="contenido" tabIndex={-1} className="flex-1 outline-none" {...(buscable ? { "data-pagefind-body": "" } : {})}>
      <Outlet />
    </main>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const noEncontrado = isRouteErrorResponse(error) && error.status === 404;
  const titulo = noEncontrado ? "Página no encontrada" : "Ocurrió un error";
  const detalle = noEncontrado
    ? "La página que buscas no existe o cambió de dirección."
    : "No pudimos mostrar esta página. Intenta recargarla en unos segundos.";

  if (import.meta.env.DEV && error instanceof Error) {
    console.error(error);
  }

  return (
    <main id="contenido" tabIndex={-1} className="flex-1 outline-none">
      <Seo title={titulo} description={detalle} path="/" noindex />
      <div className="contenedor py-16">
        <p className="etiqueta">{noEncontrado ? "Error 404" : "Error"}</p>
        <h1 className="mt-4 text-3xl">{titulo}</h1>
        <p className="max-w-prose text-text-muted">{detalle}</p>
        <Link to="/" className="boton boton-primario mt-4">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
