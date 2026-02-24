import Link from 'next/link';
import { CheckIcon } from '@heroicons/react/24/solid';
import { ROUTES } from '@/lib/constants';

const plans = [
  {
    name: 'Básico',
    price: 40,
    description: 'Para começar com 1 barbeiro',
    features: ['1 barbeiro', 'Agenda ilimitada', 'Controle de clientes', 'Link de agendamento'],
    cta: 'Começar com Básico',
    highlighted: false,
  },
  {
    name: 'Crescimento',
    price: 60,
    description: 'Até 5 barbeiros',
    features: ['Até 5 barbeiros', 'Tudo do Básico', 'Menos faltas (bloqueio automático)', 'Suporte prioritário'],
    cta: 'Começar com Crescimento',
    highlighted: true,
  },
];

function formatPrice(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}

export function Pricing() {
  return (
    <section id="planos" className="scroll-mt-20 border-t border-zinc-800/80 bg-zinc-900/40 px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-2xl font-bold text-zinc-100 sm:text-3xl">
          Planos simples
        </h2>
        <p className="mt-2 text-center text-zinc-400 sm:text-lg">
          30 dias grátis em qualquer plano. Sem cartão para testar.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`flex flex-col rounded-2xl border p-6 shadow-lg sm:p-8 ${
                plan.highlighted
                  ? 'border-amber-500/50 bg-zinc-800/80 ring-2 ring-amber-500/30'
                  : 'border-zinc-800 bg-zinc-900/60'
              }`}
            >
              {plan.highlighted && (
                <span className="mb-4 inline-block w-fit rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-400">
                  Mais popular
                </span>
              )}
              <h3 className="text-lg font-semibold text-zinc-100">{plan.name}</h3>
              <p className="mt-1 text-sm text-zinc-400">{plan.description}</p>
              <p className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-zinc-100">{formatPrice(plan.price)}</span>
                <span className="text-zinc-500">/mês</span>
              </p>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-zinc-300">
                    <CheckIcon className="h-5 w-5 shrink-0 text-amber-400" aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={ROUTES.CRIAR_BARBEARIA}
                className={`mt-8 block w-full rounded-xl py-3.5 text-center text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] active:scale-[0.98] ${
                  plan.highlighted
                    ? 'bg-amber-500 text-zinc-950 hover:bg-amber-400'
                    : 'border border-zinc-600 bg-transparent text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800'
                }`}
              >
                {plan.cta}
              </Link>
            </article>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-zinc-500">
          Cancele quando quiser. Sem multa, sem burocracia.
        </p>
      </div>
    </section>
  );
}
