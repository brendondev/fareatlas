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
  common: {
    siteDescription:
      "Acompanhe ofertas de fidelidade australianas, disponibilidade de assentos-prêmio e tarifas em dinheiro — pra você saber quando queimar pontos e quando pagar em dinheiro.",
  },
  plans: {
    free: {
      tier: "free",
      name: "Free",
      periodHint: "Grátis pra sempre — sem cartão",
      includes: [
        "Todas as ofertas de Qantas, Velocity, Everyday e Flybuys",
        "Bônus de marketplace, vinhos e gift cards",
        "Busca de assentos-prêmio em Econômica (próximos 90 dias)",
        "Até 3 rotas monitoradas, sinalizadas no app",
        "Comparação com a tarifa em dinheiro ao lado dos pontos",
      ],
      locked: [
        "Busca em Econômica Premium, Executiva e First",
        "Janela completa de 12 meses",
        "Alertas de rota por e-mail",
        "Mais rotas monitoradas",
      ],
    },
    premium: {
      tier: "premium",
      name: "Premium",
      periodHint: "Todas as cabines, o ano inteiro",
      includes: [
        "Tudo do Free",
        "Todas as cabines — de Econômica a First",
        "Janela completa de busca de 12 meses",
        "Alertas por e-mail em até 15 rotas monitoradas",
        "Ajudas de decisão dinheiro vs pontos",
      ],
      locked: [
        "Rotas monitoradas ilimitadas",
        "Alertas prioritários que checam duas vezes mais rápido",
      ],
    },
    pro: {
      tier: "pro",
      name: "Pro",
      periodHint: "Pra quem caça pontos a sério",
      includes: [
        "Tudo do Premium",
        "Rotas monitoradas ilimitadas",
        "Alertas prioritários — rotas rechecadas a cada 15 min",
        "Cooldown de alerta menor, pra você saber antes",
        "Acesso antecipado a novos programas e ferramentas",
      ],
      locked: [] as string[],
    },
  },
  home: {
    hero: {
      badge: "Foco na Austrália · Pontos + dinheiro",
      titleLead: "Pontos e voos-prêmio —",
      titleAccent: "tudo num lugar só.",
      leadA: "Diferente de apps só de pontos, o FareAtlas também acompanha",
      leadCash: "tarifas em dinheiro",
      leadB: "pra você saber quando o dólar ganha dos pontos.",
      ctaPrimary: "Comece a ganhar mais",
      ctaSecondary: "Buscar assentos-prêmio",
      trust1: "Grátis pra começar",
      trust2: "Cancele quando quiser",
      trust3: "4 programas AU, um app",
      previewOffers: "Ofertas",
      previewFlights: "Voos",
      previewLive: "Prévia ao vivo",
      featured: "Destaque",
      cashAlternative: "Alternativa em dinheiro",
    },
    programsEyebrow: "Principais programas de fidelidade da Austrália",
    programsTitle: "Todos os seus programas, um painel",
    programsLead:
      "Pare de checar quatro sites. Siga os programas que você usa e aja quando o valor aparecer — bônus de pontos ou assentos-prêmio.",
    featuresTitle: "Tudo pra maximizar pontos e voos",
    featuresLead:
      "Um só caminho pra ofertas, alertas de prêmios afinados às suas datas de viagem, e comparações com dinheiro quando os pontos não valem a pena.",
    features: [
      {
        icon: "spark",
        title: "Oportunidades de ganhar pontos",
        body: "Bônus selecionados de Qantas, Velocity, Everyday Rewards e Flybuys — atualizados diariamente pra você parar de perder os bons.",
      },
      {
        icon: "plane",
        title: "Busca de assentos-prêmio",
        body: "Busque de Econômica a First nos principais programas de milhas via Seats.aero — com links de reserva quando abrem assentos.",
      },
      {
        icon: "cash",
        title: "Monitor de tarifa em dinheiro",
        body: "Veja tarifas pagas ao lado do custo em pontos. O FareAtlas é feito pra quem quer as duas opções — sem FOMO de pontos.",
      },
      {
        icon: "bell",
        title: "Alertas que você controla",
        body: "Escolha rotas, cabines e janelas de data. Seja avisado quando surgir disponibilidade-prêmio ou uma oferta quente — sem atualizar cinco abas.",
      },
      {
        icon: "grid",
        title: "Quatro programas, um painel",
        body: "Pare de pular entre Qantas, Velocity, Everyday e Flybuys. Um painel pra ganhar e gastar.",
      },
      {
        icon: "chart",
        title: "Valor, não pontos de vaidade",
        body: "Compare decisões de centavos-por-ponto com preços em dinheiro pra cada resgate fazer sentido de verdade.",
      },
    ],
    offersTitle: "Oportunidades de pontos de hoje",
    offersLead: "Bônus novos de Qantas, Velocity, Everyday Rewards e Flybuys.",
    offersCta: "Ver todas as ofertas",
    awardTitle: "Nunca perca um assento-prêmio",
    awardLead:
      "Monitore de Econômica a First. O FareAtlas junta disponibilidade-prêmio com alternativas em dinheiro pra você resgatar com intenção.",
    cabinsSearchEyebrow: "Busque disponibilidade ao vivo do Seats.aero",
    cabinsSearchBody:
      "Econômica é grátis pra sempre. Econômica Premium, Executiva e First vêm com o Premium.",
    awardCta: "Abrir busca de prêmios",
    cabins: [
      {
        code: "Y",
        name: "Econômica",
        body: "Alertas espertos pra cabine mais disponível — ideal pra famílias e trechos curtos frequentes.",
      },
      {
        code: "W",
        name: "Econômica Premium",
        body: "O meio-termo entre valor e conforto. Pegue disponibilidade digna de upgrade cedo.",
      },
      {
        code: "J",
        name: "Executiva",
        body: "A cabine dos sonhos. Monitoramos 24/7 pra você não perder os assentos que somem primeiro.",
      },
      {
        code: "F",
        name: "First",
        body: "Disponibilidade rara, aposta alta. Membros Premium têm a janela completa e alertas.",
      },
    ],
    edgeBadge: "Diferencial FareAtlas",
    edgeTitle: "Pague em dinheiro quando for mais esperto",
    edgeLead:
      "Monitoramento de ofertas e assentos, mais um acompanhamento de tarifa em dinheiro — pra você nunca queimar pontos numa rota onde o bilhete pago era o melhor negócio.",
    stepsTitle: "Comece em uns três minutos",
    stepsLead:
      "Configure uma vez. Deixe o FareAtlas vigiar ofertas e assentos por você.",
    steps: [
      {
        n: "1",
        title: "Navegue grátis",
        body: "Explore ofertas e janelas de prêmio em Econômica na hora — sem cartão.",
      },
      {
        n: "2",
        title: "Siga programas e rotas",
        body: "Escolha os programas de fidelidade que você usa e os pares de cidades que você realmente voa.",
      },
      {
        n: "3",
        title: "Aja nos alertas",
        body: "Vigiamos ofertas e assentos-prêmio pra você resgatar ou pagar em dinheiro com confiança.",
      },
    ],
    pricingTeaserTitle: "Comece grátis. Faça upgrade quando quiser.",
    pricingTeaserLead:
      "Navegue nas ofertas de graça pra sempre. O Premium abre todas as cabines, a janela completa e alertas por e-mail; o Pro adiciona rotas ilimitadas e alertas prioritários.",
    pricingTeaserCta: "Ver todos os planos",
    finalTitle: "Pare de deixar pontos na mesa",
    finalLead:
      "Entre no FareAtlas de graça — acompanhe bônus, cace assentos-prêmio e compare dinheiro pra cada decisão de viagem ser mais afiada.",
    finalCtaPrimary: "Comece grátis",
    finalCtaSecondary: "Buscar voos",
    finalNote: "Grátis pra começar. Sem cartão de crédito.",
  },
};
