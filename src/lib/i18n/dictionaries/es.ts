import type { Dictionary } from "../index";

/** Spanish — mirrors pt.ts exactly (enforced by `satisfies Dictionary`). */
export const es = {
  nav: {
    earn: "Acumular",
    earnItems: {
      offers: { label: "Ofertas", hint: "Promociones de puntos bonus" },
      wine: { label: "Vinos", hint: "Ordenado por costo cada 1.000 puntos" },
      giftCards: { label: "Gift cards", hint: "Mejores puntos por dólar" },
      cards: { label: "Tarjetas & perks", hint: "Bonos de bienvenida" },
    },
    flights: "Vuelos",
    alerts: "Alertas",
    marketplace: "Marketplace",
    partners: "Socios",
    perks: "Beneficios",
    guides: "Guías",
    pricing: "Planes",
  },
  header: {
    tagline: "Puntos · dinero · premios",
    searchSeats: "Buscar asientos",
    browseOffers: "Ver ofertas",
    account: "Mi cuenta",
    signIn: "Entrar",
    getStarted: "Empezar",
    searchAwardSeats: "Buscar asientos premio",
    menu: "Menú",
    language: "Idioma",
  },
  footer: {
    product: "Producto",
    company: "Empresa",
    offers: "Ofertas",
    flights: "Vuelos",
    marketplace: "Marketplace",
    partners: "Socios",
    wine: "Vinos",
    giftCards: "Gift cards",
    cards: "Tarjetas & perks",
    guides: "Guías",
    premiumPerks: "Beneficios Premium",
    pricing: "Planes",
    contact: "Contacto",
    privacy: "Privacidad",
    terms: "Términos",
    auFirstHeading: "Enfoque en Australia",
    auFirstBody:
      "Hecho para Qantas, Velocity, Everyday Rewards y Flybuys — con tarifas en efectivo para que nunca quemes puntos cuando el dinero es más inteligente.",
    rights: "Todos los derechos reservados.",
    dataLine: "Datos de premios vía Seats.aero · Comparación de tarifas pronto vía Amadeus",
    disclaimer:
      "Sin afiliación ni respaldo de Qantas, Virgin Australia, Everyday Rewards, Flybuys ni ninguna aerolínea o programa de fidelidad. Las marcas pertenecen a sus dueños. Los precios en puntos y la disponibilidad de asientos cambian sin aviso — confirma siempre con el programa antes de reservar o transferir.",
  },
} as const satisfies Dictionary;
