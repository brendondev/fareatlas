/**
 * Portuguese (Brazil) — the default locale and the source-of-truth shape.
 *
 * `Dictionary` is derived from this object (see ../index.ts), so en.ts and es.ts
 * must mirror its structure exactly or TypeScript fails the build. Add a key
 * here first, then to the others.
 *
 * Only translated surfaces live here. Pages not yet migrated still read their
 * English strings inline; they'll move in as they're localized.
 */
export const pt = {
  nav: {
    earn: "Ganhar",
    earnItems: {
      offers: { label: "Ofertas", hint: "Promoções de pontos bônus" },
      wine: { label: "Vinhos", hint: "Ranking por custo a cada 1.000 pontos" },
      giftCards: { label: "Gift cards", hint: "Melhor pontos por real" },
      cards: { label: "Cartões & perks", hint: "Bônus de adesão" },
    },
    flights: "Voos",
    alerts: "Alertas",
    marketplace: "Marketplace",
    partners: "Parceiros",
    perks: "Benefícios",
    guides: "Guias",
    pricing: "Planos",
  },
  header: {
    tagline: "Pontos · dinheiro · prêmios",
    searchSeats: "Buscar assentos",
    browseOffers: "Ver ofertas",
    account: "Minha conta",
    signIn: "Entrar",
    getStarted: "Começar",
    searchAwardSeats: "Buscar assentos-prêmio",
    menu: "Menu",
    language: "Idioma",
  },
  footer: {
    product: "Produto",
    company: "Empresa",
    offers: "Ofertas",
    flights: "Voos",
    marketplace: "Marketplace",
    partners: "Parceiros",
    wine: "Vinhos",
    giftCards: "Gift cards",
    cards: "Cartões & perks",
    guides: "Guias",
    premiumPerks: "Benefícios Premium",
    pricing: "Planos",
    contact: "Contato",
    privacy: "Privacidade",
    terms: "Termos",
    auFirstHeading: "Foco na Austrália",
    auFirstBody:
      "Feito para Qantas, Velocity, Everyday Rewards e Flybuys — com tarifas em dinheiro para você nunca queimar pontos quando o dólar for mais esperto.",
    rights: "Todos os direitos reservados.",
    dataLine: "Dados de prêmios via Seats.aero · Comparação de tarifas em breve via Amadeus",
    disclaimer:
      "Sem afiliação ou endosso de Qantas, Virgin Australia, Everyday Rewards, Flybuys ou qualquer companhia aérea ou programa de fidelidade. Marcas pertencem aos seus donos. Preços em pontos e disponibilidade de assentos mudam sem aviso — sempre confirme com o programa antes de reservar ou transferir.",
  },
};
