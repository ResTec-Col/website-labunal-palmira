export const SITIO = {
  url: "https://labnutripalmira.netlify.app",
  nombre: "Laboratorio de Nutrición Animal – UNAL Palmira",
  nombreCorto: "Laboratorio de Nutrición Animal",
  sede: "Universidad Nacional de Colombia · Sede Palmira",
  facultad: "Facultad de Ciencias Agropecuarias",
  descripcion:
    "Guías de laboratorio, plantillas de registro y datos bromatológicos del Laboratorio de Nutrición Animal de la Universidad Nacional de Colombia, Sede Palmira.",
  imagen: "/og-default.png",
  idioma: "es-CO",
  locale: "es_CO",
} as const;

export const ENLACES = {
  app: "https://app-labunal-palmira-1042514922887.us-central1.run.app/",
  nutribot: "https://app-labunal-palmira-1042514922887.us-central1.run.app/nutribot",
  repositorio: "https://github.com/ResTec-Col/website-labunal-palmira",
  restec: "https://restec.com.co/",
  unalPalmira: "https://palmira.unal.edu.co",
  unal: "https://unal.edu.co",
} as const;

export const PLANTILLAS = {
  especies: "/data/plantilla-especies.xlsx",
  subproductos: "/data/plantilla-subproductos.xlsx",
} as const;

export const NAVEGACION = [
  { to: "/", texto: "Inicio" },
  { to: "/guias/", texto: "Guías" },
  { to: "/plantillas/", texto: "Plantillas" },
  { to: "/app/", texto: "App y NutriBot" },
  { to: "/acerca/", texto: "Acerca" },
] as const;

export const VERSION_SITIO = "2.0.0";
