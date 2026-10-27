import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import mdx from "@mdx-js/rollup";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import "katex/contrib/mhchem";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import type { PluggableList } from "unified";
import { defineConfig, runnerImport } from "vite";

const RUTA_PLUGIN_TOC = fileURLToPath(new URL("./src/content/guias/remark-toc-export.ts", import.meta.url));

async function cargarPluginToc(): Promise<PluggableList> {
  if (!existsSync(RUTA_PLUGIN_TOC)) {
    console.warn("[mdx] No existe src/content/guias/remark-toc-export.ts: los MDX no exportarán toc.");
    return [];
  }
  const { module: modulo } = await runnerImport<Record<string, unknown>>(RUTA_PLUGIN_TOC, {
    configFile: false,
    logLevel: "error",
  });
  const plugin =
    modulo.default ??
    modulo.remarkTocExport ??
    Object.values(modulo).find((valor) => typeof valor === "function");
  if (typeof plugin !== "function") {
    throw new Error("remark-toc-export.ts debe exportar un plugin remark (default o remarkTocExport)");
  }
  return [plugin as PluggableList[number]];
}

export default defineConfig(async () => {
  const pluginToc = await cargarPluginToc();

  return {
    plugins: [
      tailwindcss(),
      {
        enforce: "pre" as const,
        ...mdx({
          providerImportSource: "@mdx-js/react",
          remarkPlugins: [
            remarkGfm,
            remarkMath,
            remarkFrontmatter,
            [remarkMdxFrontmatter, { name: "frontmatter" }],
            ...pluginToc,
          ],
          rehypePlugins: [
            [rehypeKatex, { throwOnError: true, strict: "ignore", output: "htmlAndMathml" }],
            rehypeSlug,
            [
              rehypeAutolinkHeadings,
              { behavior: "wrap", test: ["h2", "h3", "h4"], properties: { className: ["ancla-titulo"] } },
            ],
          ],
        }),
      },
      reactRouter(),
    ],
    build: {
      assetsInlineLimit: 4096,
      cssCodeSplit: true,
    },
  };
});
