# Sitio web del Laboratorio de Nutrición Animal – UNAL Palmira

Sitio público del Laboratorio de Nutrición Animal de la Universidad Nacional de Colombia, Sede Palmira: [labnutripalmira.netlify.app](https://labnutripalmira.netlify.app/).

Reúne en un solo lugar:

- **Guías de laboratorio** por capítulos, con fórmulas (KaTeX), tablas y PDF originales.
- **Plantillas de Excel** para registrar muestras de especies vegetales y de subproductos, con instrucciones y material interno para el personal del laboratorio.
- **Acceso a la app de datos y NutriBot** en [app-labunal-palmira-1042514922887.us-central1.run.app](https://app-labunal-palmira-1042514922887.us-central1.run.app/).

## Stack

| Tema | Decisión |
|---|---|
| Framework | React 19 + React Router 7 en *framework mode* con `ssr: false` y `prerender` de todas las rutas (HTML estático indexable en `build/client`) |
| Contenido | MDX compilado en build (`@mdx-js/rollup`) con `remark-gfm`, `remark-math`, `remark-frontmatter`, `remark-mdx-frontmatter`, `rehype-katex` (con mhchem y `throwOnError`), `rehype-slug` y `rehype-autolink-headings` |
| Estilos | Tailwind CSS v4 con los tokens compartidos con la app (`src/styles/tokens.css`), fuentes Source Sans 3 y Source Serif 4 autoalojadas |
| Búsqueda | Pagefind, generado después del build y cargado bajo demanda desde `/pagefind/` |
| Seguridad | CSP sin `unsafe-inline` en scripts: `scripts/csp-headers.mjs` calcula el hash de cada script inline y escribe `build/client/_headers`; el resto de cabeceras está en `netlify.toml` |
| SEO | Título, descripción, canonical, Open Graph, Twitter y JSON-LD por página (`src/components/Seo.tsx`), `sitemap.xml` y `robots.txt` |

## Estructura

```
├── netlify.toml               # build, redirecciones 301 y cabeceras
├── react-router.config.ts     # ssr:false y lista de rutas a prerenderizar
├── vite.config.ts             # Tailwind, MDX y plugins remark/rehype
├── public/                    # robots.txt, íconos, imagen social, data/ (plantillas) y docs/ (PDF)
├── scripts/
│   ├── sitemap.mjs            # 404.html y sitemap.xml
│   ├── csp-headers.mjs        # _headers con la CSP y sus hashes
│   ├── brand-assets.mjs       # favicon, apple-touch-icon y og-default (npm run marca)
│   ├── convert-qmd.mjs        # migración de las guías Quarto a MDX
│   └── optimize-images.mjs    # imágenes WebP/JPG de las guías
└── src/
    ├── root.tsx  routes.ts  entry.server.tsx
    ├── routes/                # páginas: inicio, guías, capítulo, plantillas, app, acerca y 404
    ├── components/            # layout, Seo, ExternalLink, DownloadCard y docs/ (guías)
    ├── content/guias/         # MDX por capítulo, _meta.ts e index.ts
    ├── lib/                   # configuración del sitio, SEO, tema y búsqueda
    └── styles/                # tokens, globals, prose (guías) y print
```

## Desarrollo local

Requisitos: Node 22 (`.nvmrc`) y npm.

```bash
npm ci
npm run dev          # http://localhost:5173
npm run lint
npm run typecheck
npm test
npm run build        # react-router build + sitemap + pagefind + CSP
npm run preview      # sirve build/client
```

La búsqueda solo funciona después de `npm run build`, porque el índice de Pagefind se genera sobre el HTML final.

### Agregar o editar una guía

1. Edita el MDX del capítulo en `src/content/guias/<guia>/NN-<slug>.mdx` (frontmatter `titulo` y `descripcion` de 140 a 160 caracteres).
2. Para un capítulo nuevo, regístralo en el `_meta.ts` de la guía.
3. Ejecuta `npm run build`: KaTeX falla con `throwOnError`, así que una fórmula mal escrita detiene el build en lugar de publicarse rota.

## Despliegue en Netlify

El sitio se publica desde Git en el site existente `labnutripalmira` (id `eac207ea-d132-4808-92fc-fca761e6cbf3`):

1. En Netlify: *Site configuration → Build & deploy → Link repository* y elegir `ResTec-Col/website-labunal-palmira`, rama `main`.
2. Netlify toma `netlify.toml`: comando `npm ci && npm run build`, directorio `build/client` y Node 22.
3. Cada pull request genera un *deploy preview*. Revisa la CSP en la consola del navegador antes de hacer merge.
4. Ya no se usa `quarto publish`.

Las URL del sitio Quarto anterior (`/index.html`, `/about.html` y las guías `.html`) redirigen con 301 a las nuevas rutas. Las plantillas conservan sus rutas `/data/*.xlsx`.

## Identidad de los commits

Este repositorio es público y pertenece a la organización ResTec-Col. Todos los commits deben firmarse con la identidad de ResTec-Col, configurada **solo en el repositorio** (nunca con `--global`):

```bash
git config user.name "ResTec-Col"
git config user.email "servicios@restec.com.co"
git remote -v   # git@github.com-resteccol:ResTec-Col/website-labunal-palmira.git
```

Antes de cada commit verifica `git config user.name` y `git config user.email`, y haz push por el alias SSH `github.com-resteccol`.

## Créditos y licencia

Creado por el Laboratorio de Nutrición Animal UNAL Palmira y [Resilient Technologies S.A.S](https://restec.com.co/). Código con licencia MIT (ver `LICENSE`). Los contenidos de las guías pertenecen a sus autores y a la Universidad Nacional de Colombia.
