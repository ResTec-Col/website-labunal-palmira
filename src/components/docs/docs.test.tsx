import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Callout } from "./Callout";
import { DataTable } from "./DataTable";
import { Figure } from "./Figure";

describe("DataTable", () => {
  it("añade caption, alcances de encabezado y notas", () => {
    render(
      <DataTable caption="Tabla 13. Proteína de *Tithonia diversifolia*">
        <table>
          <thead>
            <tr>
              <th>Forraje</th>
              <th>PC (%)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Botón de oro</td>
              <td>23.4</td>
            </tr>
          </tbody>
        </table>
        <p>García, 2004</p>
      </DataTable>,
    );
    const tabla = screen.getByRole("table", { name: /Tabla 13\. Proteína de Tithonia diversifolia/ });
    expect(tabla.querySelector("caption em")?.textContent).toBe("Tithonia diversifolia");
    expect(screen.getByRole("columnheader", { name: "Forraje" })).toHaveAttribute("scope", "col");
    expect(screen.getByRole("rowheader", { name: "Botón de oro" })).toHaveAttribute("scope", "row");
    expect(screen.getByRole("region")).toHaveAttribute("tabindex", "0");
    expect(screen.getByText("García, 2004")).toBeInTheDocument();
  });

  it("muestra el título aunque no reciba una tabla", () => {
    render(<DataTable caption="Tabla: sin datos">{null}</DataTable>);
    expect(screen.getByText("Tabla: sin datos")).toBeInTheDocument();
  });
});

describe("Figure", () => {
  it("renderiza la imagen con dimensiones, srcset y pie distinto del alt", () => {
    render(
      <Figure
        src={{
          ancho: 800,
          alto: 600,
          fuentes: [
            { ancho: 480, url: "/a-480.webp" },
            { ancho: 800, url: "/a-800.webp" },
          ],
          src: "/a-800.webp",
        }}
        alt="Esquema del extractor Soxhlet"
        caption="Figura 8. Partes del extractor"
      />,
    );
    const imagen = screen.getByRole("img", { name: "Esquema del extractor Soxhlet" });
    expect(imagen).toHaveAttribute("width", "800");
    expect(imagen).toHaveAttribute("height", "600");
    expect(imagen).toHaveAttribute("loading", "lazy");
    expect(imagen).toHaveAttribute("srcset", "/a-480.webp 480w, /a-800.webp 800w");
    expect(screen.getByText("Figura 8. Partes del extractor").tagName).toBe("FIGCAPTION");
  });

  it("informa cuando la imagen no existe", () => {
    render(<Figure src={undefined} alt="x" caption="Figura 1" />);
    expect(screen.getByText("Imagen no disponible.")).toBeInTheDocument();
  });
});

describe("Callout", () => {
  it("expone una nota accesible con su título", () => {
    render(
      <Callout tipo="seguridad" titulo="Precauciones de seguridad">
        <p>Use guantes.</p>
      </Callout>,
    );
    expect(screen.getByRole("note", { name: "Precauciones de seguridad" })).toBeInTheDocument();
  });
});
