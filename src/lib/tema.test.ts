import { afterEach, describe, expect, it, vi } from "vitest";
import { aplicarTema, CLAVE_TEMA, guardarTema, leerTema } from "./tema";

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

describe("tema", () => {
  it("guarda y lee el tema elegido", () => {
    guardarTema("oscuro");
    expect(window.localStorage.getItem(CLAVE_TEMA)).toBe("oscuro");
    expect(leerTema()).toBe("oscuro");
    guardarTema("sistema");
    expect(window.localStorage.getItem(CLAVE_TEMA)).toBeNull();
    expect(leerTema()).toBe("sistema");
  });

  it("ignora valores inválidos y fallos de almacenamiento", () => {
    window.localStorage.setItem(CLAVE_TEMA, "rosado");
    expect(leerTema()).toBe("sistema");
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("bloqueado");
    });
    expect(leerTema()).toBe("sistema");
  });

  it("aplica el atributo data-theme", () => {
    aplicarTema("oscuro");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    aplicarTema("claro");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    aplicarTema("sistema");
    expect(document.documentElement.hasAttribute("data-theme")).toBe(false);
  });
});
