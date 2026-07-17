# FareAtlas - Guia de APIs e servicos

Este documento organiza os acessos necessarios para transformar o MVP em um produto funcional.

Use a numeracao das etapas para tirar duvidas por partes, por exemplo: `vamos fazer a etapa 1`.

## Ordem recomendada

- [x] 1. Seats.aero - voos com pontos
- [ ] 2. Amadeus - tarifas em dinheiro
- [x] 3. Neon - banco de dados (schema + seed + fallbacks)
- [ ] 4. Clerk - login de usuarios
- [ ] 5. Resend - alertas por e-mail
- [ ] 6. Stripe - assinaturas
- [ ] 7. Twilio - alertas por SMS, opcional
- [x] 8. Ofertas de fidelidade - seed editorial (admin UI next)
- [ ] 9. Vercel - publicacao e tarefas agendadas

## 1. Voos com pontos - Seats.aero

### Onde acessar

- Cadastro: https://seats.aero/register
- Documentacao: https://developers.seats.aero/
- Regras de acesso: https://docs.seats.aero/article/68-do-you-have-an-api
- Contato comercial: support@seats.aero

### Acesso necessario

O plano Pro comum nao permite uso comercial. O FareAtlas precisa de autorizacao comercial por escrito.

Solicitar:

- Cached Search API
- Bulk Availability API
- Live Search API
- Uso comercial em producao
- Cobertura para Australia, Oceania, Qantas, Velocity e programas parceiros
- Condicoes para cache e armazenamento dos resultados
- Limites, precos e regras de atribuicao

### Informacoes para enviar

- Produto: FareAtlas
- Publico: australianos comparando viagens com pontos ou dinheiro
- Funcionalidades: pesquisa, comparacao e alertas
- Regiao principal: Australia e Oceania
- Volume inicial estimado: 10.000 a 50.000 consultas por mes
- Uso somente leitura; sem venda ou intermediacao de pontos

### Variavel de ambiente

```env
AWARD_AVAILABILITY_API_KEY=""
# alias opcional:
# SEATS_AERO_API_KEY=""
```

### Integracao no codigo (etapa 1 concluida no MVP)

| Peca | Caminho |
| --- | --- |
| Client | `src/lib/seats-aero/` |
| Busca cacheada | `GET /api/awards/search?origin=SYD&destination=HND&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` |
| Detalhe de voos | `GET /api/awards/[id]/trips` |
| UI | Dashboard + formulário de busca em Award seats |

Header usado: `Partner-Authorization` (token OAuth `seats:…` recebe prefixo `Bearer` automaticamente).

Na Vercel: Settings → Environment Variables → `AWARD_AVAILABILITY_API_KEY` (Production + Preview).

### Cache diario no Neon (quota Seats.aero)

Para nao gastar as ~1000 chamadas/dia do Partner API em buscas repetidas:

| Fluxo | Comportamento |
| --- | --- |
| 1a busca do dia (rota+filtros) | Chama Seats.aero e grava em `AwardSearchCache` / `AwardTripCache` |
| Mesma busca no mesmo dia (Sydney) | Le do Neon — **0** chamada a Seats.aero |
| Cron 14:05 UTC | `GET /api/cron/award-cache?mode=purge` limpa as tabelas |
| Debug | `?refresh=1` forca API e regrava o cache |

Tambem ha prune lazy ao gravar (remove `dayKey` antigo). Configure `CRON_SECRET` na Vercel.

## 2. Tarifas em dinheiro - Amadeus

### Onde acessar

- Portal: https://developers.amadeus.com/
- Guia inicial: https://developers.amadeus.com/self-service/apis-docs/guides/developer-guides/quick-start/
- Producao: https://developers.amadeus.com/self-service/apis-docs/guides/developer-guides/API-Keys/moving-to-production/

### Como obter as chaves

