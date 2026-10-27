export type Tema = "claro" | "oscuro" | "sistema";

export const CLAVE_TEMA = "labunal-tema";

const VALOR_ATRIBUTO: Record<Exclude<Tema, "sistema">, "light" | "dark"> = {
  claro: "light",
  oscuro: "dark",
};

export function esTema(valor: unknown): valor is Tema {
  return valor === "claro" || valor === "oscuro" || valor === "sistema";
}

export function leerTema(): Tema {
  try {
    const valor = window.localStorage.getItem(CLAVE_TEMA);
    return esTema(valor) ? valor : "sistema";
  } catch {
    return "sistema";
  }
}

export function guardarTema(tema: Tema): void {
  try {
    if (tema === "sistema") window.localStorage.removeItem(CLAVE_TEMA);
    else window.localStorage.setItem(CLAVE_TEMA, tema);
  } catch {
    return;
  }
}

export function aplicarTema(tema: Tema, raiz: HTMLElement = document.documentElement): void {
  try {
    if (tema === "sistema") raiz.removeAttribute("data-theme");
    else raiz.setAttribute("data-theme", VALOR_ATRIBUTO[tema]);
  } catch {
    return;
  }
}

export const SCRIPT_TEMA = `(function(){try{var t=localStorage.getItem("${CLAVE_TEMA}");if(t==="claro")document.documentElement.setAttribute("data-theme","light");else if(t==="oscuro")document.documentElement.setAttribute("data-theme","dark");}catch(e){}})();`;
