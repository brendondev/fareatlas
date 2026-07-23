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
  common: {
    siteDescription:
      "Sigue ofertas de fidelidad australianas, disponibilidad de asientos premio y tarifas en efectivo — para saber cuándo quemar puntos y cuándo pagar en efectivo.",
  },
  plans: {
    free: {
      tier: "free",
      name: "Free",
      periodHint: "Gratis para siempre — sin tarjeta",
      includes: [
        "Todas las ofertas de Qantas, Velocity, Everyday y Flybuys",
        "Bonos de marketplace, vinos y gift cards",
        "Búsqueda de asientos premio en Económica (próximos 90 días)",
        "Hasta 3 rutas monitoreadas, señaladas en la app",
        "Comparación con la tarifa en efectivo junto a los puntos",
      ],
      locked: [
        "Búsqueda en Económica Premium, Ejecutiva y First",
        "Ventana completa de 12 meses",
        "Alertas de ruta por email",
        "Más rutas monitoreadas",
      ],
    },
    premium: {
      tier: "premium",
      name: "Premium",
      periodHint: "Todas las cabinas, el año entero",
      includes: [
        "Todo lo de Free",
        "Todas las cabinas — de Económica a First",
        "Ventana completa de búsqueda de 12 meses",
        "Alertas por email en hasta 15 rutas monitoreadas",
        "Ayudas de decisión efectivo vs puntos",
      ],
      locked: [
        "Rutas monitoreadas ilimitadas",
        "Alertas prioritarias que revisan el doble de seguido",
      ],
    },
    pro: {
      tier: "pro",
      name: "Pro",
      periodHint: "Para el cazador de puntos serio",
      includes: [
        "Todo lo de Premium",
        "Rutas monitoreadas ilimitadas",
        "Alertas prioritarias — rutas revisadas cada 15 min",
        "Cooldown de alerta más corto, para enterarte antes",
        "Acceso anticipado a nuevos programas y herramientas",
      ],
      locked: [],
    },
  },
  home: {
    hero: {
      badge: "Enfoque en Australia · Puntos + efectivo",
      titleLead: "Puntos y vuelos premio —",
      titleAccent: "todo en un solo lugar.",
      leadA: "A diferencia de las apps de solo puntos, FareAtlas también sigue",
      leadCash: "tarifas en efectivo",
      leadB: "para que sepas cuándo el dinero le gana a los puntos.",
      ctaPrimary: "Empieza a ganar más",
      ctaSecondary: "Buscar asientos premio",
      trust1: "Gratis para empezar",
      trust2: "Cancela cuando quieras",
      trust3: "4 programas AU, una app",
      previewOffers: "Ofertas",
      previewFlights: "Vuelos",
      previewLive: "Vista previa en vivo",
      featured: "Destacado",
      cashAlternative: "Alternativa en efectivo",
    },
    programsEyebrow: "Principales programas de fidelidad de Australia",
    programsTitle: "Todos tus programas, un panel",
    programsLead:
      "Deja de revisar cuatro sitios. Sigue los programas que usas y actúa cuando aparece el valor — bonos de puntos o asientos premio.",
    featuresTitle: "Todo para maximizar puntos y vuelos",
    featuresLead:
      "Un solo camino para ofertas, alertas de premios afinadas a tus fechas de viaje, y comparaciones con efectivo cuando los puntos no convienen.",
    features: [
      {
        icon: "spark",
        title: "Oportunidades de ganar puntos",
        body: "Bonos seleccionados de Qantas, Velocity, Everyday Rewards y Flybuys — actualizados a diario para que dejes de perder los buenos.",
      },
      {
        icon: "plane",
        title: "Búsqueda de asientos premio",
        body: "Busca de Económica a First en los principales programas de millas vía Seats.aero — con enlaces de reserva cuando abren asientos.",
      },
      {
        icon: "cash",
        title: "Monitor de tarifa en efectivo",
        body: "Ve tarifas pagadas junto al costo en puntos. FareAtlas es para quien quiere las dos opciones — sin FOMO de puntos.",
      },
      {
        icon: "bell",
        title: "Alertas que tú controlas",
        body: "Elige rutas, cabinas y ventanas de fecha. Recibe aviso cuando aparezca disponibilidad premio o una oferta caliente — sin actualizar cinco pestañas.",
      },
      {
        icon: "grid",
        title: "Cuatro programas, un panel",
        body: "Deja de saltar entre Qantas, Velocity, Everyday y Flybuys. Un panel para ganar y gastar.",
      },
      {
        icon: "chart",
        title: "Valor, no puntos de vanidad",
        body: "Compara decisiones de centavos-por-punto con precios en efectivo para que cada canje tenga sentido de verdad.",
      },
    ],
    offersTitle: "Oportunidades de puntos de hoy",
    offersLead:
      "Bonos nuevos de Qantas, Velocity, Everyday Rewards y Flybuys.",
    offersCta: "Ver todas las ofertas",
    awardTitle: "Nunca pierdas un asiento premio",
    awardLead:
      "Monitorea de Económica a First. FareAtlas junta disponibilidad premio con alternativas en efectivo para que canjees con intención.",
    cabinsSearchEyebrow: "Busca disponibilidad en vivo de Seats.aero",
    cabinsSearchBody:
      "Económica es gratis para siempre. Económica Premium, Ejecutiva y First vienen con Premium.",
    awardCta: "Abrir búsqueda de premios",
    cabins: [
      {
        code: "Y",
        name: "Económica",
        body: "Alertas inteligentes para la cabina más disponible — ideal para familias y viajes cortos frecuentes.",
      },
      {
        code: "W",
        name: "Económica Premium",
        body: "El punto medio entre valor y comodidad. Atrapa disponibilidad digna de upgrade temprano.",
      },
      {
        code: "J",
        name: "Ejecutiva",
        body: "La cabina soñada. Vigilamos 24/7 para que no pierdas los asientos que se van primero.",
      },
      {
        code: "F",
        name: "First",
        body: "Disponibilidad rara, alto riesgo. Los miembros Premium tienen la ventana completa y alertas.",
      },
    ],
    edgeBadge: "Ventaja FareAtlas",
    edgeTitle: "Paga en efectivo cuando es más inteligente",
    edgeLead:
      "Seguimiento de ofertas y asientos, más un monitor de tarifa en efectivo — para que nunca quemes puntos en una ruta donde el boleto pagado era mejor negocio.",
    stepsTitle: "Empieza en unos tres minutos",
    stepsLead:
      "Configúralo una vez. Deja que FareAtlas vigile ofertas y asientos por ti.",
    steps: [
      {
        n: "1",
        title: "Navega gratis",
        body: "Explora ofertas y ventanas de premio en Económica al instante — sin tarjeta.",
      },
      {
        n: "2",
        title: "Sigue programas y rutas",
        body: "Elige los programas de fidelidad que usas y los pares de ciudades que realmente vuelas.",
      },
      {
        n: "3",
        title: "Actúa en las alertas",
        body: "Vigilamos ofertas y asientos premio para que canjees o pagues en efectivo con confianza.",
      },
    ],
    pricingTeaserTitle: "Empieza gratis. Mejora cuando quieras.",
    pricingTeaserLead:
      "Navega las ofertas gratis para siempre. Premium abre todas las cabinas, la ventana completa y alertas por email; Pro añade rutas ilimitadas y alertas prioritarias.",
    pricingTeaserCta: "Ver todos los planes",
    finalTitle: "Deja de dejar puntos sobre la mesa",
    finalLead:
      "Únete a FareAtlas gratis — sigue bonos, caza asientos premio y compara efectivo para que cada decisión de viaje sea más afilada.",
    finalCtaPrimary: "Empieza gratis",
    finalCtaSecondary: "Buscar vuelos",
    finalNote: "Gratis para empezar. Sin tarjeta de crédito.",
  },
  pricing: {
    eyebrow: "Planes simples",
    title: "Empieza gratis. Mejora cuando quieras cada asiento.",
    lead: "Navega todas las ofertas y busca premios en Económica gratis, para siempre. Premium abre todas las cabinas y la ventana completa de 12 meses con alertas por email; Pro añade rutas ilimitadas y alertas que revisan el doble de seguido — y cada plan muestra la tarifa en efectivo junto a los puntos.",
    monthly: "Mensual",
    annual: "Anual",
    billedMonthly: "Cobrado mensualmente",
    billedYearly: "Cobrado anualmente",
    perMonth: "mes",
    perYear: "año",
    whatYouGet: "Qué incluye",
    upgradeUnlocks: "El upgrade desbloquea",
    startFree: "Empieza gratis",
    goToSearch: "Ir a la búsqueda",
    createAccountToUpgrade: "Crea una cuenta para suscribir",
    unavailable: "No disponible",
    upgradeTo: "Suscribir",
    comingSoon: "Pronto",
    waitlistNote:
      "La facturación aún no está activa en este entorno. Las alertas de ruta ya funcionan — vigilamos tus rutas y señalamos asientos cuando abren. Únete a la lista y te avisamos apenas abran los planes pagos.",
  },
} satisfies Dictionary;
