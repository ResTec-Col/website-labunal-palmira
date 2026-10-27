import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("guias", "routes/guias._index.tsx"),
  route("guias/:guia", "routes/guia.tsx"),
  route("guias/:guia/:capitulo", "routes/guia.capitulo.tsx"),
  route("plantillas", "routes/plantillas.tsx"),
  route("app", "routes/app.tsx"),
  route("acerca", "routes/acerca.tsx"),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
