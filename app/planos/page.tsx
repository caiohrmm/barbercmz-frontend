'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { getPlans } from '@/lib/plans';
import { ROUTES } from '@/lib/constants';

function formatPrice(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatBarbers(max: number): string {
  if (max >= 99) return '5+ barbeiros';
  if (max === 1) return '1 barbeiro';
  return `até ${max} barbeiros`;
}

export default function PlanosPage() {
  const { data: plans = [], isLoading, error } = useQuery({
    queryKey: ['plans', 'public'],
    queryFn: getPlans,
  });

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link
            href={ROUTES.HOME}
            className="text-lg font-semibold text-zinc-900 hover:text-amber-600"
          >
            BarberCMZ
          </Link>
          <div className="flex gap-3">
            <Link
              href={ROUTES.PLANOS}
              className="text-sm font-medium text-amber-600"
              aria-current="page"
            >
              Planos
            </Link>
            <Link
              href={ROUTES.LOGIN}
              className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              Entrar
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-zinc-900 sm:text-4xl">
            Planos para sua barbearia
          </h1>
          <p className="mt-3 text-lg text-zinc-600">
            Agenda, clientes e equipe em um só lugar. Comece com 30 dias grátis.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-800">
            <SparklesIcon className="h-5 w-5" aria-hidden />
            30 dias grátis para testar — sem compromisso
          </div>
        </div>

        {error && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-medium text-red-800">Não foi possível carregar os planos.</p>
            <p className="mt-1 text-sm text-red-700">Tente novamente em instantes.</p>
          </div>
        )}

        {isLoading && (
          <div className="mt-12 flex justify-center py-12">
            <div
              className="h-10 w-10 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"
              aria-hidden
            />
          </div>
        )}

        {!isLoading && !error && plans.length > 0 && (
          <ul className="mt-12 grid gap-6 sm:grid-cols-3">
            {plans.map((plan) => (
              <li
                key={plan.id}
                className="flex flex-col rounded-2xl border-2 border-zinc-200 bg-white p-6 shadow-sm transition hover:border-amber-200 hover:shadow-md"
              >
                <h2 className="text-xl font-semibold text-zinc-900">{plan.name}</h2>
                <p className="mt-2 text-2xl font-bold text-amber-600">
                  {formatPrice(plan.priceMonthly)}
                  <span className="text-base font-normal text-zinc-500">/mês</span>
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  {formatBarbers(plan.maxBarbers)}
                </p>
                {plan.features && plan.features.length > 0 && (
                  <ul className="mt-6 flex-1 space-y-2 text-sm text-zinc-600">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircleIcon
                          className="h-5 w-5 shrink-0 text-green-500 mt-0.5"
                          aria-hidden
                        />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <Link
                  href={ROUTES.CRIAR_BARBEARIA}
                  className="mt-6 block w-full rounded-xl bg-amber-500 py-3 text-center text-sm font-semibold text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                >
                  Começar com 30 dias grátis
                </Link>
              </li>
            ))}
          </ul>
        )}

        {!isLoading && !error && plans.length === 0 && (
          <div className="mt-12 rounded-2xl border border-zinc-200 bg-white p-12 text-center">
            <p className="font-medium text-zinc-600">Nenhum plano disponível no momento.</p>
            <p className="mt-1 text-sm text-zinc-500">
              Entre em contato ou tente novamente mais tarde.
            </p>
          </div>
        )}

        <p className="mt-12 text-center text-sm text-zinc-500">
          Ao criar sua barbearia e escolher um plano, você ganha 30 dias para demonstrar o sistema.
        </p>
      </main>
    </div>
  );
}
