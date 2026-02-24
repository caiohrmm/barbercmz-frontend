# BarberCMZ Frontend

Interface web do **BarberCMZ**: landing page (conversão), agendamento público por slug e painel (dashboard) para donos e barbeiros. Consome a API do backend para autenticação, barbearias, planos, assinaturas, pagamentos, barbeiros, serviços, clientes e agendamentos.

**Aplicação em produção:** [https://barbercmz-frontend.vercel.app](https://barbercmz-frontend.vercel.app/)

---

## Índice

- [Sobre o projeto](#-sobre-o-projeto)
- [Stack tecnológica](#-stack-tecnológica)
- [Instalação e configuração](#-instalação-e-configuração)
- [Execução](#-execução)
- [Estrutura do projeto](#-estrutura-do-projeto)
- [Arquitetura e fluxo de dados](#-arquitetura-e-fluxo-de-dados)
- [Rotas e páginas](#-rotas-e-páginas)
- [Componentes principais](#-componentes-principais)
- [Autenticação e estado](#-autenticação-e-estado)
- [Design system (landing)](#-design-system-landing)
- [Acessibilidade e performance](#-acessibilidade-e-performance)
- [Fluxo: novo usuário (barbearia)](#-fluxo-novo-usuário-barbearia)
- [Fluxo: cliente que agenda](#-fluxo-cliente-que-agenda)
- [Variáveis de ambiente](#-variáveis-de-ambiente)
- [Status do projeto](#-status-do-projeto)

---

## 📖 Sobre o projeto

Frontend do SaaS multi-tenant de agendamento para barbearias. Três contextos principais:

1. **Landing (/):** Página inicial com foco em conversão (hero, benefícios, como funciona, depoimentos, planos, FAQ). Tema dark/navy com accent laranja, mobile-first.
2. **Agendamento público (/:slug):** Página por slug da barbearia para o cliente escolher serviço, barbeiro, data/horário e agendar (com reCAPTCHA). Sem login.
3. **Dashboard (/dashboard/*):** Painel autenticado para owner e barber: agenda, serviços, clientes, barbeiros, faturamento, configurações. Protegido por subscription ativa ou trial; trial expirado exibe tela “Assinatura expirada” e acesso apenas a billing/plano.

O frontend comunica com a API via axios (rotas autenticadas) e fetch (rotas públicas e server components). Token JWT em memória; refresh em cookie httpOnly.

---

## 🚀 Stack tecnológica

| Área | Tecnologia |
|------|------------|
| **Framework** | Next.js 16 (App Router), React 19 |
| **Estilo** | Tailwind CSS v4, CSS variables (design system landing) |
| **Estado e dados** | TanStack Query (React Query), Context (AuthProvider) |
| **Formulários** | React Hook Form, Zod (@hookform/resolvers) |
| **UI** | Heroicons, Headless UI (Transition, etc.), Framer Motion |
| **Utilitários** | date-fns (pt-BR), axios (api client com interceptors) |
| **Imagens** | next/image (Cloudinary permitido em next.config) |

---

## 📦 Instalação e configuração

```bash
npm install
cp .env.example .env.local
# Opcional: configurar NEXT_PUBLIC_API_URL e NEXT_PUBLIC_RECAPTCHA_SITE_KEY
```

---

## 🏃 Execução

```bash
npm run dev   # Desenvolvimento (http://localhost:3000)
npm run build # Build de produção
npm start     # Servir build (produção)
npm run lint  # ESLint
```

Em desenvolvimento, a API usada é `http://localhost:4000` por padrão (ou `NEXT_PUBLIC_API_URL`).

---

## 📁 Estrutura do projeto

```
app/
├── layout.tsx                 # Root layout: Inter, QueryProvider, AuthProvider
├── page.tsx                   # Landing: composição dos componentes da landing
├── globals.css                # Design system (vars), focus-visible, utilities
├── login/
│   └── page.tsx               # Login (email/senha), redirect ?criado=1
├── planos/
│   ├── layout.tsx             # Layout da página de planos
│   └── page.tsx               # Listagem pública de planos (preços, CTA)
├── criar-barbearia/
│   └── page.tsx               # Wizard: dados barbearia → dono → plano → confirmar
├── dashboard/
│   ├── layout.tsx             # Auth gate, subscription gate, header + nav
│   ├── page.tsx               # Home do dashboard (resumo, links)
│   ├── _components/
│   │   ├── dashboard-header.tsx
│   │   ├── dashboard-nav.tsx
│   │   └── subscription-expired-screen.tsx
│   ├── agenda/page.tsx        # Lista de agendamentos (filtros, status)
│   ├── barbers/page.tsx       # CRUD barbeiros (limite do plano)
│   ├── services/page.tsx     # CRUD serviços
│   ├── clients/page.tsx      # Lista clientes, bloquear/desbloquear
│   ├── billing/page.tsx       # Faturamento: plano atual, datas, histórico pagamentos
│   ├── billing/plan/page.tsx  # Mudar plano (escolher plano, downgrade error)
│   └── settings/page.tsx     # Logo + formulário dados barbearia (nome/slug)
├── (public)/
│   └── [slug]/
│       ├── page.tsx           # Server: barbershop + services → BookingStageOne
│       ├── loading.tsx
│       ├── not-found.tsx
│       └── _components/
│           └── booking-stage-one.tsx  # Fluxo completo de agendamento (reCAPTCHA)

components/
└── landing/
    ├── index.ts
    ├── Navbar.tsx
    ├── Hero.tsx
    ├── SocialProof.tsx
    ├── Benefits.tsx
    ├── ProductPreview.tsx
    ├── HowItWorks.tsx
    ├── Testimonials.tsx
    ├── Pricing.tsx
    ├── FAQ.tsx
    ├── FinalCTA.tsx
    └── Footer.tsx

lib/
├── api.ts                     # Axios: baseURL, interceptors (token, refresh 401)
├── auth.ts                    # login, logout, getCurrentUser, decodeToken
├── constants.ts               # API_URL, ROUTES, USER_ROLES
├── validators.ts              # Schemas Zod (login, criar barbearia, booking, barber, etc.)
├── barbershop.ts              # getBarbershopById, createBarbershop, updateBarbershop, uploadLogo
├── barbers.ts                 # getBarbers (auth)
├── services.ts                # getServices (auth)
├── customers.ts               # getCustomers (auth)
├── appointments.ts            # getAppointments (auth)
├── plans.ts                   # getPlans (público)
├── subscriptions.ts          # getCurrentSubscription, updatePlan, isSubscriptionExpired, etc.
├── payments.ts               # getPayments, createMockPayment (auth, owner)
├── public-api.ts             # getBarbershopBySlug, getPublicServices, getPublicBarbers, getAvailableSlots, createAppointment (fetch, sem auth)
└── providers/
    ├── auth-provider.tsx      # Context: user, isLoading, isAuthenticated, logout, refreshUser
    └── query-provider.tsx     # QueryClientProvider (staleTime 1min, retry 1)

types/
└── index.ts                   # User, Barbershop, Plan, Subscription, Barber, Service, Customer, Appointment, Payment, etc.
```

---

## 🏗️ Arquitetura e fluxo de dados

- **App Router:** Rotas em `app/`; layouts aninhados (root → dashboard); server components onde faz sentido (ex.: `(public)/[slug]/page.tsx` busca barbershop e services no servidor).
- **Autenticação:** Token JWT guardado em memória (não em localStorage). Axios adiciona `Authorization: Bearer <token>`; em 401 tenta refresh (POST /auth/refresh com cookie) e repete a request; se refresh falhar, limpa token e redireciona para /login.
- **AuthProvider:** Fornece `user` (decodificado do token), `isAuthenticated`, `logout`, `refreshUser`. Dashboard layout redireciona para /login se não autenticado.
- **Subscription gate:** No layout do dashboard, `getCurrentSubscription` (React Query) e `isSubscriptionExpired(subscription)` (apenas status active/trial permitem acesso). Se expirado e rota não for billing ou billing/plan, renderiza `SubscriptionExpiredScreen` (CTA “Escolher plano e reativar”).
- **Dados da API:** Rotas autenticadas usam o cliente `lib/api` (axios); páginas públicas e server components usam `fetch` ou `lib/public-api` (fetch direto à API_URL). TanStack Query para cache e invalidação (ex.: após troca de plano, invalida subscription e barbershop).

---

## 📝 Rotas e páginas

| Rota | Tipo | Descrição |
|------|------|-----------|
| `/` | Pública | Landing (Navbar, Hero, SocialProof, Benefits, ProductPreview, HowItWorks, Testimonials, Pricing, FAQ, FinalCTA, Footer) |
| `/login` | Pública | Login (email/senha). Query `?criado=1` exibe mensagem de sucesso. Redirect para /dashboard. |
| `/planos` | Pública | Lista de planos (preços, features). CTA para começar / login. |
| `/criar-barbearia` | Pública | Wizard em 4 passos: dados barbearia → dono → plano → confirmar. POST /barbershops. Redirect para /login?criado=1. |
| `/[slug]` | Pública | Agendamento pela barbearia (slug). Server carrega barbershop + services; cliente escolhe serviço, barbeiro, data, horário, nome e telefone; envia com reCAPTCHA (POST /appointments). |
| `/dashboard` | Autenticada | Home do painel (resumo do dia, links para agenda, serviços, clientes, barbeiros, faturamento, configurações). |
| `/dashboard/agenda` | Autenticada + subscription | Lista de agendamentos (filtros, alteração de status). |
| `/dashboard/barbers` | Autenticada + subscription | Lista e CRUD de barbeiros (respeitando limite do plano). |
| `/dashboard/services` | Autenticada + subscription | Lista e CRUD de serviços. |
| `/dashboard/clients` | Autenticada + subscription | Lista de clientes, bloqueio/desbloqueio. |
| `/dashboard/billing` | Autenticada | Plano atual, status, datas, barbeiros, histórico de pagamentos (owner). |
| `/dashboard/billing/plan` | Autenticada | Mudar plano (owner). Escolher plano, tratamento de erro de downgrade. |
| `/dashboard/settings` | Autenticada | Upload de logo e formulário de edição (nome e slug da barbearia). |

---

## 🧩 Componentes principais

- **Landing (`components/landing/`):** Navbar (sticky, menu mobile), Hero (headline, 2 CTAs, badges), SocialProof, Benefits (cards com ícones), ProductPreview (mockup), HowItWorks (3 passos), Testimonials, Pricing (2 planos), FAQ (accordion), FinalCTA, Footer.
- **Dashboard:** `DashboardHeader`, `DashboardNav`, `SubscriptionExpiredScreen` (tela quando subscription não é active/trial).
- **Agendamento público:** `BookingStageOne` (serviço → barbeiro → data → slots → nome/telefone → reCAPTCHA → submit). Usa `lib/public-api` (fetch) e exige `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` para o widget.

Formulários críticos (login, criar barbearia, booking, settings, billing/plan) usam React Hook Form + Zod; erros da API são exibidos de forma amigável.

---

## 🔐 Autenticação e estado

- **Login:** `lib/auth.ts` → `api.post('/auth/login')`; armazena `accessToken` em memória via `setAccessToken`; retorna `AuthResponse` (user + token). Frontend chama `refreshUser()` para popular o AuthProvider.
- **Refresh:** Interceptor axios em 401 faz POST /auth/refresh (cookie); recebe novo accessToken e repete a request; em falha redireciona para /login.
- **Logout:** POST /auth/logout + `clearAccessToken()` + setUser(null).
- **User no contexto:** Decodificado do JWT (id, name, email, role, barbershopId). Não é revalidado a cada request; apenas ao fazer refresh do token ou novo login.

---

## 🎨 Design system (landing)

Definido em `app/globals.css`:

- **Cores:** `--background: #0c1222` (navy), `--foreground`, `--muted`, `--border`, `--accent` (laranja), `--card`. Landing usa fundo escuro e accent laranja nos CTAs e destaques.
- **Foco:** `*:focus-visible` com outline em amber para acessibilidade.
- **Tipografia:** Inter (layout root). Hierarquia: H1 único na Hero; H2 por seção; textos curtos e escaneáveis no mobile.

Dashboard usa tema claro (bg-zinc-50, cards brancos) para contraste com a landing.

---

## ♿ Acessibilidade e performance

- **Contraste:** Textos zinc-100/200/300/400 sobre fundo escuro na landing; botões de alto contraste (amber sobre escuro).
- **Foco:** focus-visible em links e botões; FAQ e menu mobile com aria-expanded/aria-controls.
- **Semântica:** Um único h1 por página; landmarks (header, main, nav, footer); listas e blockquotes corretos.
- **Performance:** Landing sem imagens pesadas (ProductPreview em CSS); next/image para logo da barbearia e avatares quando existirem. TanStack Query com staleTime 1min e retry 1 para evitar requisições desnecessárias.

---

## 🔄 Fluxo: novo usuário (barbearia)

1. Usuário acessa `/` ou `/planos` e clica em “Começar grátis” / “Criar minha barbearia”.
2. **Criar barbearia:** `/criar-barbearia` — wizard em 4 passos (dados da barbearia, dono, plano, confirmar). Submit → POST /barbershops (com planId) → backend cria barbershop + owner + subscription trial (30 dias).
3. Redirect para `/login?criado=1` com mensagem de sucesso.
4. Login com email e senha → POST /auth/login → token em memória → redirect para `/dashboard`.
5. Dashboard carrega GET /subscriptions/me e GET /barbershops/:id; se status for trial ou active, exibe todas as seções (agenda, serviços, clientes, barbeiros, faturamento, configurações).
6. Após 30 dias, na próxima leitura da subscription o backend retorna status suspended; o layout do dashboard mostra `SubscriptionExpiredScreen` em todas as rotas exceto /dashboard/billing e /dashboard/billing/plan. Usuário pode clicar em “Escolher plano e reativar” e trocar de plano (PATCH /subscriptions/me/plan) sem pagamento integrado ainda.

---

## 🔄 Fluxo: cliente que agenda

1. Cliente acessa o link da barbearia (ex.: `https://barbercmz-frontend.vercel.app/minha-barbearia`).
2. **Server:** `(public)/[slug]/page.tsx` busca barbershop por slug e serviços (getBarbershopBySlug, getPublicServices). Se não encontrar ou inativa → notFound().
3. **Client:** `BookingStageOne` exibe nome/logo da barbearia; cliente escolhe serviço, barbeiro (se houver mais de um), data (hoje até +20 dias) e horário (slots vindos de GET .../available-slots).
4. Formulário: nome e telefone (E.164); validação Zod; máscara de telefone em PT-BR.
5. reCAPTCHA v2 (NEXT_PUBLIC_RECAPTCHA_SITE_KEY) é carregado; no submit o token é enviado no body.
6. POST /appointments com barbershopId, barberId, serviceId, customerName, customerPhone, startTime (ISO), captchaToken. Backend valida reCAPTCHA, bloqueio do cliente, limite de 2 agendamentos em aberto e conflito de horário.
7. Sucesso: tela de confirmação. A barbearia vê o agendamento no dashboard.

---

## 🔧 Variáveis de ambiente

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| `NEXT_PUBLIC_API_URL` | Não | URL da API. Em desenvolvimento default `http://localhost:4000`; em produção default `https://barbercmz.onrender.com/`. |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Agendamento | Chave de site reCAPTCHA v2 para o widget na página de agendamento. Sem ela o widget não aparece e o submit pode falhar no backend. |

Crie `.env.local` para desenvolvimento. Na Vercel, configure as variáveis no projeto.

---

## 📊 Status do projeto

- Landing page (estrutura completa, conversão, mobile-first)
- Login e logout (JWT em memória, refresh por cookie)
- Cadastro de barbearia (wizard com plano e trial)
- Página de planos (pública)
- Dashboard (home, agenda, barbeiros, serviços, clientes, faturamento, mudar plano, configurações)
- Porte de assinatura (tela de expiração, billing sempre acessível)
- Troca de plano (owner, tratamento de erro de downgrade)
- Histórico de pagamentos (lista + mock em dev)
- Edição de dados da barbearia (nome, slug único) e upload de logo
- Agendamento público por slug (serviço, barbeiro, data, slots, nome/telefone, reCAPTCHA)
- Validação de formulários (Zod + React Hook Form)
- Acessibilidade (contraste, foco, semântica) e performance (Query, imagens)

---

## 📄 Licença

ISC

**Links**

- **Frontend (produção):** [https://barbercmz-frontend.vercel.app](https://barbercmz-frontend.vercel.app/)
- **API (produção):** [https://barbercmz.onrender.com](https://barbercmz.onrender.com)