1. Criar a conta e confirmar o e-mail.
2. Abrir `My Self-Service Workspace`.
3. Clicar em `Create New App`.
4. Criar o aplicativo `FareAtlas`.
5. Guardar `API Key` e `API Secret`.
6. Comecar no ambiente Test.
7. Quando estiver pronto, clicar em `Get Production environment`.

### APIs necessarias

- Flight Offers Search
- Flight Offers Price
- Airport & City Search

### Variaveis de ambiente

```env
AMADEUS_API_KEY=""
AMADEUS_API_SECRET=""
```

O placeholder atual `CASH_FARES_API_KEY` sera substituido por essas duas variaveis.

### Alternativas futuras

- Skyscanner Travel API: melhor para comparacao com redirecionamento e afiliacao, mas exige aprovacao comercial e audiencia estabelecida.
- Duffel: indicado se o FareAtlas passar a vender e emitir passagens dentro do proprio aplicativo.

## 3. Banco de dados - Neon

### Onde acessar

- Console: https://console.neon.tech/
- Integracao com Vercel: https://neon.com/docs/guides/vercel-manual
- Connection pooling: https://neon.com/docs/connect/connection-pooling

### Configuracao

1. Criar o projeto `fareatlas`.
2. Selecionar a regiao `Asia Pacific - Sydney`.
3. Criar ou selecionar o banco `fareatlas`.
4. Clicar em `Connect`.
5. Ativar `Connection pooling`.
6. Copiar a connection string com `-pooler` no hostname.

### Variaveis de ambiente

```env
DATABASE_URL="postgresql://...-pooler.../fareatlas?sslmode=require"
DIRECT_URL="postgresql://.../fareatlas?sslmode=require"
```

### Integracao no codigo (etapa 3 concluida no MVP)

| Peca | Caminho |
| --- | --- |
| Schema | `prisma/schema.prisma` |
| Seed | `prisma/seed.ts` |
| Client | `src/lib/db.ts` |
| Offers / cash | `src/lib/offers.ts` |
| Watches API | `POST /api/watches` |
| Bootstrap deploy | `scripts/db-setup.mjs` |

Modelos: `LoyaltyProgram`, `Offer`, `AwardWatch`, `CashFare`, `AppSetting`.

Sem `DATABASE_URL` o app sobe com catalogo demo (fallback).

## 4. Login de usuarios - Clerk

### Onde acessar

- Dashboard: https://dashboard.clerk.com/
- Guia Next.js: https://clerk.com/docs/nextjs/getting-started/quickstart
- Google Login: https://clerk.com/docs/guides/configure/auth-strategies/social-connections/google
- Google Cloud: https://console.cloud.google.com/apis/credentials

### Configuracao inicial

1. Criar o aplicativo `FareAtlas`.
2. Abrir `API Keys`.
3. Copiar a Publishable Key e a Secret Key.
4. Habilitar login por e-mail.
5. Habilitar Google em `SSO connections`.

Em desenvolvimento, o Clerk oferece credenciais Google compartilhadas. Em producao, sera necessario criar um OAuth Client no Google Cloud e informar a callback exibida pelo Clerk.

### Variaveis de ambiente

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
```

## 5. Alertas por e-mail - Resend

### Onde acessar

- Dashboard: https://resend.com/
- Dominios: https://resend.com/domains
- Chaves: https://resend.com/api-keys
- Documentacao: https://resend.com/docs/dashboard/domains/introduction

### Configuracao

1. Comprar ou configurar o dominio do FareAtlas.
2. Adicionar um subdominio como `updates.seudominio.com` no Resend.
3. Copiar os registros SPF e DKIM para o provedor de DNS.
4. Aguardar o status `Verified`.
5. Criar uma API Key de envio.

### Variaveis de ambiente

```env
RESEND_API_KEY="re_..."
EMAIL_FROM="FareAtlas <alerts@updates.seudominio.com>"
```

## 6. Assinaturas - Stripe

### Onde acessar

- Dashboard: https://dashboard.stripe.com/
- Chaves: https://dashboard.stripe.com/apikeys
- Documentacao: https://docs.stripe.com/keys
- Assinaturas: https://docs.stripe.com/billing/subscriptions

### Configuracao

1. Criar uma conta Stripe australiana.
2. Comecar em Sandbox/Test mode.
3. Criar o produto `FareAtlas Pro`.
4. Criar precos mensal e anual em AUD.
5. Copiar as chaves de teste.
6. Depois do deploy, criar o webhook `https://seu-dominio.com/api/stripe/webhook`.
7. Copiar o signing secret do webhook.

