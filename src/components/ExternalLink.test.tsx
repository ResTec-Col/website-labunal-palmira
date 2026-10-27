import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ExternalLink } from "./ExternalLink";

describe("ExternalLink", () => {
  it("abre en otra pestaña con rel seguro y lo anuncia", () => {
    render(<ExternalLink href="https://example.org">Abrir la app</ExternalLink>);
    const enlace = screen.getByRole("link", { name: /abrir la app.*abre en otra pestaña/i });
    expect(enlace).toHaveAttribute("target", "_blank");
    expect(enlace).toHaveAttribute("rel", "noopener noreferrer");
  });
});
