# BarberCMZ Frontend

Interface web do sistema de agendamento para barbearias: landing, agendamento público e painel (dashboard) para donos e barbeiros.

**Aplicação em produção:** [https://barbercmz-frontend.vercel.app](https://barbercmz-frontend.vercel.app/)

## Stack

- [Next.js](https://nextjs.org) (App Router)
- [React](https://react.dev/) 19
- [Tailwind CSS](https://tailwindcss.com)
- [TanStack Query](https://tanstack.com/query)
- [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev)

## Desenvolvimento

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000). O frontend usa a API local por padrão (`http://localhost:4000`). Para apontar para outra URL, crie um `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Build e deploy

```bash
npm run build
npm start
```

### Deploy na Vercel

O projeto está configurado para deploy na [Vercel](https://vercel.com). Em produção, a API utilizada é a hospedada no Render.

- **Variável opcional:** `NEXT_PUBLIC_API_URL` — URL da API. Se não for definida, em produção o app usa `https://barbercmz.onrender.com`.
- Para usar outra API em produção, defina `NEXT_PUBLIC_API_URL` nas variáveis de ambiente do projeto na Vercel.

## Estrutura principal

- `app/` — Rotas (App Router)
  - `page.tsx` — Home (landing)
  - `login/`, `planos/` — Autenticação e planos
  - `dashboard/` — Painel (agenda, serviços, clientes, barbeiros, faturamento, configurações)
  - `(public)/[slug]/` — Página pública de agendamento por slug da barbearia
- `lib/` — API client, constantes, validadores, providers
- `types/` — Tipos TypeScript

## Links

- **Frontend (produção):** [https://barbercmz-frontend.vercel.app](https://barbercmz-frontend.vercel.app/)
- **API (produção):** [https://barbercmz.onrender.com](https://barbercmz.onrender.com)