### Variaveis de ambiente

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_MONTHLY="price_..."
STRIPE_PRICE_YEARLY="price_..."
```

## 7. Alertas por SMS - Twilio, opcional

### Recomendacao

Comecar somente com e-mail. SMS adiciona custo e exigencias regulatorias australianas.

Desde 1 de julho de 2026, Sender IDs alfanumericos usados na Australia precisam estar registrados na ACMA. Identificadores nao registrados podem aparecer como `Unverified`.

### Onde acessar

- Console: https://console.twilio.com/
- API de mensagens: https://www.twilio.com/docs/messaging/api
- Registro australiano: https://help.twilio.com/articles/47624808819483-Register-your-Alphanumeric-Sender-ID-for-Australia-in-the-Twilio-Console

### Documentos que podem ser exigidos

- Registro comercial ou ASIC company extract
- Prova do dominio ou marca
- Documento de identidade de um representante
- Carta de autorizacao, quando aplicavel
- Descricao e exemplo das mensagens

### Variaveis de ambiente

```env
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_FROM_NUMBER=""
```

## 8. Ofertas Qantas, Velocity, Flybuys e Everyday Rewards

Nao existe uma API publica centralizada para essas ofertas.

### Solucao para o MVP

Criar um painel administrativo e armazenar no Neon:

- Programa de fidelidade
- Titulo da oferta
- Descricao
- Quantidade de pontos ou bonus
- Data inicial e final
- URL oficial
- Imagem, quando autorizada
- Status de verificacao
- Data da ultima revisao

### Futuro

- Negociar feeds comerciais ou programas de afiliados.
- Criar importadores somente para fontes publicas e autorizadas.
- Nao depender de scraping de areas autenticadas.

## 9. Publicacao - Vercel

### Onde acessar

- Novo projeto: https://vercel.com/new
- Variaveis: https://vercel.com/docs/environment-variables
- Cron Jobs: https://vercel.com/docs/cron-jobs

### Configuracao

1. Colocar o projeto em um repositorio privado no GitHub.
2. Importar o repositorio na Vercel.
3. Adicionar as variaveis em `Settings > Environment Variables`.
4. Configurar dominio e DNS.
5. Configurar tarefas de atualizacao e alertas com Vercel Cron.

### Variavel para proteger tarefas agendadas

```env
CRON_SECRET="uma-string-aleatoria-com-pelo-menos-16-caracteres"
```

## Lista consolidada de variaveis

```env
DATABASE_URL=""

AWARD_AVAILABILITY_API_KEY=""

AMADEUS_API_KEY=""
AMADEUS_API_SECRET=""

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
CLERK_SECRET_KEY=""

RESEND_API_KEY=""
EMAIL_FROM=""

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
STRIPE_PRICE_MONTHLY=""
STRIPE_PRICE_YEARLY=""

TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_FROM_NUMBER=""

CRON_SECRET=""
```

## Seguranca

- Nunca enviar chaves secretas por chat ou e-mail.
- Nunca colocar chaves secretas em variaveis iniciadas por `NEXT_PUBLIC_`.
- Nunca versionar `.env.local` no GitHub.
- Usar chaves de teste durante o desenvolvimento.
- Trocar para chaves de producao somente depois dos testes.
- Configurar os segredos tambem na Vercel antes de publicar.
